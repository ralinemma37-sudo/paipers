/**
 * Infère un `type` compatible /api/generate-document depuis la situation libre.
 * Réf. détection mobile analyzeRedigerRequest / redigerDocumentConfig (sous-ensemble mappé aux clés web existantes).
 * Ne modifie pas la route API.
 */

export type WebGenerateType =
  | "attestation_honneur"
  | "attestation_hebergement"
  | "demission"
  | "resiliation_internet"
  | "resiliation_assurance"
  | "lettre_simple"
  | "lettre_recommandee";

const TITLE_BY_TYPE: Record<WebGenerateType, string> = {
  attestation_honneur: "Attestation sur l’honneur",
  attestation_hebergement: "Attestation d’hébergement",
  demission: "Lettre de démission",
  resiliation_internet: "Résiliation Internet",
  resiliation_assurance: "Résiliation assurance",
  lettre_simple: "Lettre simple",
  lettre_recommandee: "Lettre recommandée",
};

export function titleForGenerateType(type: WebGenerateType): string {
  return TITLE_BY_TYPE[type];
}

export function inferWebGenerateType(situation: string): WebGenerateType {
  const t = situation
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (/demission|demissionnaire|quitter mon poste|rompre mon contrat de travail/.test(t)) {
    return "demission";
  }
  if (/attestation d.?hebergement|hebergeant|heberge/.test(t)) {
    return "attestation_hebergement";
  }
  if (/attestation sur l.?honneur|declaration sur l.?honneur|sous l.?honneur/.test(t)) {
    return "attestation_honneur";
  }
  if (/resili/.test(t) && /assurance|mutuelle/.test(t)) {
    return "resiliation_assurance";
  }
  if (/resili/.test(t) && /(internet|orange|sfr|free|bouygues|fibre|box|abonnement)/.test(t)) {
    return "resiliation_internet";
  }
  if (/lettre recommandee|lr avec ar|avec accuse de reception/.test(t)) {
    return "lettre_recommandee";
  }
  return "lettre_simple";
}
