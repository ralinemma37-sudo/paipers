/** URI de callback OAuth Gmail (prod Paipers). */
export const GMAIL_OAUTH_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI?.trim() ||
  process.env.GOOGLE_GMAIL_REDIRECT_URI?.trim() ||
  "https://paipers.vercel.app/auth/gmail/callback";

export function resolveGmailOAuthEnv():
  | { ok: true; clientId: string; redirectUri: string }
  | { ok: false; error: string; missing: string[] } {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
  const redirectUri = GMAIL_OAUTH_REDIRECT_URI;
  const missing: string[] = [];
  if (!clientId) missing.push("GOOGLE_CLIENT_ID");
  if (!redirectUri) missing.push("GOOGLE_REDIRECT_URI");
  if (missing.length > 0) {
    return { ok: false, error: "missing_google_oauth_env", missing };
  }
  return { ok: true, clientId, redirectUri };
}
