"use client";

/**
 * Navigation desktop horizontale — remplace la sidebar permanente.
 * Réutilise getVisibleTabs / SpaceSwitcher (pas de nouvelle logique métier).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
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
  gradientCss,
} from "@/lib/paipersTheme";
import { supabase } from "@/lib/supabase";

export default function DesktopTopNav() {
  const pathname = usePathname();
  const { space, tabs, tabActiveColor, showProTabs, loaded } = useNavSpace();
  const inactive = getTabInactiveColor();
  const [initials, setInitials] = useState("?");
  const [email, setEmail] = useState("");

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      if (!user) return;
      setEmail(user.email || "");
      const meta = (user.user_metadata || {}) as {
        full_name?: string;
        first_name?: string;
      };
      const name = (meta.full_name || meta.first_name || user.email || "?").trim();
      const parts = name.split(/\s+/).filter(Boolean);
      const letters =
        parts.length >= 2
          ? `${parts[0][0]}${parts[1][0]}`
          : name.slice(0, 2);
      setInitials(letters.toUpperCase());
    })();
  }, []);

  if (!loaded) return null;

  return (
    <header
      className="hidden md:block sticky top-0 z-50 border-b"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(10px)",
        borderColor: PAIPERS_COLORS.border,
      }}
    >
      <div
        className="mx-auto flex items-center gap-4 px-6 lg:px-8"
        style={{ maxWidth: 1440, minHeight: 64 }}
      >
        <Link href="/dashboard" className="shrink-0 inline-flex items-center">
          <img src={NAV_ASSETS.logo} alt="Paipers" className="h-9 w-auto" />
        </Link>

        <nav className="flex flex-1 items-center justify-center gap-1 min-w-0">
          {tabs.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            const Icon = getTabIcon(tab, space);
            const color = active ? tabActiveColor : inactive;
            const isAssistant = tab.id === "assistant";

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="inline-flex items-center gap-2 px-3 py-2 transition-opacity"
                style={{
                  borderRadius: 14,
                  fontSize: 14,
                  fontWeight: active || isAssistant ? 800 : 600,
                  color: active
                    ? showProTabs
                      ? PAIPERS_COLORS.navy
                      : PAIPERS_COLORS.textPrimary
                    : inactive,
                  backgroundImage:
                    active && !showProTabs
                      ? gradientCss(PAIPERS_GRADIENTS.personalSoft)
                      : isAssistant && !active
                        ? gradientCss(PAIPERS_GRADIENTS.personalSoft)
                        : undefined,
                  backgroundColor:
                    active && showProTabs ? PAIPERS_COLORS.navyMuted : undefined,
                  opacity: isAssistant && !active ? 0.95 : 1,
                }}
              >
                {isAssistant ? (
                  <AssistantNavIcon focused={active} size="sidebar" />
                ) : Icon ? (
                  <Icon size={18} color={color} strokeWidth={active ? 2.4 : 2} />
                ) : null}
                <span className="hidden lg:inline">{tab.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <div style={{ minWidth: 168, maxWidth: 220 }}>
            <SpaceSwitcher variant="sidebar" />
          </div>
          <Link
            href="/profil"
            title={email || "Profil"}
            aria-label="Profil"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold"
            style={{
              background: PAIPERS_COLORS.navyMuted,
              color: PAIPERS_COLORS.navy,
              border: `1px solid ${PAIPERS_COLORS.border}`,
            }}
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
