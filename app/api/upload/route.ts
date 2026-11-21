import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { putObject, publicUrl } from "@/lib/r2";

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

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `academy/${new Date().getFullYear()}/${crypto.randomUUID()}-${safeName}`;
  const bytes = await file.arrayBuffer();

  try {
    await putObject(
      key,
      bytes,
      file.type || "application/octet-stream",
    );
    return NextResponse.json({
      ok: true,
      key,
      url: publicUrl(key),
    });
  } catch (error) {
    console.error("upload failed", error);
    const reason =
      error instanceof Error ? error.message : "Unknown storage error.";
    return NextResponse.json(
      {
        error: `Upload failed: ${reason}`,
      },
      { status: 500 },
    );
  }
}
