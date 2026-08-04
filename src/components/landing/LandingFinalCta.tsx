/**
 * CTA final (#essayer).
 */

import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_RADIUS } from "@/lib/paipersTheme";

export default function LandingFinalCta() {
  return (
    <LandingSection className="text-center" id="essayer" tone="night">
      <div className="paipers-card-marine py-12 px-6">
        <h2 className="text-[32px] font-extrabold tracking-tight" style={{ color: DESKTOP_SURFACES.onDark }}>
          Sois parmi les premiers.
        </h2>
        <p className="mt-3 mx-auto max-w-xl" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
          Rejoins la liste d’attente et sois informé(e) en priorité de
          l’ouverture de Paipers.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a href="#waitlist" className="paipers-button" style={{ minWidth: 200, textAlign: "center", textDecoration: "none" }}>
            Rejoindre la liste d’attente
          </a>
          <a
            href="#fonctionnalites"
            className="inline-flex items-center justify-center font-extrabold px-6 py-3.5"
            style={{
              borderRadius: PAIPERS_RADIUS.button,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: DESKTOP_SURFACES.onDark,
              textDecoration: "none",
              minWidth: 200,
            }}
          >
            Découvrir Paipers
          </a>
        </div>
      </div>
    </LandingSection>
  );
}
