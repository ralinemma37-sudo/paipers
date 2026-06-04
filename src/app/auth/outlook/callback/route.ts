import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const OUTLOOK_SCOPES = [
  "offline_access",
  "openid",
  "profile",
  "email",
  "Mail.Read",
];

function requireEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function decodeTries(input: string) {
  const tries: string[] = [input];
  try {
    tries.push(decodeURIComponent(input));
  } catch {}
  try {
    tries.push(decodeURIComponent(decodeURIComponent(input)));
  } catch {}
  return tries;
}

function extractUuid(str: string) {
  const m = str.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return m?.[0] ?? "";
}

type ParsedState = {
  platform: string;
  userId: string;
  account_scope: "personal" | "pro" | "family";
};

function safeParseState(state?: string): ParsedState {
  const fallback: ParsedState = { platform: "web", userId: "", account_scope: "personal" };
  if (!state) return fallback;

  for (const s of decodeTries(state)) {
    try {
      const obj = JSON.parse(s);
      const platform = obj?.platform ?? "web";
      const userId = obj?.userId ?? obj?.user_id ?? "";
      const rawScope = obj?.account_scope ?? obj?.accountScope ?? "personal";
      const account_scope =
        rawScope === "pro" || rawScope === "family" || rawScope === "personal"
          ? rawScope
          : "personal";
      if (userId) return { platform, userId, account_scope };
    } catch {}

    const uuid = extractUuid(s);
    if (uuid) return { platform: "web", userId: uuid, account_scope: "personal" };
  }

  return fallback;
}

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const client_id = requireEnv("MICROSOFT_CLIENT_ID");
  const client_secret = requireEnv("MICROSOFT_CLIENT_SECRET");
  const tenant = process.env.MICROSOFT_TENANT_ID || "common";

  const tokenUrl = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id,
      client_secret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Microsoft token error: ${JSON.stringify(json)}`);
  }

  return json as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
    id_token?: string;
  };
}

function emailFromIdToken(idToken?: string): string | null {
  if (!idToken) return null;
  try {
    const parts = idToken.split(".");
    if (parts.length < 2) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8")
    ) as Record<string, unknown>;
    const candidates = [
      payload.preferred_username,
      payload.email,
      payload.upn,
      payload.unique_name,
    ];
    for (const c of candidates) {
      if (typeof c === "string" && c.includes("@")) return c;
    }
  } catch {
    /* ignore */
  }
  return null;
}

async function fetchGraphMe(accessToken: string): Promise<{
  mail?: string;
  userPrincipalName?: string;
  id?: string;
} | null> {
  const url =
    "https://graph.microsoft.com/v1.0/me?$select=id,mail,userPrincipalName,displayName";
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });
  const json = await res.json();
  if (!res.ok) return null;
  return json as { mail?: string; userPrincipalName?: string; id?: string };
}

/** Ne bloque pas la connexion si Graph /me échoue (comptes perso MSA parfois UnknownError). */
async function resolveMicrosoftIdentity(
  accessToken: string,
  idToken?: string
): Promise<{ accountEmail: string | null; providerAccountId: string | null; graphOk: boolean }> {
  let profile = await fetchGraphMe(accessToken);
  if (!profile) {
    await new Promise((r) => setTimeout(r, 400));
    profile = await fetchGraphMe(accessToken);
  }

  if (profile) {
    const accountEmail = profile.mail?.trim() || profile.userPrincipalName?.trim() || null;
    return {
      accountEmail,
      providerAccountId: profile.id ?? null,
      graphOk: true,
    };
  }

  const fromId = emailFromIdToken(idToken);
  return {
    accountEmail: fromId,
    providerAccountId: null,
    graphOk: false,
  };
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);

    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");
    const errorDescription = url.searchParams.get("error_description");

    if (error) {
      return NextResponse.json({
        error,
        error_description: errorDescription,
        params: Object.fromEntries(url.searchParams.entries()),
      });
    }

    if (!code) {
      return NextResponse.json({
        error: "Missing code",
        params: Object.fromEntries(url.searchParams.entries()),
      });
    }

    const { platform, userId, account_scope } = safeParseState(state ?? undefined);

    if (!userId) {
      return NextResponse.json({
        error: "Missing userId in state",
        received_state: state,
        decoded_tries: state ? decodeTries(state) : [],
      });
    }

    const redirectUri =
      process.env.MICROSOFT_REDIRECT_URI ?? "https://paipers.vercel.app/auth/outlook/callback";

    const tokens = await exchangeCodeForTokens(code, redirectUri);
    if (!tokens.refresh_token) {
      return NextResponse.json(
        { error: "no_refresh_token", hint: "offline_access scope required" },
        { status: 502 }
      );
    }

    const identity = await resolveMicrosoftIdentity(
      tokens.access_token,
      tokens.id_token
    );

    const supabase = createClient(
      requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requireEnv("SUPABASE_SERVICE_ROLE_KEY")
    );

    const expiresIn = typeof tokens.expires_in === "number" ? tokens.expires_in : 3600;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    const { error: upsertError } = await supabase.from("external_connections").upsert(
      {
        user_id: userId,
        provider: "outlook",
        account_scope,
        account_email: identity.accountEmail,
        provider_account_id: identity.providerAccountId,
        refresh_token: tokens.refresh_token,
        access_token: tokens.access_token,
        expires_at: expiresAt,
        scopes: OUTLOOK_SCOPES,
        metadata: {
          connected_via: "vercel_oauth_outlook",
          platform,
          graph_profile_ok: identity.graphOk,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,provider,account_scope" }
    );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    if (platform === "mobile") {
      return NextResponse.redirect(new URL("/auth/outlook/open?status=connected", url.origin));
    }

    return NextResponse.redirect(new URL("/profil/emails?status=outlook_connected", url.origin));
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
