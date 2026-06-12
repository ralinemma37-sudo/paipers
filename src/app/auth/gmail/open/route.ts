import { parseAccountScope } from "../../../../lib/accountScope";
import { encodeOAuthState } from "../../../../lib/oauthState";
import { NextRequest, NextResponse } from "next/server";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
] as const;

/**
 * Démarre le flux OAuth Google (Gmail).
 * Query : user_id (obligatoire), platform, account_scope.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id")?.trim();
  const platform = req.nextUrl.searchParams.get("platform")?.trim() || "mobile";
  const accountScope = parseAccountScope(req.nextUrl.searchParams.get("account_scope"));

  if (!userId) {
    return NextResponse.json({ error: "missing_user_id" }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "missing_google_oauth_env" }, { status: 500 });
  }

  const state = encodeOAuthState({ user_id: userId, platform, account_scope: accountScope });

  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", GMAIL_SCOPES.join(" "));
  authorize.searchParams.set("access_type", "offline");
  authorize.searchParams.set("prompt", "consent");
  authorize.searchParams.set("state", state);

  return NextResponse.redirect(authorize.toString());
}
