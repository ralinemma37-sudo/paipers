/**
 * SEC-A1/A2 (E13, 23/11/2026) — route désactivée : réponse 410 neutre.
 * Ancien comportement : sans contrôle ; téléchargeait un fichier du stockage et l'envoyait en entier à
 * OpenAI. La V2 utilise la fonction Supabase analyze-document, pas cette route.
 * Aucun appelant actif dans le site, dans l'appli V2 (/app) ni dans les versions mobiles (audit E12).
 * Le code d'origine reste dans l'historique Git. Voir src/lib/server/aiRoutesLockdown.verify.ts.
 */
import { legacyApiGoneResponse } from "@/lib/server/legacyApiGone";

export async function POST() {
  return legacyApiGoneResponse();
}
