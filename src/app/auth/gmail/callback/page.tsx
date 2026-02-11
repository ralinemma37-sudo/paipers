import { redirect } from "next/navigation";
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
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}

async function getGmailProfile(accessToken: string) {
  const res = await fetch(
    "https://gmail.googleapis.com/gmail/v1/users/me/profile",
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json as { emailAddress: string };
}

export default async function GmailCallbackPage({
  searchParams,
}: {
  searchParams: { code?: string; state?: string };
}) {
  try {
    const code = searchParams.code;
    if (!code) redirect("paipersmobile://profil/gmail?status=error");

    let platform = "web";
    let userId = "";

    try {
      const st = JSON.parse(decodeURIComponent(searchParams.state ?? "{}"));
      platform = st?.platform ?? "web";
      userId = st?.userId ?? "";
    } catch {}

    const redirectUri =
      "https://paipers.vercel.app/auth/gmail/callback";

    const tokens = await exchangeCodeForTokens(code!, redirectUri);
    const profile = await getGmailProfile(tokens.access_token);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (!userId)
      redirect("paipersmobile://profil/gmail?status=missing_user");

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

    if (error) throw new Error(error.message);

    if (platform === "mobile") {
      redirect("paipersmobile://profil/gmail?status=connected");
    }

    redirect("/profil/gmail?status=connected");
  } catch {
    redirect("paipersmobile://profil/gmail?status=error");
  }
}
