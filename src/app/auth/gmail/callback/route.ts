import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

async function exchangeCodeForTokens(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json as { access_token: string; refresh_token?: string };
}

async function getGmailProfile(accessToken: string) {
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json as { emailAddress: string };
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

function safeParseState(state?: string) {
  const fallback = { platform: "web", userId: "" };
  if (!state) return fallback;

  for (const s of decodeTries(state)) {
    // 1) Essai JSON
    try {
      const obj = JSON.parse(s);
      const platform = obj?.platform ?? "web";
      const userId = obj?.userId ?? obj?.user_id ?? "";
      if (userId) return { platform, userId };
    } catch {}

    // 2) Fallback UUID dans la string
    const uuid = extractUuid(s);
    if (uuid) return { platform: "web", userId: uuid };
  }

  return fallback;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.json({ error, params: Object.fromEntries(url.searchParams.entries()) });
    }

    if (!code) {
      return NextResponse.json({
        route_handler: "OK",
        error: "Missing code",
        params: Object.fromEntries(url.searchParams.entries()),
      });
    }

    const { platform, userId } = safeParseState(state ?? undefined);

    if (!userId) {
      return NextResponse.json({
        route_handler: "OK",
        error: "Missing userId in state",
        received_state: state,
        decoded_tries: state ? decodeTries(state) : [],
      });
    }

    const redirectUri = "https://paipers.vercel.app/auth/gmail/callback";

    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const profile = await getGmailProfile(tokens.access_token);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error: upsertError } = await supabase.from("gmail_connections").upsert(
      {
        user_id: userId,
        email: profile.emailAddress,
        refresh_token: tokens.refresh_token ?? null,
      },
      { onConflict: "user_id" }
    );

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message });
    }

    if (platform === "mobile") {
      return NextResponse.redirect(new URL("/auth/gmail/open?status=connected", url.origin));
    }

    return NextResponse.redirect(new URL("/profil/gmail?status=connected", url.origin));
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) });
  }
}
