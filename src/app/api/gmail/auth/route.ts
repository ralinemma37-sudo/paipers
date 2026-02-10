import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const platform = url.searchParams.get("platform") ?? "web";

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const redirectUri =
    process.env.GOOGLE_GMAIL_REDIRECT_URI ??
    "https://paipers.vercel.app/api/gmail/callback";

  const scope = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
  ].join(" ");

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("access_type", "offline");
  authUrl.searchParams.set("prompt", "consent"); // IMPORTANT pour refresh_token
  authUrl.searchParams.set("scope", scope);

  // On passe platform au callback
  authUrl.searchParams.set("state", JSON.stringify({ platform }));

  return NextResponse.redirect(authUrl.toString());
}
