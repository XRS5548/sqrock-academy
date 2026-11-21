import { getObject } from "@/lib/r2";

export async function GET(
  _request: Request,
  ctx: { params: Promise<{ key: string[] }> },
) {
  const { key } = await ctx.params;
  const objectKey = key.join("/");

  try {
    const object = await getObject(objectKey);
    if (!object) return new Response("Not found", { status: 404 });

    return new Response(object.body, {
      headers: {
        "content-type":
          object.headers.get("content-type") ?? "application/octet-stream",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Storage not configured", { status: 503 });
  }
}
