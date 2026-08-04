/**
 * Sections audiences — particuliers (#particuliers) + professionnels (#professionnels).
 */

import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";

export default function LandingAudienceSection() {
  return (
    <>
      <LandingSection id="particuliers" tone="alt">
        <h2 className="paipers-screen-title" style={{ fontSize: 32 }}>
          Pour les particuliers
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed paipers-text-muted">
          Centralise ton admin perso : documents, emails, assistant et génération
          de courriers. L’espace Personnel est le cœur de Paipers au quotidien.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {["Documents", "Mails", "Assistant", "Générer", "Profil"].map((t) => (
            <span
              key={t}
              className="px-4 py-2 text-sm font-extrabold paipers-card-white"
              style={{ borderRadius: 999, display: "inline-block" }}
            >
              {t}
            </span>
          ))}
        </div>
      </LandingSection>

      <LandingSection id="professionnels" tone="marine">
        <h2 className="text-[32px] font-extrabold tracking-tight" style={{ color: DESKTOP_SURFACES.onDark }}>
          Pour les professionnels
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
          L’espace Professionnel reprend la navigation mobile (Factures, Documents
          Pro, Profil entreprise). Sur le web, certaines fonctions de facturation
          sont encore en préparation : pas de faux clients, pas de chiffre
          d’affaires inventé, pas de checkout trompeur.
        </p>
        <div className="mt-8 paipers-card-night p-[18px]">
          <p className="font-extrabold" style={{ color: DESKTOP_SURFACES.accentLine }}>
            Transparent sur le périmètre
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
            La création complète de factures / devis, la synchro entreprise et la
            facturation électronique opérationnelle restent portées prioritairement
            sur l’app mobile. Le web affiche l’espace et les états réels disponibles.
          </p>
        </div>
      </LandingSection>
    </>
  );
}
