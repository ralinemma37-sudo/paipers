import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json({
    ok: true,
    disabled: true,
    message: "process-document disabled. Use /api/process-new-document instead.",
  });
}
