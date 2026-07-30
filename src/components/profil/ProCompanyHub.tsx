"use client";

/**
 * Mon entreprise (Pro) — hub visuel fidèle, sans stockage inventé.
 * Réf. ProCompanyInformationsScreen.tsx
 */

import { ChevronRight } from "lucide-react";
import ProfilSubpageHeader from "@/components/profil/ProfilSubpageHeader";
import { E_INVOICE_DISCLAIMER, PAIPERS_NOT_PDP } from "@/lib/eInvoicingCopy";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

const CARDS = [
  {
    title: "Identité entreprise",
    description: "Nom, forme juridique, activité, SIRET, adresse",
    status: "Non branché sur le web",
  },
  {
    title: "Facturation",
    description: "TVA, IBAN, email de facturation, paramètres facture",
    status: "Non branché sur le web",
  },
  {
    title: "Comptabilité & e-facture",
    description: "Comptable, plateforme agréée, préparation e-facture",
    status: "Non branché sur le web",
  },
] as const;

export default function ProCompanyHub() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <ProfilSubpageHeader
        title="Mon entreprise"
        subtitle="Ces informations sont utilisées pour vos factures, devis et exports."
      />

      <div
        className="paipers-elevated-card"
        style={{ padding: 14, fontSize: 13, lineHeight: "18px" }}
      >
        <p style={{ margin: 0, fontWeight: 800, color: PAIPERS_COLORS.textPrimary }}>
          Stockage entreprise absent sur le web
        </p>
        <p className="paipers-text-muted" style={{ margin: "6px 0 0" }}>
          Sur mobile, ces données vivent dans le workspace Pro (<code>pro_entities</code> /
          facturation locale). Aucune colonne entreprise n’est écrite dans{" "}
          <code>profiles</code> ici — aucune saisie n’est présentée comme persistée.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {CARDS.map((card) => (
          <div
            key={card.title}
            className="paipers-elevated-card"
            style={{
              padding: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
              opacity: 0.92,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 800, fontSize: 15 }}>{card.title}</p>
              <p
                className="paipers-text-muted"
                style={{ margin: "4px 0 0", fontSize: 13, lineHeight: "18px" }}
              >
                {card.description}
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 12,
                  fontWeight: 700,
                  color: PAIPERS_COLORS.neutral,
                }}
              >
                {card.status}
              </p>
            </div>
            <ChevronRight size={18} color={PAIPERS_PALETTES.light.textMuted} aria-hidden />
          </div>
        ))}
      </div>

      <div
        className="paipers-elevated-card"
        style={{ padding: 14, fontSize: 12, lineHeight: "17px" }}
      >
        <p style={{ margin: 0, fontWeight: 800 }}>{PAIPERS_NOT_PDP}</p>
        <p className="paipers-text-muted" style={{ margin: "6px 0 0" }}>
          {E_INVOICE_DISCLAIMER}
        </p>
      </div>
    </div>
  );
}
