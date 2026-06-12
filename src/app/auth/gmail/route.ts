import { NextRequest, NextResponse } from "next/server";

/**
 * Point d’entrée mobile : /auth/gmail?user_id=…&platform=mobile&account_scope=personal
 * → /auth/gmail/open (référence alignée sur Outlook).
 */
export async function GET(req: NextRequest) {
  const dest = req.nextUrl.clone();
  dest.pathname = "/auth/gmail/open";
  return NextResponse.redirect(dest);
}
