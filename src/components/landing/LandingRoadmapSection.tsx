/**
 * Roadmap discrète — éléments factuels fournis pour la vitrine (sans dates).
 */

import { Check } from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

const DONE = [
  "Société créée",
  "Application développée",
  "Site & liste d’attente en ligne",
] as const;

const NEXT = ["Préparation de la bêta", "Lancement"] as const;

export default function LandingRoadmapSection() {
  return (
    <LandingSection tone="canvas">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        Paipers avance déjà.
      </h2>
      <p className="mt-3 text-center paipers-text-muted max-w-xl mx-auto">
        Le projet existe. Voici où nous en sommes — sans promesse de date.
      </p>

      <div className="mt-10 max-w-xl mx-auto space-y-3">
        {DONE.map((label) => (
          <div
            key={label}
            className="paipers-card-white flex items-center gap-3 px-4 py-3.5"
          >
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ background: "hsl(202 100% 94%)" }}
              aria-hidden
            >
              <Check size={16} color={PAIPERS_COLORS.navy} strokeWidth={2.75} />
            </span>
            <p className="text-sm font-extrabold" style={{ color: PAIPERS_COLORS.textPrimary, margin: 0 }}>
              {label}
            </p>
          </div>
        ))}
        {NEXT.map((label) => (
          <div
            key={label}
            className="paipers-card-muted flex items-center gap-3 px-4 py-3.5"
          >
            <span
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-extrabold"
              style={{
                background: PAIPERS_COLORS.navyMuted,
                color: PAIPERS_COLORS.navy,
              }}
              aria-hidden
            >
              →
            </span>
            <p className="text-sm font-extrabold" style={{ color: PAIPERS_COLORS.textPrimary, margin: 0 }}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
