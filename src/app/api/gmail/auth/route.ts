/**
 * SEC-1C (complément, 23/11/2026) — verrou de l'ancienne entrée Gmail /api/gmail/auth.
 * Ancien parcours : user_id libre mis dans un state non signé, puis redirection vers Google. Désormais refusé :
 * réponse 410, page neutre, aucune redirection, aucun appel, aucune écriture. La requête n'est pas lue.
 * Voir src/lib/server/oauth/legacyRefusal.ts et legacyApiKillswitch.verify.ts.
 */
import { legacyOAuthRefusalResponse } from "@/lib/server/oauth/legacyRefusal";

export async function GET() {
  return legacyOAuthRefusalResponse("gmail");
}
