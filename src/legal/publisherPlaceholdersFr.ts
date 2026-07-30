/**
 * Informations éditeur — source unique.
 * Valeurs reprises de paipers-mobile/src/legal/publisherPlaceholdersFr.ts
 *
 * Aucune donnée n’est définitive tant qu’elle n’a pas été renseignée
 * par les fondatrices. Ne pas inventer de dénomination, SIREN, adresse, etc.
 */

export const PUBLISHER_FIELD_LABELS_FR = {
  denomination: "Dénomination sociale",
  formeJuridique: "Forme juridique",
  capitalSocial: "Capital social",
  siegeAdresse: "Adresse du siège social",
  rcsVille: "Ville du RCS",
  rcsNumero: "Numéro RCS / SIREN",
  tva: "N° TVA intracommunautaire",
  directeurPublication: "Directeur de la publication",
  contactEmail: "Contact légal / données personnelles (e-mail)",
  contactSupport: "Support utilisateur (e-mail ou URL)",
  hebergeurNom: "Nom de l’hébergeur",
  hebergeurAdresse: "Adresse / localisation hébergeur",
  prestataireAuth: "Prestataire d’authentification",
} as const;

export type PublisherFieldKey = keyof typeof PUBLISHER_FIELD_LABELS_FR;

/**
 * Textes bruts tels que dans le mobile (à ne pas présenter comme définitifs
 * tant que le statut n’est pas « complete »).
 */
export const PUBLISHER_PLACEHOLDERS_RAW_FR: Record<PublisherFieldKey, string> = {
  denomination: "« À compléter : dénomination sociale »",
  formeJuridique: "« À compléter : forme juridique (ex. SAS, SASU, EURL) »",
  capitalSocial: "« À compléter : montant du capital social ou « non applicable » »",
  siegeAdresse: "« À compléter : adresse complète du siège social »",
  rcsVille: "« À compléter : ville du RCS »",
  rcsNumero: "« À compléter : numéro RCS / SIREN »",
  tva: "« À compléter : numéro TVA intracommunautaire ou « non applicable » »",
  directeurPublication: "« À compléter : nom du directeur de la publication »",
  contactEmail: "« À compléter : contact légal / données personnelles (e-mail) »",
  contactSupport: "« À compléter : support utilisateur (e-mail ou URL) »",
  hebergeurNom:
    "Supabase, Inc. (et/ou région de déploiement à préciser selon votre projet)",
  hebergeurAdresse:
    "Voir documentation Supabase — localisation des données selon paramétrage du projet",
  prestataireAuth: "Supabase Auth (compte utilisateur, mot de passe haché)",
};

/**
 * Statut de chaque champ :
 * - missing : jamais renseigné (fondatrices)
 * - provisional : mention technique mobile, non validée juridiquement
 * - complete : uniquement si une vraie valeur définitive est fournie (aucun aujourd’hui)
 */
export const PUBLISHER_FIELD_STATUS: Record<
  PublisherFieldKey,
  "missing" | "provisional" | "complete"
> = {
  denomination: "missing",
  formeJuridique: "missing",
  capitalSocial: "missing",
  siegeAdresse: "missing",
  rcsVille: "missing",
  rcsNumero: "missing",
  tva: "missing",
  directeurPublication: "missing",
  contactEmail: "missing",
  contactSupport: "missing",
  hebergeurNom: "provisional",
  hebergeurAdresse: "provisional",
  prestataireAuth: "provisional",
};

/** Liste exacte à renseigner / valider par les fondatrices. */
export const PUBLISHER_FIELDS_TO_COMPLETE_BY_FOUNDERS: PublisherFieldKey[] = (
  Object.keys(PUBLISHER_FIELD_STATUS) as PublisherFieldKey[]
).filter((k) => PUBLISHER_FIELD_STATUS[k] !== "complete");

const MISSING_PREFIX = "Information à compléter";

/**
 * Affichage public d’un champ éditeur.
 * En développement : toujours préfixé « Information à compléter » si non complete.
 * En production : même règle pour missing ; provisional reste signalé comme non définitif.
 */
export function formatPublisherFieldForDisplay(key: PublisherFieldKey): string {
  const status = PUBLISHER_FIELD_STATUS[key];
  const label = PUBLISHER_FIELD_LABELS_FR[key];
  const raw = PUBLISHER_PLACEHOLDERS_RAW_FR[key];
  const isDev = process.env.NODE_ENV === "development";

  if (status === "complete") return raw;

  if (status === "missing") {
    return `${MISSING_PREFIX} — ${label}`;
  }

  // provisional
  if (isDev) {
    return `${MISSING_PREFIX} — ${label} (mention technique non validée : ${raw})`;
  }
  return `${MISSING_PREFIX} — ${label}`;
}

/** Objet prêt à injecter dans CGU / politique (remplace les placeholders bruts). */
export function getPublisherPlaceholdersForDisplay(): Record<
  PublisherFieldKey,
  string
> {
  const out = {} as Record<PublisherFieldKey, string>;
  (Object.keys(PUBLISHER_FIELD_LABELS_FR) as PublisherFieldKey[]).forEach((key) => {
    out[key] = formatPublisherFieldForDisplay(key);
  });
  return out;
}

/**
 * Compat : ancien nom mobile. Ne plus utiliser pour l’affichage utilisateur
 * (préférer getPublisherPlaceholdersForDisplay).
 */
export const PUBLISHER_PLACEHOLDERS_FR = PUBLISHER_PLACEHOLDERS_RAW_FR;
