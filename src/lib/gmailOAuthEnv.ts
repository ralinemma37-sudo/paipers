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

export type GmailServerEnv = {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  supabaseUrl: string;
  serviceKey: string;
};

/** Variables serveur pour le callback OAuth Gmail (types sûrs après guard). */
export function resolveGmailServerEnv():
  | { ok: true; env: GmailServerEnv }
  | { ok: false; missing: string[] } {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim() ?? "";
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "";
  const redirectUri = GMAIL_OAUTH_REDIRECT_URI;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.supabase_service_role_key?.trim() ||
    "";

  const missing: string[] = [];
  if (!clientId) missing.push("GOOGLE_CLIENT_ID");
  if (!clientSecret) missing.push("GOOGLE_CLIENT_SECRET");
  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
  if (missing.length > 0) return { ok: false, missing };

  return {
    ok: true,
    env: { clientId, clientSecret, redirectUri, supabaseUrl, serviceKey },
  };
}
