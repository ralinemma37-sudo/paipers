import { NextRequest, NextResponse } from "next/server";

/**
 * Point d’entrée mobile : /auth/outlook?user_id=…&platform=mobile&account_scope=personal
 * Redirige vers /auth/outlook/open (même modèle que /auth/gmail → /auth/gmail/open).
 */
export async function GET(req: NextRequest) {
  const dest = req.nextUrl.clone();
  dest.pathname = "/auth/outlook/open";
  return NextResponse.redirect(dest);
}
