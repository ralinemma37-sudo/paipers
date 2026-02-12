import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const platform = url.searchParams.get("platform") ?? "web";
  const userId = url.searchParams.get("user_id") ?? "";

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
  authUrl.searchParams.set("prompt", "consent");
  authUrl.searchParams.set("scope", scope);

  // ✅ ON PASSE userId DANS LE STATE
  authUrl.searchParams.set(
    "state",
    encodeURIComponent(
      JSON.stringify({
        platform,
        userId,
      })
    )
  );

  return NextResponse.redirect(authUrl.toString());
}
