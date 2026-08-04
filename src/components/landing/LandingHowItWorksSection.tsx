/**
 * Section « En 3 étapes ».
 */

import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function LandingHowItWorksSection() {
  return (
    <LandingSection tone="alt">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        En 3 étapes
      </h2>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          { n: "1", t: "Crée ton compte", d: "Inscription rapide, puis un onboarding guidé.", card: "paipers-card-white" },
          { n: "2", t: "Importe tes documents", d: "Fichiers, emails connectés, classement assisté.", card: "paipers-card-marine" },
          { n: "3", t: "Agis avec Archi", d: "Questions, génération, suivi de ton admin.", card: "paipers-card-gradient" },
        ].map((s) => (
          <div key={s.n} className={`${s.card} p-[18px] paipers-hover-lift`}>
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold"
              style={{
                background: s.card === "paipers-card-marine" ? "rgba(255,255,255,0.15)" : PAIPERS_COLORS.navy,
                color: "#fff",
              }}
            >
              {s.n}
            </span>
            <p
              className="mt-4 font-extrabold text-lg"
              style={{ color: s.card === "paipers-card-marine" ? DESKTOP_SURFACES.onDark : undefined }}
            >
              {s.t}
            </p>
            <p
              className="mt-2 text-sm leading-relaxed"
              style={{
                color: s.card === "paipers-card-marine" ? DESKTOP_SURFACES.onDarkMuted : undefined,
              }}
            >
              {s.card !== "paipers-card-marine" ? (
                <span className="paipers-text-muted">{s.d}</span>
              ) : (
                s.d
              )}
            </p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
