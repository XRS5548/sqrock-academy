import { runtimeEnv } from "@/lib/runtime-env";

type R2ObjectLike = {
  body: ReadableStream;
  httpMetadata?: { contentType?: string };
};

type R2BucketLike = {
  get: (key: string) => Promise<R2ObjectLike | null>;
};


export async function GET(
  _request: Request,
  ctx: { params: Promise<{ key: string[] }> },
) {
  const { key } = await ctx.params;
  const objectKey = key.join("/");
  const env = runtimeEnv;
  const bucket = env.BUCKET as R2BucketLike | undefined;
  if (!bucket) {
    return new Response("Storage not configured", { status: 503 });
  }

  const object = await bucket.get(objectKey);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "content-type":
        object.httpMetadata?.contentType ?? "application/octet-stream",
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
