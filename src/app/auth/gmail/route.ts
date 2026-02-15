import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);

  const platform = url.searchParams.get("platform") ?? "web";
  const userId = url.searchParams.get("user_id") ?? "";

  if (!userId) {
    return new NextResponse(
      `
      <main style="padding:24px;font-family:system-ui">
        <h1 style="font-size:20px;font-weight:800">Erreur /auth/gmail</h1>
        <p style="margin-top:8px">user_id manquant dans l’URL.</p>
        <pre style="margin-top:12px;background:#f5f5f5;padding:12px;border-radius:8px">${escapeHtml(
          request.url
        )}</pre>
        <p style="margin-top:12px">Exemple :</p>
        <pre style="margin-top:8px;background:#f5f5f5;padding:12px;border-radius:8px">/auth/gmail?platform=mobile&user_id=...</pre>
      </main>
      `,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
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

  return NextResponse.redirect(authUrl.toString());
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
