/**
 * Section liste d’attente (#waitlist) — renforcement rédactionnel, même technique.
 */

import LandingSection from "@/components/landing/LandingSection";
import WaitlistForm from "@/components/landing/WaitlistForm";
import WaitlistSocialProof from "@/components/landing/WaitlistSocialProof";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function LandingWaitlistSection() {
  return (
    <LandingSection id="waitlist" tone="white">
      <div className="max-w-xl mx-auto">
        <div
          className="paipers-elevated-card paipers-hover-lift"
          style={{
            padding: "28px 24px",
            borderRadius: 22,
            border: `1px solid ${PAIPERS_COLORS.border}`,
            background:
              "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
          }}
        >
          <p
            className="text-[13px] font-bold tracking-[0.06em] uppercase text-center"
            style={{ color: PAIPERS_COLORS.navy, margin: 0 }}
          >
            Liste d’attente
          </p>
          <h2
            className="text-center"
            style={{
              margin: "10px 0 0",
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: -0.4,
              color: PAIPERS_COLORS.navy,
            }}
          >
            Fais partie des premiers à découvrir Paipers.
          </h2>
          <p
            className="text-center paipers-text-muted"
            style={{ marginTop: 12, marginBottom: 10, lineHeight: 1.55 }}
          >
            Laisse ton e-mail pour être informé(e) de l’ouverture et suivre les
            prochaines étapes du projet. Inscription gratuite.
          </p>
          <ul
            className="text-sm paipers-text-muted"
            style={{
              margin: "0 0 14px",
              padding: 0,
              listStyle: "none",
              textAlign: "center",
            }}
          >
            {[
              "Être informé(e) du lancement",
              "Découvrir Paipers parmi les premiers",
              "Possibilité de participer aux phases de bêta-test",
            ].map((line) => (
              <li key={line} style={{ marginTop: 6 }}>
                <span style={{ color: PAIPERS_COLORS.navy, fontWeight: 700 }} aria-hidden>
                  ·{" "}
                </span>
                {line}
              </li>
            ))}
          </ul>
          <WaitlistSocialProof />
          <WaitlistForm embedded />
        </div>
      </div>
    </LandingSection>
  );
}
