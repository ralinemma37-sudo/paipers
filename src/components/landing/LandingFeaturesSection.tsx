/**
 * Section fonctionnalités (#fonctionnalites) — différenciation Paipers.
 */

import {
  FileSearch,
  Mail,
  Sparkles,
  Calendar,
  FolderOpen,
  Bot,
  ScanLine,
  Route,
} from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function LandingFeaturesSection() {
  return (
    <LandingSection id="fonctionnalites" tone="white">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        Plus qu’un stockage. Plus qu’une facturation.
      </h2>
      <p className="mt-3 text-center paipers-text-muted max-w-2xl mx-auto">
        Paipers centralise ton administratif perso et pro, l’analyse, le classe
        et t’aide à agir — avec Archi à tes côtés.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            Icon: FolderOpen,
            t: "Documents perso & pro",
            d: "Centralise tes documents administratifs personnels et professionnels au même endroit.",
            dark: false,
          },
          {
            Icon: Mail,
            t: "E-mails analysés",
            d: "Connecte Gmail ou Outlook pour importer et analyser les pièces jointes utiles.",
            dark: true,
          },
          {
            Icon: Sparkles,
            t: "Classement automatique",
            d: "Paipers classe tes documents pour que tu retrouves plus vite ce dont tu as besoin.",
            dark: false,
          },
          {
            Icon: FileSearch,
            t: "Infos importantes",
            d: "Retrouve rapidement les éléments clés d’un document, sans fouiller partout.",
            dark: false,
          },
          {
            Icon: Calendar,
            t: "Échéances rappelées",
            d: "Garde un œil sur les dates importantes liées à ton espace et à tes documents.",
            dark: true,
          },
          {
            Icon: Route,
            t: "Démarches suivies",
            d: "Suis tes démarches administratives étape par étape, sans tout reconstruire à la main.",
            dark: false,
          },
          {
            Icon: ScanLine,
            t: "Scanner, retrouver, signer",
            d: "Scanne, retrouve et prépare la signature de documents depuis ton espace Paipers.",
            dark: false,
          },
          {
            Icon: Bot,
            t: "Archi t’accompagne",
            d: "Pose tes questions sur ton admin et avance avec un assistant centré sur Paipers.",
            dark: true,
          },
        ].map(({ Icon, t, d, dark }, i) => (
          <div
            key={t}
            className={`flex gap-4 items-start p-[18px] paipers-hover-lift ${
              dark
                ? "paipers-card-marine"
                : i % 3 === 2
                  ? "paipers-card-gradient"
                  : "paipers-card-white"
            }`}
          >
            <span
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{
                background: dark ? "rgba(255,255,255,0.1)" : "hsl(202 100% 94%)",
              }}
            >
              <Icon size={20} color={dark ? DESKTOP_SURFACES.onDark : PAIPERS_COLORS.navy} />
            </span>
            <div>
              <p className="font-extrabold" style={{ color: dark ? DESKTOP_SURFACES.onDark : undefined }}>
                {t}
              </p>
              <p
                className="mt-1.5 text-sm leading-relaxed"
                style={{ color: dark ? DESKTOP_SURFACES.onDarkMuted : undefined }}
              >
                {!dark ? <span className="paipers-text-muted">{d}</span> : d}
              </p>
            </div>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
