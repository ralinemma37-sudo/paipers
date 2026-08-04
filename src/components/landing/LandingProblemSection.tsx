/**
 * Section problème — admin dispersé.
 */

import LandingSection from "@/components/landing/LandingSection";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function LandingProblemSection() {
  return (
    <LandingSection tone="canvas">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        L’administratif s’accumule. Personne n’a le temps.
      </h2>
      <p className="mt-4 text-center mx-auto max-w-2xl leading-relaxed paipers-text-muted">
        Factures, contrats, mails, échéances : tout est dispersé. Paipers
        regroupe l’essentiel pour que tu saches quoi faire, et quand.
      </p>
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {[
          {
            t: "Documents éparpillés",
            d: "PDF, photos, pièces jointes… difficiles à retrouver au bon moment.",
            card: "paipers-card-muted",
          },
          {
            t: "Échéances oubliées",
            d: "Renouvellements et dates importantes passent souvent inaperçus.",
            card: "paipers-card-white",
          },
          {
            t: "Trop de friction",
            d: "Rédiger, classer, relancer : autant de tâches chronophages.",
            card: "paipers-card-gradient",
          },
        ].map((c) => (
          <div key={c.t} className={`${c.card} p-[18px] paipers-hover-lift`}>
            <p className="font-extrabold text-base" style={{ color: PAIPERS_COLORS.textPrimary }}>
              {c.t}
            </p>
            <p className="mt-2 text-sm leading-relaxed paipers-text-muted">{c.d}</p>
          </div>
        ))}
      </div>
    </LandingSection>
  );
}
