/**
 * SEC-1C (complément, 23/11/2026) — verrou de /api/google/save-connection.
 * Ancien comportement : enregistrait les jetons Google de la session NextAuth sur le user_id LIBRE fourni dans le
 * corps (rattachement d'une boîte au compte d'un tiers). Désormais refusé : réponse 410, page neutre, aucune
 * lecture du corps ni des cookies, aucune écriture. Voir legacyApiKillswitch.verify.ts.
 */
import { legacyOAuthRefusalResponse } from "@/lib/server/oauth/legacyRefusal";

export async function POST() {
  return legacyOAuthRefusalResponse("gmail");
}
