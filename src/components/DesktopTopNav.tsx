"use client";

/**
 * Navigation desktop interne — fine, professionnelle (sans capsules pastel).
 * Logo → site public /. Avatar → menu (Profil + Voir le site Paipers).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, User } from "lucide-react";
import SpaceSwitcher from "@/components/SpaceSwitcher";
import { useNavSpace } from "@/components/NavSpaceProvider";
import { useEscapeToClose } from "@/hooks/useEscapeToClose";
import {
  getTabIcon,
  getTabInactiveColor,
  isTabActive,
  NAV_ASSETS,
} from "@/lib/navConfig";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";
import { supabase } from "@/lib/supabase";

export default function DesktopTopNav() {
  const pathname = usePathname();
  const { space, tabs, loaded } = useNavSpace();
  const inactive = getTabInactiveColor();
  const [initials, setInitials] = useState("?");
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  useEscapeToClose(menuOpen, closeMenu);

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
      className="hidden md:block sticky top-0 z-50 border-b bg-white"
      style={{ borderColor: PAIPERS_COLORS.border }}
    >
      <div
        className="mx-auto flex items-center gap-5 px-6 lg:px-8"
        style={{ maxWidth: 1280, height: 64 }}
      >
        <Link href="/" className="shrink-0 inline-flex items-center" title="Site Paipers">
          <img src={NAV_ASSETS.logo} alt="Paipers" className="h-9 w-auto" />
        </Link>

        <nav className="flex flex-1 items-center gap-0.5 min-w-0 overflow-x-auto">
          {tabs.map((tab) => {
            const active = isTabActive(pathname, tab.href);
            const Icon = getTabIcon(tab, space);
            const isAssistant = tab.id === "assistant";
            const color = active ? PAIPERS_COLORS.navy : inactive;

            return (
              <Link
                key={tab.id}
                href={tab.href}
                className="relative inline-flex items-center gap-1.5 px-3 py-2 transition-colors"
                style={{
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  color,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                {isAssistant ? (
                  <img
                    src={NAV_ASSETS.mascot}
                    alt=""
                    width={20}
                    height={20}
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 999,
                      objectFit: "cover",
                      objectPosition: "center 20%",
                    }}
                  />
                ) : Icon ? (
                  <Icon size={16} color={color} strokeWidth={active ? 2.4 : 2} />
                ) : null}
                <span>{tab.label}</span>
                {active ? (
                  <span
                    className="absolute left-3 right-3 bottom-0"
                    style={{
                      height: 2,
                      borderRadius: 1,
                      background: PAIPERS_COLORS.navy,
                    }}
                  />
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 shrink-0 pl-2 border-l" style={{ borderColor: PAIPERS_COLORS.border }}>
          <SpaceSwitcher variant="compact" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu compte"
              aria-expanded={menuOpen}
              title={email || "Compte"}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold border-0 cursor-pointer"
              style={{
                background: PAIPERS_COLORS.navyMuted,
                color: PAIPERS_COLORS.navy,
              }}
            >
              {initials}
            </button>

            {menuOpen ? (
              <>
                <button
                  type="button"
                  aria-label="Fermer"
                  className="fixed inset-0 z-40 border-0 cursor-default"
                  style={{ background: "transparent" }}
                  onClick={() => setMenuOpen(false)}
                />
                <div
                  className="absolute right-0 z-50 mt-2 min-w-[220px] overflow-hidden"
                  style={{
                    borderRadius: 12,
                    background: "#fff",
                    border: `1px solid ${PAIPERS_COLORS.border}`,
                    boxShadow: "0 8px 24px rgba(15,23,42,0.1)",
                  }}
                >
                  {email ? (
                    <p
                      className="px-3 py-2.5 text-xs truncate border-b"
                      style={{
                        color: PAIPERS_PALETTES.light.textMuted,
                        borderColor: PAIPERS_COLORS.border,
                        margin: 0,
                      }}
                    >
                      {email}
                    </p>
                  ) : null}
                  <Link
                    href="/profil"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold"
                    style={{ color: PAIPERS_COLORS.textPrimary, textDecoration: "none" }}
                  >
                    <User size={16} color={PAIPERS_COLORS.navy} />
                    Mon profil
                  </Link>
                  <Link
                    href="/"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold border-t"
                    style={{
                      color: PAIPERS_COLORS.textPrimary,
                      textDecoration: "none",
                      borderColor: PAIPERS_COLORS.border,
                    }}
                  >
                    <ExternalLink size={16} color={PAIPERS_COLORS.navy} />
                    Voir le site Paipers
                  </Link>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
