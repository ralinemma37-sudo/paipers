import { parseAccountScope } from "../../../../lib/accountScope";
import { resolveGmailOAuthEnv } from "../../../../lib/gmailOAuthEnv";
import { encodeOAuthState } from "../../../../lib/oauthState";
import { NextRequest, NextResponse } from "next/server";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
] as const;

function missingEnvHtml(missing: string[]) {
  const list = missing.map((k) => `<code>${k}</code>`).join(", ");
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Gmail — configuration manquante</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 520px; margin: 48px auto; padding: 0 20px; color: #1a2b4a; line-height: 1.5; }
    code { background: #f0f3f8; padding: 2px 6px; border-radius: 6px; font-size: 13px; }
    a { color: #1a2b4a; font-weight: 700; }
  </style>
</head>
<body>
  <h1>Connexion Gmail indisponible</h1>
  <p>Variables manquantes côté serveur : ${list}.</p>
  <p>Ajoute-les dans <code>.env.local</code> (voir <code>.env.gmail.example</code>), puis redémarre <code>npm run dev</code>.</p>
  <p><a href="/profil/gmail">← Retour</a></p>
</body>
</html>`;
}

/**
 * Démarre le flux OAuth Google (Gmail).
 * Query : user_id (obligatoire), platform, account_scope.
 */
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("user_id")?.trim();
  const platform = req.nextUrl.searchParams.get("platform")?.trim() || "mobile";
  const accountScope = parseAccountScope(req.nextUrl.searchParams.get("account_scope"));

  if (!userId) {
    return NextResponse.json({ error: "missing_user_id" }, { status: 400 });
  }

  const oauth = resolveGmailOAuthEnv();
  if (!oauth.ok) {
    return new NextResponse(missingEnvHtml(oauth.missing), {
      status: 500,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
  const { clientId, redirectUri } = oauth;

  const state = encodeOAuthState({ user_id: userId, platform, account_scope: accountScope });

  const authorize = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authorize.searchParams.set("client_id", clientId);
  authorize.searchParams.set("response_type", "code");
  authorize.searchParams.set("redirect_uri", redirectUri);
  authorize.searchParams.set("scope", GMAIL_SCOPES.join(" "));
  authorize.searchParams.set("access_type", "offline");
  authorize.searchParams.set("prompt", "consent");
  authorize.searchParams.set("state", state);

  return NextResponse.redirect(authorize.toString());
}
