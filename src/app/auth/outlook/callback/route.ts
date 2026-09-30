import { oauthSuccessHtml } from "../../../../lib/oauthSuccessHtml";
import { decodeOAuthState } from "../../../../lib/oauthState";
import {
  upsertEmailConnection,
  userFacingEmailConnectionDbError,
} from "../../../../lib/upsertEmailConnection";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const OUTLOOK_SCOPES = [
  "offline_access",
  "openid",
  "profile",
  "email",
  "Mail.Read",
];

/**
 * Callback OAuth Microsoft → upsert external_connections (provider = outlook).
 * Aligné sur external_connections (user_id, provider, account_scope).
 */
export async function GET(req: NextRequest) {
  const url = req.nextUrl;
  const err = url.searchParams.get("error");
  const errDesc = url.searchParams.get("error_description");
  if (err) {
    return NextResponse.json({ error: err, error_description: errDesc }, { status: 400 });
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

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;
  const redirectUri = process.env.MICROSOFT_REDIRECT_URI;
  const tenant = process.env.MICROSOFT_TENANT_ID || "common";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!clientId || !clientSecret || !redirectUri || !supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: "server_misconfigured" }, { status: 500 });
  }

  const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
  const tokenRes = await fetch(tokenUrl, {
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
    return NextResponse.json({ error: "token_exchange_failed", detail: tokenJson }, { status: 502 });
  }

  const refreshToken = tokenJson.refresh_token as string | undefined;
  const accessToken = tokenJson.access_token as string | undefined;
  if (!refreshToken) {
    return NextResponse.json(
      { error: "no_refresh_token", hint: "ensure offline_access scope and consent" },
      { status: 502 }
    );
  }

  let accountEmail: string | null = null;
  let providerAccountId: string | null = null;
  if (accessToken) {
    const meRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (meRes.ok) {
      const me = await meRes.json();
      accountEmail =
        (typeof me.mail === "string" && me.mail) ||
        (typeof me.userPrincipalName === "string" && me.userPrincipalName) ||
        null;
      providerAccountId = typeof me.id === "string" ? me.id : null;
    }
  }

  const supabase = createClient(supabaseUrl, serviceKey);
  const expiresIn = typeof tokenJson.expires_in === "number" ? tokenJson.expires_in : 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  const { error: upErr, userMessage } = await upsertEmailConnection(supabase, {
    user_id: state.user_id,
    provider: "outlook",
    account_scope: state.account_scope,
    account_email: accountEmail,
    provider_account_id: providerAccountId,
    refresh_token: refreshToken,
    access_token: accessToken ?? null,
    expires_at: expiresAt,
    scopes: OUTLOOK_SCOPES,
    metadata: {
      connected_via: "vercel_oauth_outlook",
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

  return new NextResponse(oauthSuccessHtml("Outlook"), {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
