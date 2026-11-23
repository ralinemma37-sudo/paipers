/**
 * SEC-A1/A2 (E13, 23/11/2026) — réponse commune des anciennes routes API désactivées.
 * 410 neutre : aucun accès Supabase, OpenAI ou autre service, aucune lecture du corps, des cookies ni des
 * variables d'environnement. Voir aiRoutesLockdown.verify.ts.
 */
export const LEGACY_API_GONE_BODY = { error: "gone" } as const;

export function legacyApiGoneResponse(): Response {
  return new Response(JSON.stringify(LEGACY_API_GONE_BODY), {
    status: 410,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
