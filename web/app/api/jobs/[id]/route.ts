import { NextResponse } from "next/server";

import { getScanResult } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;

  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "missing job id" }, { status: 400 });
  }

  const result = await getScanResult(id);
  if (result === null) {
    return NextResponse.json({ error: "job not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
