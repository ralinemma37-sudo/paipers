/**
 * Paipers design tokens — miroir TypeScript de paipers-mobile.
 *
 * Sources mobiles (ne pas inventer de valeurs) :
 * - src/theme/paipersColors.ts
 * - src/theme/paipers.ts
 * - src/theme/paipersElevatedCard.ts
 * - src/theme/spaceTheme.ts
 * - src/theme/typography.ts
 * - src/theme/folderColors.ts
 * - src/components/assistant/assistantChatTheme.ts
 * - src/components/PaipersButton.tsx
 *
 * Chemins assets web (copies exactes) :
 * - /brand/assistant-mascot.png ← assets/images/assistant-mascot.png
 * - /brand/splash-logo-light.png ← assets/images/splash-logo-light.png
 */

export const PAIPERS_ASSETS = {
  mascot: "/brand/assistant-mascot.png",
  logoSplashLight: "/brand/splash-logo-light.png",
} as const;

/** Palette officielle — paipersColors.ts */
export const PAIPERS_COLORS = {
  navy: "#1A2B4A",
  navyLight: "hsl(220 42% 38%)",
  navyMuted: "hsl(220 30% 96%)",
  navySoft: "hsl(220 32% 92%)",

  familyOrange: "hsl(28 88% 50%)",
  familyOrangeHex: "#ED7A1A",
  familyOrangeLight: "hsl(28 82% 62%)",
  familyOrangeMuted: "hsl(28 45% 96%)",
  familyOrangeSoft: "hsl(28 52% 93%)",

  personalGradientStart: "#ACE4FF",
  personalGradientMiddle: "#F7C4E8",
  personalGradientEnd: "#FFECC9",

  personalGradientSoftStart: "#EAF3FF",
  personalGradientSoftMiddle: "#FADDEA",
  personalGradientSoftEnd: "#FFF2C9",

  personalVividBlue: "hsl(202 90% 38%)",
  personalVividRose: "hsl(328 75% 40%)",
  personalVividYellow: "hsl(39 95% 36%)",

  background: "#FFFFFF",
  surface: "#F5F5F5",
  border: "#E5E5E5",
  textPrimary: "#1A1A1A",
  textSecondary: "rgba(0,0,0,0.6)",

  error: "hsl(0 65% 42%)",
  success: "hsl(168 45% 32%)",
  warning: "hsl(32 65% 38%)",
  neutral: "hsl(220 20% 55%)",
} as const;

/** Palette sémantique light/dark — paipers.ts */
export const PAIPERS_PALETTES = {
  light: {
    background: "#FFFFFF",
    foreground: "#1A1A1A",
    muted: "#F5F5F5",
    card: "#FFFFFF",
    border: "#E5E5E5",
    textMuted: "rgba(0,0,0,0.6)",
    primary: "hsl(202 100% 82%)",
    secondary: "hsl(328 80% 84%)",
    accent: "hsl(39 100% 85%)",
  },
  dark: {
    background: "#0B1220",
    foreground: "#F3F4F6",
    muted: "#151D2E",
    card: "#1A2332",
    border: "#2D3A4F",
    textMuted: "rgba(255,255,255,0.65)",
    primary: "hsl(202 100% 82%)",
    secondary: "hsl(328 80% 84%)",
    accent: "hsl(39 100% 85%)",
  },
} as const;

/** Rayons — paipers.ts `radius` */
export const PAIPERS_RADIUS = {
  card: 24,
  button: 999,
  input: 12,
} as const;

/** Espacements récurrents trouvés dans le mobile (proStyles / screens) */
export const PAIPERS_SPACE = {
  screenPad: 24,
  cardPad: 18,
  homeGridGap: 14,
} as const;

/** Typo — typography.ts (system font côté mobile) */
export const PAIPERS_TYPE = {
  screenTitle: {
    fontSize: 28,
    fontWeight: 800 as const,
  },
  button: {
    fontSize: 16,
    fontWeight: 800 as const,
  },
} as const;

/** Gradients — paipers.ts + spaceTheme.ts + PaipersButton.tsx */
export const PAIPERS_GRADIENTS = {
  personal: [
    PAIPERS_COLORS.personalGradientStart,
    PAIPERS_COLORS.personalGradientMiddle,
    PAIPERS_COLORS.personalGradientEnd,
  ] as const,
  personalSoft: [
    PAIPERS_COLORS.personalGradientSoftStart,
    PAIPERS_COLORS.personalGradientSoftMiddle,
    PAIPERS_COLORS.personalGradientSoftEnd,
  ] as const,
  button: [
    "hsl(202 100% 82%)",
    "hsl(328 80% 84%)",
    "hsl(39 100% 85%)",
  ] as const,
  washBorderLight: [
    "hsl(202 78% 82%)",
    "hsl(328 62% 84%)",
    "hsl(39 72% 83%)",
  ] as const,
  washBorderDark: [
    "hsl(202 32% 36%)",
    "hsl(328 26% 34%)",
    "hsl(39 28% 34%)",
  ] as const,
  softInnerFillLight: [
    "hsl(202 45% 97%)",
    "hsl(328 35% 97%)",
    "hsl(39 40% 96%)",
  ] as const,
  softInnerFillDark: [
    "hsl(202 22% 18%)",
    "hsl(328 18% 17%)",
    "hsl(39 20% 16%)",
  ] as const,
  professional: ["#1A2B4A", "#243A6E", "#152447"] as const,
  professionalSoft: [
    PAIPERS_COLORS.navyMuted,
    PAIPERS_COLORS.navySoft,
    "hsl(214 72% 98%)",
  ] as const,
  familyScore: ["#FFF0E5", "#FFE8D4", "#FFECD9"] as const,
  /** Spinner Android — paipers.ts refreshControlAndroidColors */
  refreshAndroid: ["#A8D8F5", "#EEC4E0", "#FFE2B0"] as const,
} as const;

