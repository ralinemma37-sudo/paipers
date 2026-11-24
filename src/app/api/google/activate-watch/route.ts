/**
 * SEC-GMAIL-LEGACY (phase 2B, 24/11/2026) — route désactivée : réponse 410 neutre.
 * Ancien comportement : sans authentification ; abonnait n'importe quelle boîte Gmail (jeton fourni) au sujet Pub/Sub du projet.
 * Aucun appelant dans l'appli V2 (/app), l'appli iOS ni les fonctions Supabase (audit phase 2A).
 * Le code d'origine reste dans l'historique Git. Voir src/lib/server/aiRoutesLockdown.verify.ts.
 */
import { legacyApiGoneResponse } from "@/lib/server/legacyApiGone";

export async function POST() {
  return legacyApiGoneResponse();
}
