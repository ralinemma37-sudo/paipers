/**
 * Mentions légales (France — loi pour la confiance dans l’économie numérique, art. 6 III).
 * 05/11/2026 : éditeur = SAS PLAIDOC (Kbis du 05/11/2026).
 */
import { PUBLISHER_IDENTITY_FR, PUBLISHER_PLACEHOLDERS_FR as P } from "@/legal/publisherPlaceholdersFr";

export const LEGAL_NOTICES_LAST_UPDATED = "5 novembre 2026";

export type LegalSection = { title: string; paragraphs: string[] };

export const legalNoticesSectionsFr: LegalSection[] = [
  {
    title: "1. Éditeur du site et de l’application",
    paragraphs: [
      "Le site plaidoc.fr et l’application Plaidoc (iPhone, Android et web) sont édités par " + PUBLISHER_IDENTITY_FR + ".",
      P.tva + ".",
      "Directrice de la publication : " + P.directeurPublication + ".",
      "Contact : " + P.contactEmail + ".",
    ],
  },
  {
    title: "2. Hébergement",
    paragraphs: [
      "Données de l’application (comptes, documents, base de données) : Supabase, Inc., 970 Toa Payoh North #07-04, Singapour 318992 — https://supabase.com. Les données sont hébergées dans l’Union européenne (Paris, infrastructure Amazon Web Services).",
      "Site web : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — https://vercel.com.",
    ],
  },
  {
    title: "3. Propriété intellectuelle",
    paragraphs: [
      "La marque Plaidoc, le site, l’application et tous leurs éléments (textes, graphismes, logos, icônes, structure, code) appartiennent à la société PLAIDOC ou à ses partenaires et sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite est interdite.",
      "Les documents que vous déposez dans Plaidoc restent les vôtres (voir les conditions générales).",
    ],
  },
  {
    title: "4. Données personnelles",
    paragraphs: [
      "Le traitement de vos données personnelles est décrit dans la politique de confidentialité, accessible depuis l’application (Profil › Confidentialité et légal) et sur le site (plaidoc.fr/legal/politique-confidentialite). Pour exercer vos droits : " + P.contactEmail + ".",
    ],
  },
  {
    title: "5. Signaler un contenu",
    paragraphs: [
      "Pour signaler un contenu illicite ou nous contacter au sujet du site ou de l’application : " + P.contactEmail + ".",
    ],
  },
];

export const LEGAL_NOTICES_DISCLAIMER_FR = "Contact : contact@plaidoc.fr.";
