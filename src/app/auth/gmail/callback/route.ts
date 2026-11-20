/**
 * SEC-1C phase 0 — verrou OAuth : callback Gmail (aucun échange de code, aucun jeton enregistré).
 * Ancien parcours (callback Google, state non signé) refusé : réponse 410, page neutre, aucune redirection, aucun appel, aucune écriture.
 * La requête n'est pas lue (aucun user_id, state ni code utilisé). Voir src/lib/server/oauth/legacyRefusal.ts.
 */
import { legacyOAuthRefusalResponse } from "@/lib/server/oauth/legacyRefusal";

export async function GET() {
  return legacyOAuthRefusalResponse("gmail");
}
