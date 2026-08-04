/**
 * Section liste d’attente (#waitlist).
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
            Rejoins les premiers utilisateurs de Paipers.
          </h2>
          <p
            className="text-center paipers-text-muted"
            style={{ marginTop: 12, marginBottom: 14, lineHeight: 1.55 }}
          >
            Inscris-toi gratuitement. Tu seras averti(e) dès l’ouverture
            officielle et recevras les actualités importantes concernant
            Paipers si tu le souhaites.
          </p>
          <WaitlistSocialProof />
          <WaitlistForm embedded />
        </div>
      </div>
    </LandingSection>
  );
}
