"use client";

/**
 * Bottom navigation web — miroir des Tabs Expo.
 * Réf. : paipers-mobile/app/(tabs)/_layout.tsx
 * - Ordre / libellés / icônes selon espace
 * - Actif : spaceTheme.tabActive · Inactif : textMuted
 * - Assistant : mascotte Pupo centrale
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import AssistantNavIcon from "@/components/AssistantNavIcon";
import { useNavSpace } from "@/components/NavSpaceProvider";
import {
  getTabIcon,
  getTabInactiveColor,
  isTabActive,
} from "@/lib/navConfig";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

export default function BottomNav() {
  const pathname = usePathname();
  const { space, tabs, tabActiveColor, showProTabs, loaded } = useNavSpace();
  const inactive = getTabInactiveColor();

  if (!loaded) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: PAIPERS_PALETTES.light.background,
        borderTop: `1px solid ${PAIPERS_COLORS.border}`,
        paddingTop: 6,
        paddingBottom: "max(10px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mx-auto flex max-w-lg items-end justify-around px-1">
        {tabs.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          const Icon = getTabIcon(tab, space);
          const color = active ? tabActiveColor : inactive;
          const isAssistant = tab.id === "assistant";

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="flex flex-1 flex-col items-center justify-end gap-0.5 min-w-0 py-1"
              style={{
                color,
                fontWeight: active || isAssistant ? 700 : 500,
              }}
            >
              {isAssistant ? (
                <AssistantNavIcon focused={active} size="tab" />
              ) : Icon ? (
                <Icon
                  size={24}
                  color={color}
                  strokeWidth={active ? 2.25 : 2}
                  fill={
                    tab.id === "generer" && active
                      ? color
                      : "none"
                  }
                />
              ) : null}
              <span
                className="truncate w-full text-center"
                style={{
                  fontSize: 12,
                  marginTop: isAssistant ? 6 : 2,
                  color: active
                    ? showProTabs
                      ? PAIPERS_COLORS.navy
                      : tabActiveColor
                    : inactive,
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
