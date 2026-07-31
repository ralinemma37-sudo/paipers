"use client";

/**
 * Header site public — navigation marketing (hors AppShell / BottomNav).
 * Style premium : verre sur fond nuit.
 */

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_ASSETS } from "@/lib/paipersTheme";
import { supabase } from "@/lib/supabase";

const LINKS = [
  { href: "#fonctionnalites", label: "Fonctionnalités" },
  { href: "#particuliers", label: "Particuliers" },
  { href: "#professionnels", label: "Professionnels" },
  { href: "#tarifs", label: "Tarifs" },
  { href: "#faq", label: "Questions fréquentes" },
] as const;

export default function PublicSiteHeader() {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(Boolean(data.session));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setLoggedIn(Boolean(session));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        background: "rgba(11, 18, 32, 0.88)",
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      <div
        className="mx-auto flex items-center gap-6 px-5 md:px-8"
        style={{ maxWidth: 1200, height: 64 }}
      >
        <Link href="/" className="shrink-0 inline-flex items-center gap-2.5">
          <img
            src={PAIPERS_ASSETS.logoSplashLight}
            alt="Paipers"
            className="h-9 w-auto brightness-0 invert"
          />
        </Link>

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-7">
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[14px] font-semibold tracking-tight hover:opacity-80 transition-opacity"
              style={{ color: DESKTOP_SURFACES.onDark, textDecoration: "none" }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-5 ml-auto lg:ml-0">
          {loggedIn ? (
            <Link
              href="/dashboard"
              className="paipers-button"
              style={{ padding: "10px 20px", fontSize: 14 }}
            >
              Accéder à mon espace
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-[14px] font-semibold"
                style={{ color: DESKTOP_SURFACES.onDark, textDecoration: "none" }}
              >
                Se connecter
              </Link>
              <Link
                href="/signup"
                className="paipers-button"
                style={{ padding: "10px 20px", fontSize: 14 }}
              >
                Essayer Paipers
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden ml-auto inline-flex p-2 border-0 bg-transparent cursor-pointer"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X size={22} color={DESKTOP_SURFACES.onDark} />
          ) : (
            <Menu size={22} color={DESKTOP_SURFACES.onDark} />
          )}
        </button>
      </div>

      {open ? (
        <div
          className="md:hidden border-t px-5 py-4 flex flex-col gap-1"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: DESKTOP_SURFACES.nightElevated,
          }}
        >
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-3 text-[15px] font-semibold"
              style={{ color: DESKTOP_SURFACES.onDark, textDecoration: "none" }}
            >
              {l.label}
            </a>
          ))}
          <div
            className="pt-3 flex flex-col gap-3 border-t"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {loggedIn ? (
              <Link
                href="/dashboard"
                className="paipers-button text-center"
                onClick={() => setOpen(false)}
              >
                Accéder à mon espace
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="py-2 text-center font-semibold"
                  style={{ color: DESKTOP_SURFACES.onDark }}
                  onClick={() => setOpen(false)}
                >
                  Se connecter
                </Link>
                <Link
                  href="/signup"
                  className="paipers-button text-center"
                  onClick={() => setOpen(false)}
                >
                  Essayer Paipers
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
