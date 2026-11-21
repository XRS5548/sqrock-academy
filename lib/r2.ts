import { envValue } from "@/lib/runtime-env";

type R2BucketLike = {
  put: (
    key: string,
    value: ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string } },
  ) => Promise<unknown>;
  get: (key: string) => Promise<{
    body: ReadableStream;
    httpMetadata?: { contentType?: string };
  } | null>;
  delete?: (key: string) => Promise<void>;
};

type StorageMode = "s3" | "binding" | "local";

type StorageConfig = {
  mode: StorageMode;
  bucket?: R2BucketLike;
  accountId?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  bucketName: string;
  publicUrl: string;
};

const DEFAULT_BUCKET = "sqrock-academy";
const REGION = "auto";
const SERVICE = "s3";

function normalizeAccountId(raw: string) {
  const value = raw.trim();
  if (!value) return "";

  // Accept a pasted endpoint such as
  // https://<account-id>.r2.cloudflarestorage.com and extract the id.
  const hexMatch = value.match(/([a-f0-9]{32})/i);
  if (hexMatch) return hexMatch[1].toLowerCase();

  return value
    .replace(/^https?:\/\//i, "")
    .replace(/\/.*$/, "")
    .split(".")[0]
    .trim()
    .toLowerCase();
}

function normalizeBucketName(raw: string) {
  const value = raw.trim();
  if (!/^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$/.test(value)) {
    throw new Error(
      "R2_BUCKET_NAME is invalid. Use the exact bucket name (lowercase letters, numbers and hyphens only).",
    );
  }
  return value;
}

function storageConfig(): StorageConfig {
  const accountId = normalizeAccountId(
    String(envValue("R2_ACCOUNT_ID") ?? ""),
  );
  const accessKeyId = String(envValue("R2_ACCESS_KEY_ID") ?? "").trim();
  const secretAccessKey = String(envValue("R2_SECRET_ACCESS_KEY") ?? "").trim();
  const bucketName = normalizeBucketName(
    String(envValue("R2_BUCKET_NAME") ?? "") || DEFAULT_BUCKET,
  );
  const publicUrl = String(envValue("R2_PUBLIC_URL") ?? "")
    .trim()
    .replace(/\/$/, "");

  if (accountId && accessKeyId && secretAccessKey) {
    return {
      mode: "s3",
      accountId,
      accessKeyId,
      secretAccessKey,
      bucketName,
      publicUrl,
    };
  }

  const candidate = envValue<unknown>("BUCKET");
  if (
    candidate &&
    typeof candidate === "object" &&
    typeof (candidate as R2BucketLike).put === "function"
  ) {
    return {
      mode: "binding",
      bucket: candidate as R2BucketLike,
      bucketName,
      publicUrl,
    };
  }

  return { mode: "local", bucketName, publicUrl };
}

function encodeKey(key: string) {
  return key
    .split("/")
    .map((part) =>
      encodeURIComponent(part).replace(
        /[!'()*]/g,
        (character) =>
          `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
      ),
    )
    .join("/");
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(value: ArrayBuffer | string) {
  const data =
    typeof value === "string" ? new TextEncoder().encode(value) : value;
  return toHex(await crypto.subtle.digest("SHA-256", data));
}

async function hmac(
  key: ArrayBuffer | Uint8Array,
  value: string,
): Promise<ArrayBuffer> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    toArrayBuffer(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(value),
  );
}

function toArrayBuffer(value: ArrayBuffer | Uint8Array): ArrayBuffer {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function resolveEndpoint(config: StorageConfig) {
  const override = String(envValue("R2_ENDPOINT") ?? "").trim();
  if (override) {
    try {
      const url = new URL(override);
      if (url.protocol !== "https:") throw new Error("https required");
      return url.origin;
    } catch {
      throw new Error(
        "R2_ENDPOINT must be a valid https URL, for example https://<account-id>.r2.cloudflarestorage.com",
      );
    }
  }

  if (!/^[a-f0-9]{32}$/i.test(config.accountId ?? "")) {
    throw new Error(
      "R2_ACCOUNT_ID must be the 32-character Cloudflare Account ID, not an Access Key ID, token or a URL. Copy it from the Cloudflare dashboard.",
    );
  }

  return `https://${config.accountId}.r2.cloudflarestorage.com`;
}

async function signedRequest(
  config: StorageConfig,
  method: "GET" | "PUT" | "DELETE",
  key: string,
  body?: ArrayBuffer,
  contentType?: string,
) {
  const endpoint = resolveEndpoint(config);
  const url = new URL(`${endpoint.replace(/\/$/, "")}/${config.bucketName}`);
  const canonicalUri = `${url.pathname.replace(/\/$/, "")}/${encodeKey(key)}`;
  const host = url.host;

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const payload = body ?? new ArrayBuffer(0);
  const payloadHash = await sha256Hex(payload);

  const canonicalHeaders =
    `host:${host}\n` +
    `x-amz-content-sha256:${payloadHash}\n` +
    `x-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest =
    `${method}\n${canonicalUri}\n\n${canonicalHeaders}\n` +
    `${signedHeaders}\n${payloadHash}`;

  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign =
    `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n` +
    (await sha256Hex(canonicalRequest));

  let signingKey = toArrayBuffer(
    new TextEncoder().encode(`AWS4${config.secretAccessKey}`),
  );
  signingKey = await hmac(signingKey, dateStamp);
  signingKey = await hmac(signingKey, REGION);
  signingKey = await hmac(signingKey, SERVICE);
  signingKey = await hmac(signingKey, "aws4_request");
  const signature = toHex(await hmac(signingKey, stringToSign));

  const headers: Record<string, string> = {
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    Authorization:
      `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
  if (contentType) headers["content-type"] = contentType;

  let response: Response;
  try {
    response = await fetch(`${url.origin}${canonicalUri}`, {
      method,
      headers,
      body: method === "PUT" ? payload : undefined,
    });
  } catch (error) {
    const cause = (
      error as { cause?: { code?: string; message?: string } }
    )?.cause;
    const detail = `${error instanceof Error ? error.message : ""} ${
      cause?.code ?? ""
    } ${cause?.message ?? ""}`;
    if (/ssl|tls|handshake|certificate|fetch failed/i.test(detail)) {
      throw new Error(
        `Could not connect to R2 (TLS handshake failed). Check that R2_ACCOUNT_ID is the 32-character Account ID (not the Access Key ID or a URL) and that R2_BUCKET_NAME exists. Endpoint used: ${url.host}`,
      );
    }
    throw error;
  }

  return response;
}

async function localPath(key: string) {
  const path = await import("node:path");
  const safeKey = key.replace(/^\/+/, "");
  const root = path.join(process.cwd(), "public", "uploads");
  const resolved = path.resolve(root, safeKey);
  if (!resolved.startsWith(path.resolve(root))) {
    throw new Error("Invalid storage key.");
  }
  return resolved;
}

function contentTypeFor(key: string) {
  const ext = key.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    pdf: "application/pdf",
    pptx:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  };
  return (ext && types[ext]) || "application/octet-stream";
}

export function isStorageConfigured() {
  return storageConfig().mode !== "local";
}

export function publicUrl(key: string) {
  const config = storageConfig();
  if (config.publicUrl) return `${config.publicUrl}/${key}`;
  if (config.mode === "local") return `/uploads/${key}`;
  return `/api/files/${key}`;
}

export async function putObject(
  key: string,
  body: ArrayBuffer,
  contentType?: string,
) {
  const config = storageConfig();

  if (config.mode === "s3") {
    const response = await signedRequest(
      config,
      "PUT",
      key,
      body,
      contentType,
    );
    if (!response.ok) {
      throw new Error(`R2 upload failed (${response.status}).`);
    }
    return;
  }

  if (config.mode === "binding") {
    await config.bucket!.put(key, body, {
      httpMetadata: { contentType },
    });
    return;
  }

  const { mkdir, writeFile } = await import("node:fs/promises");
  const path = await localPath(key);
  const pathModule = await import("node:path");
  await mkdir(pathModule.dirname(path), { recursive: true });
  await writeFile(path, Buffer.from(body));
}

export async function getObject(key: string): Promise<Response | null> {
  const config = storageConfig();

  if (config.mode === "s3") {
    const response = await signedRequest(config, "GET", key);
    if (response.status === 404) return null;
    if (!response.ok) {
      throw new Error(`R2 download failed (${response.status}).`);
    }
    return new Response(response.body, {
      headers: {
        "content-type":
          response.headers.get("content-type") ?? contentTypeFor(key),
      },
    });
  }

  if (config.mode === "binding") {
    const object = await config.bucket!.get(key);
    if (!object) return null;
    return new Response(object.body, {
      headers: {
        "content-type":
          object.httpMetadata?.contentType ?? contentTypeFor(key),
      },
    });
  }

  try {
    const { readFile } = await import("node:fs/promises");
    const bytes = await readFile(await localPath(key));
    return new Response(bytes, {
      headers: { "content-type": contentTypeFor(key) },
    });
  } catch {
    return null;
  }
}

export async function deleteObject(key: string | null) {
  if (!key) return;
  const config = storageConfig();

  if (config.mode === "s3") {
    const response = await signedRequest(config, "DELETE", key);
    if (!response.ok && response.status !== 404) {
      throw new Error(`R2 delete failed (${response.status}).`);
    }
    return;
  }

  if (config.mode === "binding") {
    await config.bucket!.delete?.(key);
    return;
  }

  try {
    const { unlink } = await import("node:fs/promises");
    await unlink(await localPath(key));
  } catch {
    // Already gone.
  }
}
