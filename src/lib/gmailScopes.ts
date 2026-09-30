/**
 * Scopes OAuth Gmail demandés (lecture/import + envoi).
 * Source unique pour open + callback Vercel.
 */
export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  GMAIL_SEND_SCOPE,
  "https://www.googleapis.com/auth/userinfo.email",
  "openid",
] as const;

export type GmailScopeList = readonly string[] | string[];

/** Normalise une liste ou une chaîne Google `scope` (espace-séparée). */
export function normalizeOAuthScopeList(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((s) => String(s || "").trim())
      .filter(Boolean);
  }
  if (typeof raw === "string") {
    return raw
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/**
 * Scopes effectivement accordés : préfère la réponse token Google,
 * sinon la liste demandée (fallback).
 */
export function resolveGrantedGmailScopes(tokenScopeField: unknown): string[] {
  const fromToken = normalizeOAuthScopeList(tokenScopeField);
  if (fromToken.length > 0) return fromToken;
  return [...GMAIL_SCOPES];
}

export function gmailScopesIncludeSend(scopes: GmailScopeList | null | undefined): boolean {
  const list = normalizeOAuthScopeList(scopes);
  return list.some(
    (s) =>
      s === GMAIL_SEND_SCOPE ||
      s === "https://mail.google.com/" ||
      /(^|[/.])gmail\.send$/i.test(s),
  );
}