/**
 * Ombre carte élevée — paipersElevatedCard.ts (approx. CSS de la shadow RN light).
 * Light: shadowColor rgba(0,0,0,0.22), offset (-3,5), opacity 1, radius 6
 * Dark: shadowColor #000, offset (-3,4), opacity 0.45, radius 8
 */
export const PAIPERS_SHADOWS = {
  cardLight: "-3px 5px 6px rgba(0, 0, 0, 0.22)",
  cardDark: "-3px 4px 8px rgba(0, 0, 0, 0.45)",
  /** PaipersButton.tsx — shadowOpacity 0.15, radius 8 */
  button: "0 4px 8px rgba(0, 0, 0, 0.15)",
} as const;

/** Chat Assistant — assistantChatTheme.ts */
export const PAIPERS_ASSISTANT_CHAT = {
  userBubbleBg: PAIPERS_COLORS.personalGradientStart,
  userBubbleText: PAIPERS_COLORS.textPrimary,
  actionButtonBg: PAIPERS_COLORS.personalGradientEnd,
  actionButtonText: PAIPERS_COLORS.textPrimary,
  /** AssistantHeroBlock PAGE_BG */
  idlePageBg: PAIPERS_COLORS.personalGradientSoftStart,
  /** Tab icon sky — AssistantMascot.tsx ASSISTANT_TAB_ICON_SKY */
  tabIconSky: "#ACE4FF",
  /** Tab icon gray — AssistantMascot.tsx ASSISTANT_TAB_ICON_GRAY */
  tabIconGray: "#9AA3B5",
} as const;

/** Pastels dossiers — folderColors.ts FOLDER_COLOR_SWATCHES */
export const PAIPERS_FOLDER_SWATCHES = [
  "#ACE4FF",
  "#F7C4E8",
  "#FFECC9",
  "#C8F2E5",
  "#DDD6FF",
  "#FFD9C9",
  "#C9EBFF",
  "#FFC8DE",
  "#D4E0FF",
  "#E8E4EF",
] as const;

export const PAIPERS_FOLDER_ICON_COLORS: Record<
  (typeof PAIPERS_FOLDER_SWATCHES)[number],
  string
> = {
  "#ACE4FF": "#4A9FD4",
  "#F7C4E8": "#D87098",
  "#FFECC9": "#C9A03C",
  "#C8F2E5": "#4FAF88",
  "#DDD6FF": "#7B6BC4",
  "#FFD9C9": "#D4825A",
  "#C9EBFF": "#5AABD8",
  "#FFC8DE": "#D07098",
  "#D4E0FF": "#7088C4",
  "#E8E4EF": "#8A8494",
};

export const PAIPERS_FOLDER_CIRCLE_BACKGROUNDS: Record<
  (typeof PAIPERS_FOLDER_SWATCHES)[number],
  string
> = {
  "#ACE4FF": "#EBF6FF",
  "#F7C4E8": "#FDF0F7",
  "#FFECC9": "#FFF8ED",
  "#C8F2E5": "#EDF9F4",
  "#DDD6FF": "#F3F0FD",
  "#FFD9C9": "#FFF2EB",
  "#C9EBFF": "#EDF7FF",
  "#FFC8DE": "#FDF0F6",
  "#D4E0FF": "#F0F4FD",
  "#E8E4EF": "#F5F4F7",
};

/** Space theme tokens utiles — spaceTheme.ts */
export const PAIPERS_SPACE_THEME = {
  personal: {
    tabActive: "hsl(202 100% 82%)",
    cardHighlightBorder: "hsl(202 78% 82%)",
    iconActive: PAIPERS_COLORS.navy,
  },
  professional: {
    tabActive: PAIPERS_COLORS.navy,
    cardHighlightBorder: "hsl(214 48% 74%)",
    iconActive: PAIPERS_COLORS.navy,
  },
  family: {
    tabActive: "hsl(28 95% 78%)",
    cardHighlightBorder: "hsl(28 68% 78%)",
    iconActive: PAIPERS_COLORS.familyOrange,
  },
} as const;

export function gradientCss(stops: readonly string[], angle = 135): string {
  return `linear-gradient(${angle}deg, ${stops.join(", ")})`;
}
