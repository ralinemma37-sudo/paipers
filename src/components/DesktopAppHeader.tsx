"use client";

/**
 * Header desktop discret — recherche, espace, avatar.
 * Aucune API nouvelle : la recherche ouvre /documents.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ExternalLink, LogOut, Search, User } from "lucide-react";
import SpaceSwitcher from "@/components/SpaceSwitcher";
import { useEscapeToClose } from "@/hooks/useEscapeToClose";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";
import { supabase } from "@/lib/supabase";

export default function DesktopAppHeader() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [initials, setInitials] = useState("?");
  const [email, setEmail] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
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

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    router.push(trimmed ? `/documents?q=${encodeURIComponent(trimmed)}` : "/documents");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    setMenuOpen(false);
    router.replace("/login");
  };

  return (
    <header
      className="hidden md:flex sticky top-0 z-30 items-center gap-4 px-6 border-b"
      style={{
        height: DESKTOP_SURFACES.headerHeight,
        background: "rgba(248,249,252,0.92)",
        backdropFilter: "blur(10px)",
        borderColor: DESKTOP_SURFACES.cardBorder,
      }}
    >
      <form
        onSubmit={onSearch}
        className="flex-1 max-w-md flex items-center gap-2 px-3 rounded-xl border"
        style={{
          height: 36,
          background: "#fff",
          borderColor: DESKTOP_SURFACES.cardBorder,
        }}
      >
        <Search size={15} color={PAIPERS_PALETTES.light.textMuted} />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher dans Documents…"
          aria-label="Rechercher dans Documents"
          className="flex-1 border-0 bg-transparent outline-none text-[13px]"
          style={{
            color: PAIPERS_COLORS.textPrimary,
            padding: 0,
            boxShadow: "none",
          }}
        />
      </form>

      <div className="ml-auto flex items-center gap-2 shrink-0">
        <SpaceSwitcher variant="compact" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu compte"
            aria-expanded={menuOpen}
            title={email || "Compte"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold border-0 cursor-pointer"
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
                className="absolute right-0 z-50 mt-2 min-w-[220px] overflow-hidden paipers-fade-in"
                style={{
                  borderRadius: 12,
                  background: "#fff",
                  border: `1px solid ${DESKTOP_SURFACES.cardBorder}`,
                  boxShadow: "0 8px 24px rgba(15,23,42,0.1)",
                }}
              >
                {email ? (
                  <p
                    className="px-3 py-2.5 text-xs truncate border-b"
                    style={{
                      color: PAIPERS_PALETTES.light.textMuted,
                      borderColor: DESKTOP_SURFACES.cardBorder,
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
                    borderColor: DESKTOP_SURFACES.cardBorder,
                  }}
                >
                  <ExternalLink size={16} color={PAIPERS_COLORS.navy} />
                  Voir le site Paipers
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-semibold border-t border-0 cursor-pointer text-left"
                  style={{
                    color: "#991b1b",
                    background: "transparent",
                    borderTop: `1px solid ${DESKTOP_SURFACES.cardBorder}`,
                    opacity: loggingOut ? 0.6 : 1,
                  }}
                >
                  <LogOut size={16} color="#991b1b" />
                  {loggingOut ? "Déconnexion…" : "Se déconnecter"}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
