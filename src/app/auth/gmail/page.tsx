import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function GmailAuthPage({
  searchParams,
}: {
  searchParams: { platform?: string; user_id?: string };
}) {
  const platform = searchParams.platform ?? "web";
  const userId = searchParams.user_id ?? "";

  if (!userId) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <h1 style={{ fontSize: 20, fontWeight: 800 }}>
          Erreur : user_id manquant
        </h1>
        <p style={{ marginTop: 8 }}>
          L’URL doit être :
        </p>
        <pre style={{ marginTop: 12 }}>
          /auth/gmail?platform=web&user_id=TON_USER_ID
        </pre>
        <pre style={{ marginTop: 12, background: "#f5f5f5", padding: 12 }}>
          {JSON.stringify(searchParams, null, 2)}
        </pre>
      </main>
    );
  }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = "https://paipers.vercel.app/auth/gmail/callback";

  const scope = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
  ].join(" ");

  const state = JSON.stringify({ platform, userId });

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  redirect(authUrl.toString());
}
