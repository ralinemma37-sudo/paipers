/**
 * Surfaces desktop SaaS — identité Paipers, contraste multi-niveaux.
 * Visuel uniquement (pas de logique métier).
 */

export const DESKTOP_SURFACES = {
  /** Canvas app (hors landing) */
  canvas: "#F8F9FC",
  canvasAlt: "#F1F3F7",
  canvasCool: "#EEF2F8",

  /** Bleu nuit / marine */
  night: "#0B1220",
  nightElevated: "#121A2B",
  nightSoft: "#162033",
  marine: "#1A2B4A",
  marineSoft: "#243556",

  /** Violet foncé Paipers (dérivé rose brand) */
  violetDeep: "#1F1428",
  violetCard: "#2A1B3D",

  /** Cartes */
  cardWhite: "#FFFFFF",
  cardMuted: "#F4F6FA",
  cardBorder: "rgba(26, 43, 74, 0.08)",
  cardBorderStrong: "rgba(26, 43, 74, 0.14)",

  /** Texte sur fond sombre */
  onDark: "#F5F7FB",
  onDarkMuted: "rgba(245, 247, 251, 0.68)",
  onDarkSoft: "rgba(245, 247, 251, 0.45)",

  /** Sidebar */
  sidebarWidth: 232,
  headerHeight: 56,

  /** Accents discrets */
  accentLine: "#ACE4FF",
  online: "hsl(168 45% 42%)",
} as const;

export const DESKTOP_SHADOWS = {
  soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px rgba(15, 23, 42, 0.04)",
  lift: "0 4px 16px rgba(15, 23, 42, 0.08)",
  night: "0 12px 40px rgba(11, 18, 32, 0.35)",
} as const;
