/**
 * Section sécurité / validation humaine.
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
              Sécurité & validation humaine
            </p>
            <p className="mt-1 text-sm" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
              Tu restes maître des actions importantes.
            </p>
          </div>
        </div>
        <div>
          <h2 className="paipers-screen-title" style={{ fontSize: 28 }}>
            L’IA aide. Toi, tu valides.
          </h2>
          <p className="mt-3 leading-relaxed paipers-text-muted">
            Paipers propose des analyses et des aides à l’action. Les imports à
            revoir, les suppressions et les connexions email restent sous ton
            contrôle — pas d’automatisation totale inventée.
          </p>
        </div>
      </div>
    </LandingSection>
  );
}
