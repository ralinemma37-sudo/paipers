/**
 * Catalogue de sites officiels — liens externes uniquement.
 * Paipers redirige ; ne réalise aucune démarche et ne stocke aucun identifiant.
 * Aligné sur paipers-mobile/src/lib/officialServices (périmètre web prudent).
 */

export type DemarcheCategoryId =
  | "identite"
  | "impots"
  | "sante"
  | "logement"
  | "emploi"
  | "vehicule"
  | "entreprise"
  | "prestations";

export type DemarcheLink = {
  id: string;
  title: string;
  description: string;
  officialUrl: string;
  officialDomain: string;
};

export type DemarcheCategory = {
  id: DemarcheCategoryId;
  label: string;
  links: DemarcheLink[];
};

export const DEMARCHE_DISCLAIMER =
  "Vous quittez Paipers pour ouvrir un site officiel. Vérifiez toujours l’adresse. Paipers ne réalise aucune démarche à votre place et ne demande jamais vos identifiants de services publics.";

export const DEMARCHE_SUBTITLE =
  "Retrouve rapidement les principaux services officiels pour effectuer tes démarches.";

export const DEMARCHE_CATEGORIES: DemarcheCategory[] = [
  {
    id: "identite",
    label: "Identité et état civil",
    links: [
      {
        id: "ants-identite",
        title: "ANTS",
        description: "Carte d’identité, passeport et titres officiels.",
        officialUrl: "https://ants.gouv.fr",
        officialDomain: "ants.gouv.fr",
      },
      {
        id: "service-public-etat-civil",
        title: "Service-Public.fr",
        description: "État civil, actes et démarches du quotidien.",
        officialUrl: "https://www.service-public.fr",
        officialDomain: "service-public.fr",
      },
    ],
  },
  {
    id: "impots",
    label: "Impôts",
    links: [
      {
        id: "impots-gouv",
        title: "impots.gouv.fr",
        description: "Espace particulier et professionnel, déclarations, TVA.",
        officialUrl: "https://www.impots.gouv.fr",
        officialDomain: "impots.gouv.fr",
      },
    ],
  },
  {
    id: "sante",
    label: "Santé",
    links: [
      {
        id: "ameli",
        title: "Ameli",
        description: "Remboursements, carte Vitale, attestations.",
        officialUrl: "https://www.ameli.fr",
        officialDomain: "ameli.fr",
      },
    ],
  },
  {
    id: "logement",
    label: "Logement",
    links: [
      {
        id: "caf-logement",
        title: "CAF",
        description: "Aides au logement (APL) et services en ligne.",
        officialUrl: "https://www.caf.fr",
        officialDomain: "caf.fr",
      },
      {
        id: "service-public-logement",
        title: "Service-Public — Logement",
        description: "Informations officielles sur le logement.",
        officialUrl: "https://www.service-public.fr/particuliers/vosdroits/logement",
        officialDomain: "service-public.fr",
      },
    ],
  },
  {
    id: "emploi",
    label: "Emploi",
    links: [
      {
        id: "france-travail",
        title: "France Travail",
        description: "Espace demandeur d’emploi, offres et accompagnement.",
        officialUrl: "https://www.francetravail.fr",
        officialDomain: "francetravail.fr",
      },
    ],
  },
  {
    id: "vehicule",
    label: "Véhicule",
    links: [
      {
        id: "ants-vehicule",
        title: "ANTS — Permis & carte grise",
        description: "Permis de conduire, carte grise et titres véhicule.",
        officialUrl: "https://ants.gouv.fr",
        officialDomain: "ants.gouv.fr",
      },
    ],
  },
  {
    id: "entreprise",
    label: "Entreprise",
    links: [
      {
        id: "urssaf",
        title: "URSSAF",
        description: "Cotisations, auto-entrepreneur, espace employeur.",
        officialUrl: "https://www.urssaf.fr",
        officialDomain: "urssaf.fr",
      },
      {
        id: "inpi",
        title: "INPI",
        description: "Création d’entreprise, formalités et marques.",
        officialUrl: "https://www.inpi.fr",
        officialDomain: "inpi.fr",
      },
      {
        id: "entreprendre",
        title: "Entreprendre — Service-public",
        description: "Démarches et obligations officielles pour les entreprises.",
        officialUrl: "https://entreprendre.service-public.fr",
        officialDomain: "entreprendre.service-public.fr",
      },
    ],
  },
  {
    id: "prestations",
    label: "Prestations sociales",
    links: [
      {
        id: "caf-prestations",
        title: "CAF",
        description: "Allocations familiales et prestations.",
        officialUrl: "https://www.caf.fr",
        officialDomain: "caf.fr",
      },
      {
        id: "info-retraite",
        title: "Info-retraite",
        description: "Relevé de carrière et informations retraite.",
        officialUrl: "https://www.info-retraite.fr",
        officialDomain: "info-retraite.fr",
      },
    ],
  },
];
