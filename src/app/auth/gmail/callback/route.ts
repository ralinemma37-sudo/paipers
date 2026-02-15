import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

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

function safeParseState(state?: string) {
  if (!state) return { platform: "web", userId: "" };
  try {
    const decoded = decodeURIComponent(state);
    const obj = JSON.parse(decoded);
    return { platform: obj?.platform ?? "web", userId: obj?.userId ?? "" };
  } catch {
    return { platform: "web", userId: "" };
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  // ✅ marqueur: si tu vois ce JSON, c’est bien route.ts qui tourne
  if (!code) {
    return NextResponse.json({
      route_handler: "OK",
      error: error ?? "Missing code (route.ts)",
      params: Object.fromEntries(url.searchParams.entries()),
    });
  }

  const { platform, userId } = safeParseState(state ?? undefined);

  // ⚠️ IMPORTANT: dans ton URL on voit userId = "" => ça cassera l’upsert après
  if (!userId) {
    return NextResponse.json({
      route_handler: "OK",
      error: "Missing userId in state",
      received_state: state,
    });
  }

  try {
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
      return NextResponse.json({ route_handler: "OK", error: upsertError.message });
    }

    if (platform === "mobile") {
      return NextResponse.redirect(new URL("/auth/gmail/open?status=connected", url.origin));
    }
    return NextResponse.redirect(new URL("/profil/gmail?status=connected", url.origin));
  } catch (e: any) {
    return NextResponse.json({ route_handler: "OK", error: String(e?.message ?? e) });
  }
}
