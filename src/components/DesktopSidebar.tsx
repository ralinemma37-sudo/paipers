"use client";

/**
 * Sidebar desktop — fixe, pleine hauteur viewport (jusqu’en bas).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavSpace } from "@/components/NavSpaceProvider";
import {
  getTabIcon,
  isTabActive,
  NAV_ASSETS,
} from "@/lib/navConfig";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";

export default function DesktopSidebar() {
  const pathname = usePathname();
  const { space, tabs, loaded } = useNavSpace();

  if (!loaded) return null;

  return (
    <aside
      className="hidden md:flex flex-col border-r"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        bottom: 0,
        width: DESKTOP_SURFACES.sidebarWidth,
        background: DESKTOP_SURFACES.marine,
        borderColor: "rgba(255,255,255,0.06)",
        zIndex: 40,
      }}
    >
      <div className="px-4 pt-5 pb-4 shrink-0">
        <Link href="/" className="inline-flex items-center" title="Site Paipers">
          <img
            src={NAV_ASSETS.logo}
            alt="Paipers"
            className="paipers-brand-logo h-12 w-auto"
          />
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-y-auto min-h-0">
        {tabs.map((tab) => {
          const active = isTabActive(pathname, tab.href);
          const Icon = getTabIcon(tab, space);
          const isAssistant = tab.id === "assistant";
          const color = active
            ? DESKTOP_SURFACES.onDark
            : "rgba(245,247,251,0.55)";

          return (
            <Link
              key={tab.id}
              href={tab.href}
              className="relative group flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-colors duration-150"
              style={{
                background: active ? "rgba(255,255,255,0.08)" : "transparent",
                color,
                textDecoration: "none",
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = "transparent";
              }}
            >
              {active ? (
                <span
                  className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r"
                  style={{ background: DESKTOP_SURFACES.accentLine }}
                />
              ) : null}

              {isAssistant ? (
                <span className="relative inline-flex shrink-0">
                  <img
                    src={NAV_ASSETS.mascot}
                    alt=""
                    width={22}
                    height={22}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 999,
                      objectFit: "cover",
                      objectPosition: "center 20%",
                    }}
                  />
                  <span
                    className="absolute -right-0.5 -bottom-0.5 w-2 h-2 rounded-full border"
                    style={{
                      background: DESKTOP_SURFACES.online,
                      borderColor: DESKTOP_SURFACES.marine,
                    }}
                    title="En ligne"
                  />
                </span>
              ) : Icon ? (
                <Icon size={17} color={color} strokeWidth={active ? 2.4 : 2} />
              ) : null}
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </nav>

      <div
        className="px-4 py-4 border-t text-[11px] font-semibold shrink-0"
        style={{
          borderColor: "rgba(255,255,255,0.06)",
          color: DESKTOP_SURFACES.onDarkSoft,
        }}
      >
        Espace connecté
      </div>
    </aside>
  );
}
