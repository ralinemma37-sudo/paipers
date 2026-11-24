/**
 * SEC-GMAIL-LEGACY (phase 2B, 24/11/2026) — route désactivée : réponse 410 neutre.
 * Ancien comportement : sans authentification ; à partir d'un identifiant utilisateur libre, lisait sa clé Gmail (ancienne table des connexions) et importait jusqu'à 20 PDF dans son compte.
 * Aucun appelant dans l'appli V2 (/app), l'appli iOS ni les fonctions Supabase (audit phase 2A).
 * Le code d'origine reste dans l'historique Git. Voir src/lib/server/aiRoutesLockdown.verify.ts.
 */
import { legacyApiGoneResponse } from "@/lib/server/legacyApiGone";

export async function POST() {
  return legacyApiGoneResponse();
}
