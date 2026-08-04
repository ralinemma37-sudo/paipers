/**
 * Section confiance — affirmations sobres, validation humaine.
 */

import { Shield } from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";

export default function LandingSecuritySection() {
  return (
    <LandingSection tone="white">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="paipers-card-night p-[18px] flex items-center gap-4">
          <Shield size={40} color={DESKTOP_SURFACES.accentLine} />
          <div>
            <p className="font-extrabold text-lg" style={{ color: DESKTOP_SURFACES.onDark }}>
              Tes données, ton contrôle
            </p>
            <p className="mt-1 text-sm" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
              Connexions e-mail via OAuth. Actions importantes sous ta validation.
            </p>
          </div>
        </div>
        <div>
          <h2 className="paipers-screen-title" style={{ fontSize: 28 }}>
            L’IA aide. Toi, tu valides.
          </h2>
          <p className="mt-3 leading-relaxed paipers-text-muted">
            Paipers propose des analyses et des aides à l’action. Les imports à
            revoir, les suppressions et les connexions e-mail restent sous ton
            contrôle. Archi n’agit pas à ta place.
          </p>
        </div>
      </div>
    </LandingSection>
  );
}
