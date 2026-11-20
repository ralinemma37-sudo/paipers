/**
 * SEC-1C phase 0 (20/11/2026) — « verrou OAuth » des parcours Gmail et Outlook.
 *
 * Ancien parcours vulnérable : `/auth/{gmail,outlook}[/open]?user_id=…` mettait un identifiant libre dans un
 * `state` non signé, et le callback rattachait les jetons de la boîte mail à ce compte. Tant que le parcours
 * sécurisé (phase 1 : ticket authentifié, state signé, finalisation par la même session) n'est pas en place,
 * TOUTES ces routes répondent 410 avec une page neutre.
 *
 * Garanties (vérifiées par oauthKillswitch.verify.ts) :
 * - la requête n'est jamais lue : aucun paramètre (user_id, state, code, error…) n'est utilisé ni renvoyé ;
 * - aucune redirection (aucun en-tête Location), donc jamais vers Google ou Microsoft ;
 * - aucun appel réseau, aucun échange de code, aucune lecture ni écriture de jetons, aucun accès Supabase ;
 * - aucune donnée interne dans la réponse ; page non mise en cache, sans référent transmis.
 *
 * Les connexions déjà établies (table external_connections) ne sont ni lues ni modifiées.
 */

export type LegacyOAuthProvider = "gmail" | "outlook";

const PROVIDER_LABEL: Record<LegacyOAuthProvider, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
};

/** Page HTML neutre : texte fixe, seul le nom du fournisseur varie (choisi par la route, jamais par la requête). */
export function legacyOAuthRefusalHtml(provider: LegacyOAuthProvider): string {
  const label = PROVIDER_LABEL[provider];
  return (
    `<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/>` +
    `<meta name="viewport" content="width=device-width, initial-scale=1"/>` +
    `<meta name="robots" content="noindex"/>` +
    `<title>Connexion ${label} indisponible</title></head>` +
    `<body style="font-family:system-ui,sans-serif;padding:24px;text-align:center;color:#1A2B4A">` +
    `<h1 style="font-size:20px">Connexion ${label} temporairement indisponible</h1>` +
    `<p>La connexion des messageries à Plaidoc est en cours de sécurisation.</p>` +
    `<p>Les boîtes mail déjà connectées continuent de fonctionner.</p>` +
    `<p style="color:#666;font-size:14px">Tu pourras connecter une nouvelle boîte dès la prochaine mise à jour de Plaidoc. ` +
    `Tu peux fermer cette page et revenir dans l'application.</p>` +
    `</body></html>`
  );
}

/** Réponse 410 du verrou. Ne dépend d'aucune donnée de la requête. */
export function legacyOAuthRefusalResponse(provider: LegacyOAuthProvider): Response {
  return new Response(legacyOAuthRefusalHtml(provider), {
    status: 410,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      // Le callback reçoit un `code` dans l'URL : ne jamais le transmettre comme référent.
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'",
    },
  });
}
