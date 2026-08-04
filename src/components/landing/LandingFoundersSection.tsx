/**
 * Section fondatrices — crédibilité humaine, sans photo (aucune photo réelle fournie).
 */

import LandingSection from "@/components/landing/LandingSection";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function LandingFoundersSection() {
  return (
    <LandingSection tone="white">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        Une histoire de famille devenue un projet.
      </h2>
      <p className="mt-4 text-center mx-auto max-w-2xl leading-relaxed paipers-text-muted">
        Paipers est né d’un constat simple : notre administratif est partout,
        alors qu’il devrait nous simplifier la vie. Vanessa a imaginé le
        concept. Emma l’a transformé en application. Aujourd’hui, nous
        construisons Paipers ensemble avec une ambition : rendre
        l’administratif beaucoup plus simple à gérer au quotidien.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto">
        <div className="paipers-card-muted p-[18px] paipers-hover-lift">
          <p className="font-extrabold text-lg" style={{ color: PAIPERS_COLORS.textPrimary }}>
            Vanessa
          </p>
          <p className="mt-2 text-sm leading-relaxed paipers-text-muted">
            À l’origine de l’idée. Pilote principalement les aspects
            administratifs, financiers et le développement du projet.
          </p>
        </div>
        <div className="paipers-card-white p-[18px] paipers-hover-lift">
          <p className="font-extrabold text-lg" style={{ color: PAIPERS_COLORS.textPrimary }}>
            Emma
          </p>
          <p className="mt-2 text-sm leading-relaxed paipers-text-muted">
            Développe principalement l’application. Construit Paipers aux côtés
            de Vanessa.
          </p>
        </div>
      </div>
      <p className="mt-6 text-center text-sm font-semibold" style={{ color: PAIPERS_COLORS.navy }}>
        Mère et fille · Un projet construit ensemble
      </p>
    </LandingSection>
  );
}
