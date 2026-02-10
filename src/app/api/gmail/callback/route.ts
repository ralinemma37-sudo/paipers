import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  if (!res.ok) throw new Error(`Google token error: ${JSON.stringify(json)}`);
  return json as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
    token_type: string;
  };
}

async function getGmailProfile(accessToken: string) {
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(`Gmail profile error: ${JSON.stringify(json)}`);
  return json as { emailAddress: string };
}

async function getUserIdFromSupabaseAuthCookie(req: Request) {
  // IMPORTANT : on utilise le service role pour écrire en DB
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // On lit le JWT Supabase depuis les cookies (session web)
  // -> Si tu fais l'OAuth depuis mobile sans cookie web, on ne saura pas l'user_id.
  // -> Dans ce cas, il faut passer un "user_id" dans state (je peux te le faire après).
  const cookie = req.headers.get("cookie") ?? "";
  const { data, error } = await supabase.auth.getUser(cookie as any);

  if (error || !data?.user) return null;
  return data.user.id;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const stateRaw = url.searchParams.get("state") ?? "{}";

    if (!code) {
      return NextResponse.redirect("https://paipers.vercel.app/auth/gmail/callback?status=error");
    }

    let platform = "web";
    try {
      const st = JSON.parse(stateRaw);
      platform = st?.platform ?? "web";
    } catch {}

    const redirectUri =
      process.env.GOOGLE_GMAIL_REDIRECT_URI ??
      "https://paipers.vercel.app/api/gmail/callback";

    const tokens = await exchangeCodeForTokens(code, redirectUri);

    const profile = await getGmailProfile(tokens.access_token);
    const gmailEmail = profile.emailAddress;

    // ⚠️ user_id : si l'OAuth est lancé depuis mobile, tu n'auras pas de cookie web.
    // Pour l'instant on essaye quand même (si tu es loggé web).
    const userId = await getUserIdFromSupabaseAuthCookie(req);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // upsert connexion (si user_id est null, on stocke quand même par email, mais idéalement il faut user_id)
    const payload: any = {
      email: gmailEmail,
      refresh_token: tokens.refresh_token ?? null,
      updated_at: new Date().toISOString(),
    };
    if (userId) payload.user_id = userId;

    const { error: upsertError } = await supabase
      .from("gmail_connections")
      .upsert(payload, { onConflict: "email" });

    if (upsertError) throw new Error(upsertError.message);

    // redirection vers ta page callback web (qui deep link vers l'app)
    return NextResponse.redirect(
      `https://paipers.vercel.app/auth/gmail/callback?platform=${encodeURIComponent(platform)}&status=connected`
    );
  } catch (e: any) {
    return NextResponse.redirect(
      `https://paipers.vercel.app/auth/gmail/callback?status=error`
    );
  }
}
