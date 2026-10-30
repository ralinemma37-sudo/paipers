/**
 * Footer landing publique.
 */

import { APP_HOME_URL, APP_LOGIN_URL, APP_SIGNUP_URL } from "@/lib/appLinks";
import Link from "next/link";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_ASSETS } from "@/lib/paipersTheme";

export default function LandingFooter() {
  return (
    <footer
      data-dark="1"
      className="border-t px-5 md:px-8 py-10"
      style={{
        borderColor: "rgba(255,255,255,0.08)",
        background: "#3A2A44",
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
            alt="Plaidoc"
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
            <a href={APP_SIGNUP_URL} style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
              Créer mon compte
            </a>
            <a href={APP_LOGIN_URL} style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
              Se connecter
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
            <Link href="/legal/suppression-compte" style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
              Supprimer mon compte
            </Link>
          </div>
        </div>
      </div>
      <p
        className="mx-auto mt-10 text-xs"
        style={{ maxWidth: 1120, color: DESKTOP_SURFACES.onDarkSoft }}
      >
        © {new Date().getFullYear()} Plaidoc. Mentions éditeur en cours de
        finalisation — voir les pages légales.
      </p>
    </footer>
  );
}
