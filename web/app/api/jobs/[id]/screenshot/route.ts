import { NextResponse } from "next/server";

import { getSnapshot } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "missing job id" }, { status: 400 });
  }

  const snapshot = getSnapshot(id);
  if (snapshot === null) {
    return NextResponse.json({ error: "job not found" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") ?? "gif";

  const isJpg = format === "jpg";
  const b64 = isJpg ? snapshot.screenshot_jpg : snapshot.screenshot_gif;
  const mime = isJpg ? "image/jpeg" : "image/gif";

  if (!b64) {
    return NextResponse.json({ error: "screenshot not found" }, { status: 404 });
  }

  const buffer = Buffer.from(b64, "base64");
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
