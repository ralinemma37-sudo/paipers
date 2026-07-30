/**
 * Configuration de navigation web — miroir des tabs Expo Router.
 *
 * Référence mobile :
 * - app/(tabs)/_layout.tsx (ordre, titres, href Pro/Personnel, accents)
 * - src/theme/spaceTheme.ts (tabActive Personnel / Professionnel)
 * - src/theme/paipers.ts (textMuted inactif)
 * - src/features/workspace/workspaceTypes.ts (labels Personnel / Professionnel)
 * - src/features/workspace/workspaceDefaults.ts (noms d’espace)
 *
 * Correspondance Ionicons → Lucide (équivalents, pas d’invention de rubriques) :
 * - home-outline → Home
 * - grid-outline → LayoutGrid
 * - folder-open-outline → FolderOpen
 * - folder-outline → Folder
 * - sparkles / sparkles-outline → Sparkles
 * - receipt-outline → Receipt
 * - person-outline → User
 * Assistant : mascotte Pupo (pas une icône Lucide)
 */

import type { LucideIcon } from "lucide-react";
import {
  Folder,
  FolderOpen,
  Home,
  LayoutGrid,
  Receipt,
  Sparkles,
  User,
} from "lucide-react";
import {
  PAIPERS_ASSETS,
  PAIPERS_COLORS,
  PAIPERS_PALETTES,
  PAIPERS_SPACE_THEME,
} from "@/lib/paipersTheme";

/** Scope UI navigation — aligné accountScope web + appMode mobile (personal | pro). */
export type NavSpace = "personal" | "pro";

export const NAV_SCOPE_STORAGE_KEY = "paipers-account-scope";

export type NavTabId =
  | "accueil"
  | "documents"
  | "assistant"
  | "generer"
  | "factures"
  | "profil";

export type NavTab = {
  id: NavTabId;
  href: string;
  label: string;
  /** null = onglet Assistant (mascotte) */
  icon: LucideIcon | null;
  /** Icône alternative en mode Pro (si différente) */
  iconPro?: LucideIcon;
};

/**
 * Ordre exact des Tabs.Screen visibles dans _layout.tsx :
 * Accueil → Documents → Assistant → (Factures|Générer) → Profil
 */
const BASE_TABS: NavTab[] = [
  {
    id: "accueil",
    href: "/dashboard",
    label: "Accueil",
    icon: Home,
    iconPro: LayoutGrid,
  },
  {
    id: "documents",
    href: "/documents",
    label: "Documents",
    icon: FolderOpen,
    iconPro: Folder,
  },
  {
    id: "assistant",
    href: "/assistant",
    label: "Assistant",
    icon: null,
  },
  {
    id: "generer",
    href: "/generer",
    label: "Générer",
    icon: Sparkles,
  },
  {
    id: "factures",
    href: "/factures",
    label: "Factures",
    icon: Receipt,
  },
  {
    id: "profil",
    href: "/profil",
    label: "Profil",
    icon: User,
  },
];

/** Labels d’espace — workspaceTypeLabel / workspaceDefaults */
export const NAV_SPACE_LABELS: Record<NavSpace, string> = {
  personal: "Personnel",
  pro: "Professionnel",
};

export function getVisibleTabs(space: NavSpace): NavTab[] {
  const showProTabs = space === "pro";
  return BASE_TABS.filter((tab) => {
    if (tab.id === "factures") return showProTabs;
    if (tab.id === "generer") return !showProTabs;
    return true;
  });
}

export function getTabIcon(tab: NavTab, space: NavSpace): LucideIcon | null {
  if (!tab.icon) return null;
  if (space === "pro" && tab.iconPro) return tab.iconPro;
  return tab.icon;
}

/** Couleur active des tabs — spaceTheme.tabActive via pastel.accent */
export function getTabActiveColor(space: NavSpace): string {
  return space === "pro"
    ? PAIPERS_SPACE_THEME.professional.tabActive
    : PAIPERS_SPACE_THEME.personal.tabActive;
}

/** Couleur inactive — palettes.light.textMuted */
export function getTabInactiveColor(): string {
  return PAIPERS_PALETTES.light.textMuted;
}

export function isTabActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }
  if (href === "/profil") {
    return pathname === "/profil" || pathname.startsWith("/profil/");
  }
  return pathname === href || pathname.startsWith(href + "/");
}

/**
 * Après changement d’espace — miroir redirects mobile :
 * - generer/index.tsx : isProMode → Redirect factures
 * - factures/index.tsx : !isProMode → Redirect Accueil
 */
export function routeAfterSpaceSwitch(
  pathname: string,
  next: NavSpace,
): string | null {
  if (next === "pro" && (pathname === "/generer" || pathname.startsWith("/generer/"))) {
    return "/factures";
  }
  if (
    next === "personal" &&
    (pathname === "/factures" || pathname.startsWith("/factures/"))
  ) {
    return "/dashboard";
  }
  return null;
}

export const NAV_ASSETS = {
  logo: PAIPERS_ASSETS.logoSplashLight,
  mascot: PAIPERS_ASSETS.mascot,
} as const;

/** Styles Assistant tab — _layout.tsx tabBarIcon Assistant */
export const ASSISTANT_TAB_STYLE = {
  focusedBg: PAIPERS_COLORS.personalGradientStart,
  unfocusedBg: "rgba(0,0,0,0.08)",
  focusedSize: 58,
  unfocusedSize: 52,
  avatarFocused: 48,
  avatarUnfocused: 44,
} as const;
