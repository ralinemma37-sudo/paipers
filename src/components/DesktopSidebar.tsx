"use client";

/**
 * Sidebar desktop — adaptation des Bottom Tabs mobiles.
 * Réf. : paipers-mobile/app/(tabs)/_layout.tsx
 *        paipers-mobile/src/components/PaipersAccountSwitcher.tsx
 *
 * Rubriques uniquement celles des tabs visibles (pas Paramètres séparé).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import AssistantNavIcon from "@/components/AssistantNavIcon";
import SpaceSwitcher from "@/components/SpaceSwitcher";
import { useNavSpace } from "@/components/NavSpaceProvider";
import {
  getTabIcon,
  getTabInactiveColor,
  isTabActive,
  NAV_ASSETS,
} from "@/lib/navConfig";
import {
  PAIPERS_COLORS,
  PAIPERS_GRADIENTS,
  PAIPERS_PALETTES,
  PAIPERS_RADIUS,
  gradientCss,
} from "@/lib/paipersTheme";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { space, tabs, tabActiveColor, showProTabs } = useNavSpace();
  const inactive = getTabInactiveColor();

  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 flex-col h-screen sticky top-0 p-4">
      <div
        className="flex flex-col h-full overflow-hidden"
        style={{
          borderRadius: PAIPERS_RADIUS.card,
          background: PAIPERS_PALETTES.light.card,
          border: `1px solid ${PAIPERS_COLORS.border}`,
          boxShadow: "var(--paipers-shadow-card)",
        }}
      >
        {/* Logo officiel étape 1 */}
        <div className="px-5 pt-5 pb-3">
          <Link href="/dashboard" className="inline-flex items-center gap-3">
            <img
              src={NAV_ASSETS.logo}
              alt="Paipers"
              className="h-10 w-auto"
            />
          </Link>
        </div>

        {/* Switcher d’espace — comme bandeau mobile */}
        <div className="px-3 pb-3">
          <SpaceSwitcher variant="sidebar" />
        </div>

        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pb-4">
          {tabs.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            const Icon = getTabIcon(tab, space);
            const color = active ? tabActiveColor : inactive;
            const isAssistant = tab.id === "assistant";

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="flex items-center gap-3 px-3 py-2.5 transition-opacity"
                style={{
                  borderRadius: 16,
                  fontSize: 15,
                  fontWeight: active || isAssistant ? 700 : 500,
                  color: active
                    ? showProTabs
                      ? PAIPERS_COLORS.navy
                      : PAIPERS_COLORS.textPrimary
                    : inactive,
                  backgroundImage:
                    active && !showProTabs
                      ? gradientCss(PAIPERS_GRADIENTS.personalSoft)
                      : undefined,
                  backgroundColor:
                    active && showProTabs
                      ? PAIPERS_COLORS.navyMuted
                      : undefined,
                }}
              >
                {isAssistant ? (
                  <AssistantNavIcon focused={active} size="sidebar" />
                ) : Icon ? (
                  <Icon size={22} color={color} strokeWidth={active ? 2.25 : 2} />
                ) : null}
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
