import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function parseAccountScope(raw: string | null): "personal" | "pro" | "family" {
  if (raw === "pro" || raw === "family" || raw === "personal") return raw;
  return "personal";
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const platform = url.searchParams.get("platform") ?? "web";
  const userId = url.searchParams.get("user_id") ?? "";
  const accountScope = parseAccountScope(url.searchParams.get("account_scope"));

  if (!userId) {
    return new NextResponse(
      `
      <main style="padding:24px;font-family:system-ui">
        <h1 style="font-size:20px;font-weight:800">Erreur /auth/outlook</h1>
        <p style="margin-top:8px">user_id manquant dans l’URL.</p>
        <p style="margin-top:12px">Exemple :</p>
        <pre style="margin-top:8px;background:#f5f5f5;padding:12px;border-radius:8px">/auth/outlook?platform=mobile&user_id=...&account_scope=personal</pre>
      </main>
      `,
      { headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  const clientId = process.env.MICROSOFT_CLIENT_ID;
  const redirectUri =
    process.env.MICROSOFT_REDIRECT_URI ?? "https://paipers.vercel.app/auth/outlook/callback";

  if (!clientId) {
    return NextResponse.json({ error: "missing_microsoft_oauth_env" }, { status: 500 });
  }

  const tenant = process.env.MICROSOFT_TENANT_ID || "common";

  const state = JSON.stringify({ platform, userId, account_scope: accountScope });

  const scope = [
    "offline_access",
    "openid",
    "profile",
    "email",
    "User.Read",
    "Mail.Read",
  ].join(" ");

  const authUrl = new URL(`https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize`);
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("response_mode", "query");
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
