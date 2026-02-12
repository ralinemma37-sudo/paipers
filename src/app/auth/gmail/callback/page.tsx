import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

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
  if (!res.ok) throw new Error(`token_exchange_failed: ${JSON.stringify(json)}`);

  return json as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}

async function getGmailProfile(accessToken: string) {
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`gmail_profile_failed: ${JSON.stringify(json)}`);

  return json as { emailAddress: string };
}

function safeParseState(state?: string) {
  if (!state) return { platform: "web", userId: "" };

  // Next et Google peuvent déjà encoder/décoder; on tente plusieurs fois sans crasher
  const tries = [state, decodeURIComponent(state)];
  for (const s of tries) {
    try {
      const obj = JSON.parse(s);
      return {
        platform: obj?.platform ?? "web",
        userId: obj?.userId ?? "",
      };
    } catch {}
  }

  return { platform: "web", userId: "" };
}

export default async function GmailCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; state?: string; error?: string };
}) {
  try {
    if (searchParams.error) {
      return (
        <main style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Erreur Google OAuth</h1>
          <p style={{ marginTop: 8 }}>{searchParams.error}</p>
        </main>
      );
    }

    const code = searchParams.code;
    if (!code) {
      return (
        <main style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Erreur</h1>
          <p style={{ marginTop: 8 }}>Missing code</p>
        </main>
      );
    }

    const { platform, userId } = safeParseState(searchParams.state);

    if (!userId) {
      return (
        <main style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Erreur</h1>
          <p style={{ marginTop: 8 }}>
            userId manquant dans le state. (mobile doit envoyer ?user_id=...)
          </p>
          <pre style={{ marginTop: 12, background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
            state reçu: {String(searchParams.state)}
          </pre>
        </main>
      );
    }

    const redirectUri = "https://paipers.vercel.app/auth/gmail/callback";

    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const profile = await getGmailProfile(tokens.access_token);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from("gmail_connections")
      .upsert(
        {
          user_id: userId,
          email: profile.emailAddress,
          refresh_token: tokens.refresh_token ?? null,
        },
        { onConflict: "user_id" }
      );

    if (error) {
      return (
        <main style={{ padding: 24, fontFamily: "system-ui" }}>
          <h1 style={{ fontSize: 20, fontWeight: 800 }}>Erreur Supabase</h1>
          <pre style={{ marginTop: 12, background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
            {error.message}
          </pre>
        </main>
      );
    }

    if (platform === "mobile") {
      redirect("/auth/gmail/open?status=connected");
    }

    redirect("/profil/gmail?status=connected");
  } catch (e: any) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>Erreur callback</h1>
        <pre style={{ marginTop: 12, background: "#f5f5f5", padding: 12, borderRadius: 8 }}>
          {String(e?.message ?? e)}
        </pre>
      </main>
    );
  }
}
