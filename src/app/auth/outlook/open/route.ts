import { parseAccountScope } from "../../../../lib/accountScope";
import { encodeOAuthState } from "../../../../lib/oauthState";
import { NextRequest, NextResponse } from "next/server";

const OUTLOOK_SCOPES = [
  "offline_access",
  "openid",
  "profile",
  "email",
  "Mail.Read",
] as const;

/**
 * Démarre le flux OAuth Microsoft (comptes personnels + Microsoft 365).
 * Query : user_id (obligatoire), platform, account_scope (aligné Gmail).
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id")?.trim();
  const platform = req.nextUrl.searchParams.get("platform")?.trim() || "mobile";
  const accountScope = parseAccountScope(req.nextUrl.searchParams.get("account_scope"));

  if (!userId) {
    return NextResponse.json({ error: "missing_user_id" }, { status: 400 });
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "missing_microsoft_oauth_env" }, { status: 500 });
  }

  const tenant = process.env.MICROSOFT_TENANT_ID || "common";
  const state = encodeOAuthState({ user_id: userId, platform, account_scope: accountScope });

  const authorize = new URL(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`);
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("response_mode", "query");
  authorize.searchParams.set("scope", OUTLOOK_SCOPES.join(" "));
  authorize.searchParams.set("state", state);

  return NextResponse.redirect(authorize.toString());
}
