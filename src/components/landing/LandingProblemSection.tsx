/**
 * Section problème — admin dispersé + transition vers Paipers.
 */

import { ArrowDown } from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

const SCATTERED_TOOLS = [
  "E-mails",
  "Dossiers",
  "PDF",
  "Scanner",
  "Signature",
  "Rappels",
  "Factures",
  "Démarches",
] as const;

export default function LandingProblemSection() {
  return (
    <LandingSection tone="canvas">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        Aujourd’hui, ton administratif est partout.
      </h2>
      <p className="mt-4 text-center mx-auto max-w-2xl leading-relaxed paipers-text-muted">
        Tes documents sont dans tes e-mails, tes dossiers, tes photos,
        différentes applications… et tu dois encore penser toi-même aux
        échéances et aux démarches.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
        {SCATTERED_TOOLS.map((label) => (
          <span
            key={label}
            className="px-3.5 py-2 text-[13px] font-extrabold paipers-card-white"
            style={{ borderRadius: 999, display: "inline-block" }}
          >
            {label}
          </span>
        ))}
      </div>

      {/* Comparaison mobile-first : empilée, puis côte à côte */}
      <div className="mt-10 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-stretch max-w-3xl mx-auto">
        <div className="paipers-card-muted p-[18px] paipers-hover-lift">
          <p
            className="text-[12px] font-bold tracking-[0.06em] uppercase"
            style={{ color: PAIPERS_COLORS.navy, margin: 0 }}
          >
            Aujourd’hui
          </p>
          <p className="mt-2 font-extrabold text-base" style={{ color: PAIPERS_COLORS.textPrimary }}>
            Plusieurs outils séparés
          </p>
          <ul className="mt-3 space-y-1.5 text-sm paipers-text-muted" style={{ margin: "12px 0 0", padding: 0, listStyle: "none" }}>
            {[
              "E-mails, dossiers et photos éparpillés",
              "Rappels et démarches à suivre ailleurs",
              "Tu dois tout reconstruire toi-même",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden style={{ color: PAIPERS_COLORS.navy }}>•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="flex items-center justify-center py-1 md:py-0"
          aria-hidden
        >
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full md:rotate-[-90deg]"
            style={{
              background: "hsl(202 100% 94%)",
              color: PAIPERS_COLORS.navy,
            }}
          >
            <ArrowDown size={18} strokeWidth={2.5} />
          </span>
        </div>

        <div className="paipers-card-marine p-[18px] paipers-hover-lift">
          <p
            className="text-[12px] font-bold tracking-[0.06em] uppercase"
            style={{ color: DESKTOP_SURFACES.accentLine, margin: 0 }}
          >
            Avec Paipers
          </p>
          <p className="mt-2 font-extrabold text-base" style={{ color: DESKTOP_SURFACES.onDark }}>
            Une application + Archi
          </p>
          <ul
            className="mt-3 space-y-1.5 text-sm"
            style={{
              color: DESKTOP_SURFACES.onDarkMuted,
              margin: "12px 0 0",
              padding: 0,
              listStyle: "none",
            }}
          >
            {[
              "Documents et infos au même endroit",
              "Échéances et démarches suivies",
              "Archi pour comprendre et avancer",
            ].map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden style={{ color: DESKTOP_SURFACES.accentLine }}>•</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-12 text-center max-w-2xl mx-auto">
        <h3
          className="text-[22px] md:text-[26px] font-extrabold tracking-tight"
          style={{ color: PAIPERS_COLORS.textPrimary }}
        >
          Avec Paipers, tout se retrouve au même endroit.
        </h3>
        <p className="mt-3 leading-relaxed paipers-text-muted">
          Une seule application pour centraliser, comprendre, suivre et agir.
        </p>
      </div>
    </LandingSection>
  );
}
