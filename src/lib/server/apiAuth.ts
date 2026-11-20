/**
 * SEC-1 (20/11/2026) — Outils communs de sécurité des routes API serveur.
 *
 * Règles :
 * - L'identité vient UNIQUEMENT d'un jeton Supabase vérifié côté serveur par `auth.getUser()`
 *   (signature, expiration, révocation contrôlées par le serveur d'authentification).
 *   Un en-tête `Authorization` présent mais non vérifié ne prouve rien. `getSession()` n'est jamais utilisé.
 * - Aucun identifiant utilisateur fourni par le client n'est une preuve d'identité.
 * - Les réponses d'erreur sont génériques : jamais de message d'exception, de jeton ni de contenu.
 * - Ordre imposé dans chaque route : identité → entrées → droits sur la ressource → quota → effets.
 *
 * Ce module ne dépend pas de `next/*` : les gestionnaires restent testables hors serveur.
 */

import { createHash, timingSafeEqual } from "node:crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AuthenticatedUser = { userId: string; email: string | null };

/** Dépendances d'authentification (remplacées par des simulations dans les tests). */
export type AuthDeps = {
  /** Vérifie un jeton d'accès Supabase auprès du serveur d'authentification. */
  verifyAccessToken: (token: string) => Promise<AuthenticatedUser | null>;
  /** Vérifie la session Supabase portée par les cookies du site (appels depuis le même site). */
  verifyCookieSession: () => Promise<AuthenticatedUser | null>;
};

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "bad_request"
  | "payload_too_large"
  | "rate_limited"
  | "unavailable"
  | "internal_error";

const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  unauthorized: "Connexion requise. Reconnecte-toi puis réessaie.",
  forbidden: "Action non autorisée.",
  not_found: "Élément introuvable.",
  bad_request: "Requête invalide.",
  payload_too_large: "Contenu trop volumineux.",
  rate_limited: "Trop de demandes. Réessaie un peu plus tard.",
  unavailable: "Service momentanément indisponible.",
  internal_error: "Une erreur est survenue. Réessaie plus tard.",
};

/**
 * Réponse d'erreur générique. `message` permet un texte fixe plus précis pour l'utilisateur
 * (jamais un message d'exception ni une donnée interne).
 */
export function jsonError(
  status: number,
  code: ApiErrorCode,
  opts?: { message?: string; headers?: Record<string, string> },
): Response {
  return Response.json(
    { error: opts?.message ?? ERROR_MESSAGES[code], code },
    { status, headers: opts?.headers },
  );
}

function normalizeUser(u: AuthenticatedUser | null | undefined): AuthenticatedUser | null {
  if (!u || typeof u.userId !== "string" || !UUID_RE.test(u.userId)) return null;
  return { userId: u.userId, email: typeof u.email === "string" ? u.email : null };
}

