"use client";

/**
 * Navigation publique — hors AppShell / BottomNav.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { PAIPERS_ASSETS, PAIPERS_COLORS, PAIPERS_RADIUS } from "@/lib/paipersTheme";
import { supabase } from "@/lib/supabase";

const LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#particuliers", label: "Particuliers" },
  { href: "#professionnels", label: "Professionnels" },
  { href: "#tarifs", label: "Tarifs" },
] as const;

export default function PublicSiteHeader() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(Boolean(data.session));
    });
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(12px)",
        borderColor: PAIPERS_COLORS.border,
      }}
    >
      <div
        className="mx-auto flex items-center justify-between gap-4 px-5 md:px-8"
        style={{ maxWidth: 1200, minHeight: 68 }}
      >
        <Link href="/" className="inline-flex items-center shrink-0">
          <img src={PAIPERS_ASSETS.logoSplashLight} alt="Paipers" className="h-9 w-auto" />
        </Link>

        <nav className="hidden lg:flex items-center gap-6">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-bold"
              style={{ color: PAIPERS_COLORS.textPrimary, textDecoration: "none" }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="paipers-button"
              style={{ padding: "10px 18px", fontSize: 14 }}
            >
              Accéder à mon espace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-extrabold"
                style={{ color: PAIPERS_COLORS.navy, textDecoration: "none" }}
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="paipers-button"
                style={{ padding: "10px 18px", fontSize: 14 }}
              >
                Essayer Paipers
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden inline-flex p-2"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
          style={{
            border: "none",
            background: "transparent",
            borderRadius: PAIPERS_RADIUS.input,
            cursor: "pointer",
          }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open ? (
        <div
          className="md:hidden border-t px-5 py-4 flex flex-col gap-3"
          style={{ borderColor: PAIPERS_COLORS.border, background: "#fff" }}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2 font-bold"
              style={{ color: PAIPERS_COLORS.textPrimary, textDecoration: "none" }}
            >
              {l.label}
            </a>
          ))}
          {loggedIn ? (
            <Link href="/dashboard" className="paipers-button" style={{ textAlign: "center" }}>
              Accéder à mon espace
            </Link>
          ) : (
            <>
              <Link href="/login" className="font-extrabold py-2" style={{ color: PAIPERS_COLORS.navy }}>
                Se connecter
              </Link>
              <Link href="/signup" className="paipers-button" style={{ textAlign: "center" }}>
                Essayer Paipers
              </Link>
            </>
          )}
        </div>
      ) : null}
    </header>
  );
}
