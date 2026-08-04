/**
 * Footer landing publique.
 */

import Link from "next/link";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_ASSETS } from "@/lib/paipersTheme";

export default function LandingFooter() {
  return (
    <footer
      className="border-t px-5 md:px-8 py-10"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: DESKTOP_SURFACES.nightElevated,
        color: DESKTOP_SURFACES.onDark,
      }}
    >
      <div
        className="mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-8"
        style={{ maxWidth: 1120 }}
      >
        <div>
          <img
            src={PAIPERS_ASSETS.logoNight}
            alt="Paipers"
            className="paipers-brand-logo h-11 w-auto"
          />
          <p className="mt-3 text-sm max-w-xs" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
            Le copilote administratif intelligent arrive bientôt.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <p className="font-extrabold">Produit</p>
            <a href="#fonctionnalites" style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
              Fonctionnalités
            </a>
            <a href="#tarifs" style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
              Tarifs
            </a>
            <a href="#waitlist" style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
              Liste d’attente
            </a>
          </div>
          <div className="flex flex-col gap-2">
            <p className="font-extrabold">Légal</p>
            <Link href="/legal/cgu" style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
              CGU
            </Link>
            <Link
              href="/legal/politique-confidentialite"
              style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}
            >
              Confidentialité
            </Link>
            <Link
              href="/login"
              style={{
                color: DESKTOP_SURFACES.onDarkSoft,
                textDecoration: "none",
                opacity: 0.7,
                fontSize: 12,
              }}
            >
              Accès privé
            </Link>
          </div>
        </div>
      </div>
      <p
        className="mx-auto mt-10 text-xs"
        style={{ maxWidth: 1120, color: DESKTOP_SURFACES.onDarkSoft }}
      >
        © {new Date().getFullYear()} Paipers. Mentions éditeur en cours de
        finalisation — voir les pages légales.
      </p>
    </footer>
  );
}