/** Caractères possibles d'un JWT (base64url et points). */
const BEARER_RE = /^Bearer\s+([A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+)$/;

/**
 * Identité vérifiée de l'appelant, ou null (→ 401).
 * - En-tête `Authorization` présent : il DOIT être un Bearer bien formé ET vérifié ; sinon null
 *   (pas de repli silencieux sur les cookies).
 * - Sans en-tête : session par cookies, vérifiée par `auth.getUser()`.
 * Toute exception (réseau, jeton expiré, configuration) → null.
 */
export async function authenticateRequest(req: Request, deps: AuthDeps): Promise<AuthenticatedUser | null> {
  try {
    const raw = req.headers.get("authorization");
    if (raw !== null) {
      const m = BEARER_RE.exec(raw.trim());
      if (!m) return null;
      return normalizeUser(await deps.verifyAccessToken(m[1]));
    }
    return normalizeUser(await deps.verifyCookieSession());
  } catch {
    return null;
  }
}

/** Implémentations réelles (serveur). Non utilisées par les tests. */
export function defaultAuthDeps(): AuthDeps {
  return {
    async verifyAccessToken(token: string) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
      if (!url || !anon) return null;
      const client = createClient(url, anon, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.auth.getUser(token);
      if (error || !data?.user?.id) return null;
      return { userId: data.user.id, email: data.user.email ?? null };
    },
    async verifyCookieSession() {
      const { createSupabaseServerClient } = await import("@/lib/supabaseServer");
      const client = await createSupabaseServerClient();
      const { data, error } = await client.auth.getUser();
      if (error || !data?.user?.id) return null;
      return { userId: data.user.id, email: data.user.email ?? null };
    },
  };
}

/** Comparaison de secrets à temps constant (empreintes de même longueur). */
export function safeEqualSecret(provided: string | null | undefined, expected: string): boolean {
  if (typeof provided !== "string" || provided.length === 0 || expected.length === 0) return false;
  const a = createHash("sha256").update(provided, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

/** Lecture bornée du corps JSON (objet attendu). */
export async function readJsonObject(
  req: Request,
  maxBytes: number,
): Promise<{ ok: true; value: Record<string, unknown> } | { ok: false; response: Response }> {
  let text: string;
  try {
    text = await req.text();
  } catch {
    return { ok: false, response: jsonError(400, "bad_request") };
  }
  if (Buffer.byteLength(text, "utf8") > maxBytes) {
    return { ok: false, response: jsonError(413, "payload_too_large") };
  }
  try {
    const parsed: unknown = text.trim() ? JSON.parse(text) : {};
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, response: jsonError(400, "bad_request") };
    }
    return { ok: true, value: parsed as Record<string, unknown> };
  } catch {
    return { ok: false, response: jsonError(400, "bad_request") };
  }
}

/** Chaîne bornée : undefined si absente, "too_long" si trop longue, "invalid" si mauvais type. */
export function boundedString(
  value: unknown,
  maxLength: number,
): string | undefined | "invalid" | "too_long" {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") return "invalid";
  if (value.length > maxLength) return "too_long";
  return value;
}

// ---------------------------------------------------------------------------
// Quotas IA — réutilise la fonction serveur consume_ai_quota
// (dépôt paipers-mobile, migration 20260909130000) :
//   consume_ai_quota(p_user_id uuid, p_feature text, p_minute_limit integer, p_daily_limit integer)
//   → TABLE(allowed boolean, minute_used integer, daily_used integer, retry_after_seconds integer)
//   SECURITY DEFINER, exécutable par service_role uniquement ; p_feature ~ '^[a-z0-9_-]{1,40}$' ;
//   compte AVANT l'appel IA, verrou par (utilisateur, fonction) contre les appels simultanés.
// Différence voulue avec les fonctions serveur mobiles (qui laissent passer en cas de panne) :
// ici, compteur indisponible ou réponse illisible → REFUS (503), car ces routes étaient ouvertes.
// ---------------------------------------------------------------------------

export const WEB_AI_LIMITS = {
  web_classify: { perMinute: 10, perDay: 100 },
  web_rename: { perMinute: 10, perDay: 100 },
  web_read_pdf: { perMinute: 5, perDay: 50 },
  web_generate: { perMinute: 6, perDay: 60 },
  web_webhook_classify: { perMinute: 30, perDay: 500 },
} as const;

export type WebAiFeature = keyof typeof WEB_AI_LIMITS;

export type QuotaVerdict = { allowed: true } | { allowed: false; retryAfterSeconds: number };

export type QuotaDeps = {
  /** Renvoie le verdict, ou null si le compteur est indisponible ou la réponse illisible. */
  consume: (userId: string, feature: WebAiFeature, perMinute: number, perDay: number) => Promise<QuotaVerdict | null>;
};

/** Lecture stricte de la réponse de consume_ai_quota ; illisible → null (refus). */
export function parseQuotaRows(data: unknown): QuotaVerdict | null {
  const row = Array.isArray(data) ? (data[0] as Record<string, unknown> | undefined) : undefined;
  if (!row || typeof row.allowed !== "boolean") return null;
  if (row.allowed) return { allowed: true };
  const retry = Number(row.retry_after_seconds);
  return { allowed: false, retryAfterSeconds: Number.isFinite(retry) && retry > 0 ? Math.ceil(retry) : 3600 };
}

/** Renvoie une réponse de refus (429 / 503) ou null si l'appel peut continuer. */
export async function enforceAiQuota(deps: QuotaDeps, userId: string, feature: WebAiFeature): Promise<Response | null> {
  const limits = WEB_AI_LIMITS[feature];
  let verdict: QuotaVerdict | null;
  try {
    verdict = await deps.consume(userId, feature, limits.perMinute, limits.perDay);
  } catch {
    verdict = null;
  }
  if (!verdict) return jsonError(503, "unavailable");
  if (!verdict.allowed) {
    return jsonError(429, "rate_limited", { headers: { "Retry-After": String(verdict.retryAfterSeconds) } });
  }
  return null;
}

export function quotaDepsFromServiceClient(getService: () => SupabaseClient): QuotaDeps {
  return {
    async consume(userId, feature, perMinute, perDay) {
      const { data, error } = await getService().rpc("consume_ai_quota", {
        p_user_id: userId,
        p_feature: feature,
        p_minute_limit: perMinute,
        p_daily_limit: perDay,
      });
      if (error) return null;
      return parseQuotaRows(data);
    },
  };
}
