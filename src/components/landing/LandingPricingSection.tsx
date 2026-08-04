/**
 * Section tarifs (#tarifs).
 */

import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function LandingPricingSection() {
  return (
    <LandingSection id="tarifs" tone="canvas">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        Tarifs simples
      </h2>
      <p className="mt-3 text-center paipers-text-muted">
        Les formules suivront l’offre Paipers à l’ouverture. Rejoins la liste
        d’attente pour être informé(e) en priorité.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 max-w-3xl mx-auto">
        <div className="paipers-card-white p-[22px] paipers-hover-lift">
          <p className="text-sm font-extrabold" style={{ color: PAIPERS_COLORS.navy }}>
            Personnel
          </p>
          <p className="mt-2 text-3xl font-extrabold">
            6,99 € <span className="text-base font-bold paipers-text-muted">/ mois</span>
          </p>
          <p className="mt-2 text-sm font-semibold">7 jours d’essai au lancement</p>
          <a href="#waitlist" className="paipers-button mt-6 w-full text-center" style={{ display: "block", textDecoration: "none" }}>
            Rejoindre la liste d’attente
          </a>
        </div>
        <div className="paipers-card-night p-[22px] paipers-hover-lift">
          <p className="text-sm font-extrabold" style={{ color: DESKTOP_SURFACES.accentLine }}>
            Offre Professionnelle
          </p>
          <p className="mt-2 text-3xl font-extrabold" style={{ color: DESKTOP_SURFACES.onDark }}>
            29,99 € <span className="text-base font-bold" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>/ mois</span>
          </p>
          <p className="mt-2 text-sm font-semibold" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
            14 jours d’essai au lancement
          </p>
          <a href="#waitlist" className="paipers-button mt-6 w-full text-center" style={{ display: "block", textDecoration: "none" }}>
            Rejoindre la liste d’attente
          </a>
          <p className="mt-3 text-xs leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
            Aucun abonnement Pro n’est activé automatiquement sur le web. Le checkout n’est
            pas encore disponible.
          </p>
        </div>
      </div>
    </LandingSection>
  );
}
