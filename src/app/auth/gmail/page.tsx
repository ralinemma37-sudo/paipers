import { redirect } from "next/navigation";

export default function GmailAuthPage({
  searchParams,
}: {
  searchParams: { platform?: string; user_id?: string };
}) {
  const platform = searchParams.platform ?? "web";
  const userId = searchParams.user_id ?? "";

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri = "https://paipers.vercel.app/auth/gmail/callback";

  const scope = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
  ].join(" ");

  // ✅ IMPORTANT: PAS de encodeURIComponent ici
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
