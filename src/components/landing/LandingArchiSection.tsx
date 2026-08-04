/**
 * Section Archi (#archi).
 */

import { Check } from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_ASSETS } from "@/lib/paipersTheme";

export default function LandingArchiSection() {
  return (
    <LandingSection id="archi" tone="marine">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="order-2 lg:order-1">
          <h2 className="text-[32px] font-extrabold tracking-tight" style={{ color: DESKTOP_SURFACES.onDark }}>
            Archi, ton assistant administratif
          </h2>
          <p className="mt-4 leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
            Archi t’aide à comprendre un document, à préparer une démarche et à
            rester dans le périmètre administratif. Ce n’est pas un chatbot
            généraliste : il reste centré sur ton admin Paipers.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Réponses guidées sur tes documents",
              "Actions vers Documents, Générer ou Profil",
              "Pas de fausses suggestions inventées",
            ].map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm font-semibold" style={{ color: DESKTOP_SURFACES.onDark }}>
                <Check size={18} color={DESKTOP_SURFACES.accentLine} className="mt-0.5 shrink-0" />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 lg:order-2 flex justify-center">
          <div className="paipers-card-night p-10 paipers-hover-lift">
            <img src={PAIPERS_ASSETS.mascot} alt="Archi" className="w-52 md:w-60 h-auto mx-auto" />
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
