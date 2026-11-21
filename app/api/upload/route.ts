import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { runtimeEnv } from "@/lib/runtime-env";

type R2BucketLike = {
  put: (
    key: string,
    value: ReadableStream | ArrayBuffer,
    options?: { httpMetadata?: { contentType?: string } },
  ) => Promise<unknown>;
};


const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") {
    return NextResponse.json({ error: "Not authorised." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File is larger than the 100 MB limit." },
      { status: 400 },
    );
  }

  const env = runtimeEnv;
  const bucket = env.BUCKET as R2BucketLike | undefined;

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

  if (!bucket) {
    // Local dev fallback: store uploads in public/uploads.
    try {
      const { mkdir, writeFile } = await import("node:fs/promises");
      const path = await import("node:path");
      const dir = path.join(process.cwd(), "public", "uploads");
      await mkdir(dir, { recursive: true });
      const filename = `${crypto.randomUUID()}-${safeName}`;
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(path.join(dir, filename), bytes);
      return NextResponse.json({
        ok: true,
        key: filename,
        url: `/uploads/${filename}`,
      });
    } catch {
      return NextResponse.json(
        {
          error:
            "R2 storage is not configured. Add an R2 binding named BUCKET in cloudflare.config.ts (or pass an external URL instead).",
        },
        { status: 503 },
      );
    }
  }

  const key = `academy/${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName}`;

  try {
    await bucket.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || "application/octet-stream" },
    });
    const publicBase = String(env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
    return NextResponse.json({
      ok: true,
      key,
      url: publicBase ? `${publicBase}/${key}` : `/api/files/${key}`,
    });
  } catch {
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
