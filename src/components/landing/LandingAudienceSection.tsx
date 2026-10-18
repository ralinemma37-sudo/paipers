/**
 * Sections audiences — particuliers (#particuliers, prune) + professionnels (#professionnels, bleu marine).
 * 18/10 (choix Vanessa) : couleurs des espaces de l'appli — prune en Personnel, bleu marine en Pro.
 */

import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";

function Chips({ items, color }: { items: string[]; color: string }) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {items.map((t) => (
        <span
          key={t}
          className="px-4 py-2 text-sm font-extrabold"
          style={{ borderRadius: 999, display: "inline-block", background: "#FFFFFF", color }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export default function LandingAudienceSection() {
  return (
    <>
      <LandingSection id="particuliers" tone="night">
        <h2 className="text-[32px] font-extrabold tracking-tight" style={{ color: DESKTOP_SURFACES.onDark }}>
          Pour les particuliers
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
          Centralise ton admin perso : documents rangés tout seuls, mails triés, budget et abonnements,
          courriers générés et Archi pour t’aider. L’espace Personnel est le cœur de Paipers au quotidien.
        </p>
        <Chips items={["Documents", "Mails", "Mon budget", "Générer", "Archi"]} color="#493653" />
      </LandingSection>

      <LandingSection id="professionnels" tone="marine">
        <h2 className="text-[32px] font-extrabold tracking-tight" style={{ color: DESKTOP_SURFACES.onDark }}>
          Pour les professionnels
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
          Un espace Professionnel séparé pour ton activité : factures et devis, documents de l’entreprise,
          trésorerie et conformité e-facture. L’espace Personnel est inclus dans l’offre Pro.
        </p>
        <Chips items={["Factures & devis", "Documents Pro", "Trésorerie", "Fiche entreprise", "E-facture"]} color="#1A2B4A" />
      </LandingSection>
    </>
  );
}
