/**
 * SEC-1 — Échange d'un jeton de renouvellement Google contre un jeton d'accès (fetch injecté pour les tests).
 */

export type GoogleCredentials = { clientId: string; clientSecret: string } | null;

export function googleCredentialsFromEnv(): GoogleCredentials {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

/** Renvoie le jeton d'accès, ou lève une erreur (le message n'est jamais renvoyé au client). */
export async function exchangeGoogleRefreshToken(
  fetchImpl: typeof fetch,
  credentials: GoogleCredentials,
  refreshToken: string,
): Promise<string> {
  if (!credentials) throw new Error("google_not_configured");
  const res = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: credentials.clientId,
      client_secret: credentials.clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const json = (await res.json().catch(() => ({}))) as { access_token?: unknown };
  if (!res.ok || typeof json.access_token !== "string" || !json.access_token) {
    throw new Error("google_token_error");
  }
  return json.access_token;
}
