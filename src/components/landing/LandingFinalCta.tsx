/**
 * CTA final (#essayer).
 */

import { APP_HOME_URL, APP_LOGIN_URL, APP_SIGNUP_URL } from "@/lib/appLinks";
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
          Crée ton compte en une minute : 7 jours d’essai gratuit en Personnel,
          14 jours en Pro.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <a href={APP_SIGNUP_URL} className="paipers-button" style={{ minWidth: 200, textAlign: "center", textDecoration: "none" }}>
            Créer mon compte
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
            Découvrir Plaidoc
          </a>
        </div>
      </div>
    </LandingSection>
  );
}
