/**
 * Section Archi (#archi) — fil conducteur, contrôle utilisateur.
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
          <p
            className="text-[13px] font-bold tracking-[0.08em] uppercase mb-3"
            style={{ color: DESKTOP_SURFACES.accentLine }}
          >
            Archi
          </p>
          <h2 className="text-[32px] font-extrabold tracking-tight" style={{ color: DESKTOP_SURFACES.onDark }}>
            Ton assistant administratif
          </h2>
          <p
            className="mt-3 text-base font-extrabold"
            style={{ color: DESKTOP_SURFACES.accentLine }}
          >
            Archi surveille. Tu gardes le contrôle.
          </p>
          <p className="mt-4 leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
            Archi t’aide à repérer ce qui mérite ton attention, à retrouver une
            information et à avancer dans ton administratif — sans prendre de
            décisions à ta place.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Détecte ce qui mérite ton attention",
              "Aide à retrouver une information utile",
              "Signale une échéance importante",
              "T’accompagne dans tes démarches administratives",
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
            <img
              src={PAIPERS_ASSETS.mascot}
              alt="Archi, l’assistant administratif Paipers"
              className="w-52 md:w-60 h-auto mx-auto"
              width={240}
              height={240}
              decoding="async"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
