/**
 * SEC-1C (complément, 23/11/2026) — verrou de l'ancien retour Gmail /api/gmail/callback.
 * Ancien parcours : échange du code Google et enregistrement des jetons dans gmail_connections. Désormais refusé :
 * réponse 410, page neutre, aucun échange de code, aucune écriture, aucune redirection. La requête n'est pas lue.
 * Voir src/lib/server/oauth/legacyRefusal.ts et legacyApiKillswitch.verify.ts.
 */
import { legacyOAuthRefusalResponse } from "@/lib/server/oauth/legacyRefusal";

export async function GET() {
  return legacyOAuthRefusalResponse("gmail");
}
