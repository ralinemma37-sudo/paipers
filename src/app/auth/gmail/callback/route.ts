import { resolveGmailServerEnv } from "../../../../lib/gmailOAuthEnv";
import { oauthSuccessHtml } from "../../../../lib/oauthSuccessHtml";
import { decodeOAuthState } from "../../../../lib/oauthState";
import {
  upsertEmailConnection,
  userFacingEmailConnectionDbError,
} from "../../../../lib/upsertEmailConnection";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
];

/**
 * Callback OAuth Google → upsert external_connections (provider = gmail).
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const err = url.searchParams.get("error");
  if (err) {
    return NextResponse.json({ error: err }, { status: 400 });
  }

  const code = url.searchParams.get("code");
  const stateB64 = url.searchParams.get("state");
  if (!code || !stateB64) {
    return NextResponse.json({ error: "missing_code_or_state" }, { status: 400 });
  }

  const state = decodeOAuthState(stateB64);
  if (!state) {
    return NextResponse.json({ error: "invalid_state" }, { status: 400 });
  }

  const serverEnv = resolveGmailServerEnv();
  if (!serverEnv.ok) {
    return NextResponse.json(
      { error: "server_misconfigured", missing: serverEnv.missing },
      { status: 500 }
    );
  }
  const { clientId, clientSecret, redirectUri, supabaseUrl, serviceKey } = serverEnv.env;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenJson = await tokenRes.json();
  if (!tokenRes.ok) {
    const googleError = String(tokenJson?.error || "");
    if (googleError === "invalid_grant") {
      const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gmail — reconnexion</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 520px; margin: 48px auto; padding: 0 20px; color: #1a2b4a; line-height: 1.5; }
    a { color: #1a2b4a; font-weight: 700; }
  </style>
</head>
<body>
  <h1>Connexion Gmail à recommencer</h1>
  <p>Le code Google a expiré ou a déjà été utilisé (souvent après un rafraîchissement de page).</p>
  <p>Ne recharge pas cette URL. Repars depuis Profil → Gmail → Connecter.</p>
  <p><a href="/profil/gmail">← Retour à Gmail</a></p>
</body>
</html>`;
      return new NextResponse(html, {
        status: 400,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    return NextResponse.json(
      { error: "token_exchange_failed", detail: tokenJson },
      { status: 502 },
    );
  }

  const refreshToken = tokenJson.refresh_token as string | undefined;
  const accessToken = tokenJson.access_token as string | undefined;
  if (!refreshToken) {
    return NextResponse.json(
      { error: "no_refresh_token", hint: "use prompt=consent and access_type=offline" },
      { status: 502 }
    );
  }

  let accountEmail: string | null = null;
  if (accessToken) {
    const meRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (meRes.ok) {
      const me = await meRes.json();
      accountEmail = typeof me.email === "string" ? me.email : null;
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const expiresIn = typeof tokenJson.expires_in === "number" ? tokenJson.expires_in : 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { error: upErr, userMessage } = await upsertEmailConnection(supabase, {
    user_id: state.user_id,
    provider: "gmail",
    account_scope: state.account_scope,
    account_email: accountEmail,
    refresh_token: refreshToken,
    access_token: accessToken ?? null,
    expires_at: expiresAt,
    scopes: GMAIL_SCOPES,
    metadata: {
      connected_via: "vercel_oauth_gmail",
      platform: state.platform,
    },
    updated_at: new Date().toISOString(),
  });

  if (upErr) {
    return NextResponse.json(
      {
        error: "supabase_upsert_failed",
        userMessage: userMessage ?? userFacingEmailConnectionDbError(upErr),
        detail: upErr,
      },
      { status: 500 }
    );
  }

  return new NextResponse(oauthSuccessHtml("Gmail"), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
