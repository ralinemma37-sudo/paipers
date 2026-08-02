/**
 * Couche d’affichage catégories documents.
 * Réf. mobile : folderColors.ts (FOLDER_COLOR_BY_CATEGORY) + labels DocumentRootCategory.
 * Web stocke `documents.category` (souvent singulier / pluriel) — pas de table folders.
 */

import {
  PAIPERS_FOLDER_CIRCLE_BACKGROUNDS,
  PAIPERS_FOLDER_ICON_COLORS,
  PAIPERS_FOLDER_SWATCHES,
} from "@/lib/paipersTheme";

export const DOCUMENT_ROOT_CATEGORY_LABELS = [
  "Entreprise",
  "Identité",
  "Impôts",
  "Logement",
  "Santé",
  "Banque",
  "Assurances",
  "Factures",
  "Contrats",
  "Travail",
  "Abonnements",
  "Véhicule",
  "Autres",
] as const;

/** Couleurs suggérées par catégorie — folderColors.ts FOLDER_COLOR_BY_CATEGORY */
export const FOLDER_COLOR_BY_CATEGORY: Record<string, string> = {
  Factures: "#ACE4FF",
  Contrats: "#DDD6FF",
  Travail: "#C8F2E5",
  Banque: "#C9EBFF",
  Assurances: "#FFD9C9",
  Logement: "#F7C4E8",
  Impôts: "#FFECC9",
  Véhicule: "#D4E0FF",
  Entreprise: "#DDD6FF",
  Identité: "#C8F2E5",
  Santé: "#FFD9C9",
  Abonnements: "#FFECC9",
  Autres: "#E8E4EF",
};

const SLUG_TO_LABEL: Record<string, string> = {
  factures: "Factures",
  facture: "Factures",
  contrats: "Contrats",
  contrat: "Contrats",
  travail: "Travail",
  banque: "Banque",
  assurances: "Assurances",
  assurance: "Assurances",
  logement: "Logement",
  sante: "Santé",
  santé: "Santé",
  identite: "Identité",
  identité: "Identité",
  entreprise: "Entreprise",
  impots: "Impôts",
  impôts: "Impôts",
  abonnements: "Abonnements",
  abonnement: "Abonnements",
  vehicule: "Véhicule",
  véhicule: "Véhicule",
  autres: "Autres",
  administratif: "Identité",
  "non classé": "Autres",
  "non classe": "Autres",
  non_classe: "Autres",
};

export type FolderSwatch = (typeof PAIPERS_FOLDER_SWATCHES)[number];

/** Normalise une catégorie DB → slug URL-safe (pluriel canonique). */
export function normCat(cat: string | null | undefined): string {
  const raw = (cat || "autres").toLowerCase().trim();
  if (raw === "non classé" || raw === "non classe" || raw === "non_classe") return "autres";
  if (raw === "facture") return "factures";
  if (raw === "contrat") return "contrats";
  if (raw === "assurance") return "assurances";
  if (raw === "abonnement") return "abonnements";
  if (raw === "administratif") return "identite";
  // accents → ascii-ish keys already in SLUG_TO_LABEL
  const label = SLUG_TO_LABEL[raw];
  if (label) return slugFromLabel(label);
  return raw.normalize("NFD").replace(/\p{M}/gu, "").replace(/\s+/g, "-");
}

function slugFromLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/\s+/g, "-");
}

/** Libellé d’affichage — labels mobiles / map singulier→pluriel. */
export function labelCat(cat: string | null | undefined): string {
  const slug = normCat(cat);
  const fromSlug = SLUG_TO_LABEL[slug] || SLUG_TO_LABEL[(cat || "").toLowerCase().trim()];
  if (fromSlug) return fromSlug;
  const c = (cat || "Autres").trim();
  if (!c) return "Autres";
  return c.charAt(0).toUpperCase() + c.slice(1);
}

function nearestSwatch(hex: string): FolderSwatch {
  const upper = hex.toUpperCase();
  const exact = PAIPERS_FOLDER_SWATCHES.find((s) => s.toUpperCase() === upper);
  if (exact) return exact;
  // Véhicule mobile #D4E8FF → #D4E0FF
  if (upper === "#D4E8FF") return "#D4E0FF";
  return PAIPERS_FOLDER_SWATCHES[PAIPERS_FOLDER_SWATCHES.length - 1];
}

export function folderColorForCategory(cat: string | null | undefined): FolderSwatch {
  const label = labelCat(cat);
  const hex = FOLDER_COLOR_BY_CATEGORY[label] || FOLDER_COLOR_BY_CATEGORY.Autres;
  return nearestSwatch(hex);
}

export function folderIconColorsForCategory(cat: string | null | undefined): {
  iconBg: string;
  icon: string;
  swatch: FolderSwatch;
} {
  const swatch = folderColorForCategory(cat);
  return {
    swatch,
    iconBg: PAIPERS_FOLDER_CIRCLE_BACKGROUNDS[swatch],
    icon: PAIPERS_FOLDER_ICON_COLORS[swatch],
  };
}

export function docCountLabel(count: number): string {
  return count > 0
    ? `${count} document${count > 1 ? "s" : ""}`
    : "Aucun document";
}
