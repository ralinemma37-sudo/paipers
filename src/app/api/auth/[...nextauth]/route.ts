/**
 * SEC-1C (complément, 23/11/2026) — verrou de NextAuth (/api/auth/*), connexion Google avec accès Gmail.
 * Sans appelant (la connexion à Plaidoc passe par Supabase) ; elle fournissait la session utilisée par
 * /api/google/save-connection. GET et POST sont refusés : réponse 410, page neutre, aucune redirection,
 * aucun appel, aucun cookie. La requête n'est pas lue. Voir legacyApiKillswitch.verify.ts.
 */
import { legacyOAuthRefusalResponse } from "@/lib/server/oauth/legacyRefusal";

export async function GET() {
  return legacyOAuthRefusalResponse("gmail");
}

export async function POST() {
  return legacyOAuthRefusalResponse("gmail");
}
