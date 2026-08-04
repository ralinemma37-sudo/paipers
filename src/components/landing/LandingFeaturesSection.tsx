/**
 * Section fonctionnalités (#fonctionnalites).
 */

import {
  FileText,
  Mail,
  Sparkles,
  Calendar,
  FolderOpen,
  Bot,
} from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function LandingFeaturesSection() {
  return (
    <LandingSection id="fonctionnalites" tone="white">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        Ce que Paipers fait aujourd’hui
      </h2>
      <p className="mt-3 text-center paipers-text-muted max-w-2xl mx-auto">
        Des fonctions réellement disponibles sur le web, alignées sur l’app mobile.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { Icon: FolderOpen, t: "Coffre-fort documents", d: "Importe, classe et consulte tes documents administratifs.", dark: false },
          { Icon: Mail, t: "Emails connectés", d: "Branche Gmail ou Outlook pour importer des pièces jointes.", dark: true },
          { Icon: Bot, t: "Assistant Archi", d: "Pose des questions sur ton admin et avance étape par étape.", dark: false },
          { Icon: Sparkles, t: "Générer des documents", d: "Rédige des courriers et prépare des PDF à partir de tes besoins.", dark: false },
          { Icon: Calendar, t: "Échéances", d: "Garde un œil sur les dates importantes liées à ton espace.", dark: true },
          { Icon: FileText, t: "Espace Professionnel", d: "Navigation Factures et coque Pro : la facturation complète reste sur mobile pour l’instant.", dark: false },
        ].map(({ Icon, t, d, dark }, i) => (
          <div
            key={t}
            className={`flex gap-4 items-start p-[18px] paipers-hover-lift ${
              dark ? "paipers-card-marine" : i % 3 === 2 ? "paipers-card-gradient" : "paipers-card-white"
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
