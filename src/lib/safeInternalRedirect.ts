/**
 * SEC-LOGIN-NEXT (phase 2B, 24/11/2026) — destination après connexion (?next= / ?redirect=) de l'ancienne page
 * /login. Ancienne version : acceptait toute valeur commençant par « / » sauf « // ». Or le navigateur lit
 * « /\ » comme « // » et retire tabulations et sauts de ligne : « /\exemple.com » ou « /<TAB>/exemple.com »
 * menaient vers un autre site (Next 16 ouvre une adresse d'une autre origine par location.replace).
 *
 * Règle stricte : chemin absolu du site, sans caractère de contrôle, espace, antislash ni encodage de séparateur,
 * inchangé par l'analyse d'adresse du navigateur, et limité aux pages privées de l'appli (celles vers lesquelles
 * src/proxy.ts envoie lui-même avec ?next=). Sinon : page par défaut. Voir safeInternalRedirect.verify.ts.
 */
import { isPrivateAppPath } from "@/lib/authRoutePolicy";

export const SAFE_REDIRECT_DEFAULT = "/assistant";
const MAX_LENGTH = 2048;
const BASE = "https://interne.invalid";

export function safeInternalRedirect(raw: string | null | undefined): string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_LENGTH) return SAFE_REDIRECT_DEFAULT;
  // Caractères de contrôle, espaces et antislash : le navigateur les retire ou les lit comme « / ».
  if (/[\u0000- \u007F-\u009F\\]/.test(raw)) return SAFE_REDIRECT_DEFAULT;
  if (!raw.startsWith("/") || raw.startsWith("//")) return SAFE_REDIRECT_DEFAULT;
  // Séparateurs, points, « % » et caractères de contrôle encodés (y compris en double encodage).
  if (/%(2f|5c|2e|25|[01][0-9a-f]|7f)/i.test(raw)) return SAFE_REDIRECT_DEFAULT;

  let url: URL;
  try {
    url = new URL(raw, BASE);
  } catch {
    return SAFE_REDIRECT_DEFAULT;
  }
  if (url.origin !== BASE) return SAFE_REDIRECT_DEFAULT;
  const normalized = `${url.pathname}${url.search}${url.hash}`;
  // Toute normalisation (« .. », « . », caractères réécrits) signifie une valeur ambiguë.
  if (normalized !== raw) return SAFE_REDIRECT_DEFAULT;
  if (!isPrivateAppPath(url.pathname)) return SAFE_REDIRECT_DEFAULT;
  return normalized;
}
