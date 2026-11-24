/**
 * SEC-GMAIL-LEGACY (phase 2B, 24/11/2026) — route désactivée : réponse 410 neutre.
 * Ancien comportement : secret passé dans l'adresse ; lisait toutes les clés Gmail (ancienne table des connexions) et importait pour tous les comptes. Remplacée par la fonction Supabase surveil-mailboxes.
 * Aucun appelant dans l'appli V2 (/app), l'appli iOS ni les fonctions Supabase (audit phase 2A).
 * Le code d'origine reste dans l'historique Git. Voir src/lib/server/aiRoutesLockdown.verify.ts.
 */
import { legacyApiGoneResponse } from "@/lib/server/legacyApiGone";

export async function GET() {
  return legacyApiGoneResponse();
}
