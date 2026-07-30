"use client";

/**
 * Contenu segment Factures — réf. ProFacturesScreen.tsx (état vide uniquement côté web).
 * Aucune liste / montant / facture fictive : backend invoices non branché sur le web.
 */

import { ClipboardList, Receipt } from "lucide-react";
import EmptyInvoicesState from "@/components/factures/EmptyInvoicesState";
import { PAIPERS_COLORS, PAIPERS_RADIUS } from "@/lib/paipersTheme";

const PRO_ACCENT = "hsl(220 58% 24%)";

type Props = {
  onUnavailable: (action: "facture" | "devis") => void;
};

function CreateDocActionButton({
  label,
  variant,
  onClick,
}: {
  label: string;
  variant: "facture" | "devis";
  onClick: () => void;
}) {
  const isFacture = variant === "facture";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1,
        minHeight: 108,
        padding: "16px 12px",
        borderRadius: PAIPERS_RADIUS.card,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 8px 24px rgba(26, 43, 74, 0.08)",
        ...(isFacture
          ? { background: PRO_ACCENT, border: "none" }
          : {
              background: "#fff",
              border: `2px solid ${PRO_ACCENT}`,
            }),
      }}
    >
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          background: isFacture ? "rgba(255,255,255,0.22)" : "#fff",
        }}
      >
        {isFacture ? (
          <Receipt size={26} color="#fff" strokeWidth={2.25} />
        ) : (
          <ClipboardList size={26} color={PRO_ACCENT} strokeWidth={2.25} />
        )}
      </span>
      <span
        style={{
          fontWeight: 900,
          fontSize: 14,
          textAlign: "center",
          lineHeight: "18px",
          color: isFacture ? "#fff" : PRO_ACCENT,
        }}
      >
        {label}
      </span>
    </button>
  );
}

export default function ProFacturesHub({ onUnavailable }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <p
        className="paipers-text-muted"
        style={{ margin: 0, fontSize: 15, lineHeight: "22px" }}
      >
        Créez, envoyez et suivez vos factures.
      </p>

      <div style={{ display: "flex", flexDirection: "row", gap: 12 }}>
        <CreateDocActionButton
          variant="facture"
          label="Nouvelle facture"
          onClick={() => onUnavailable("facture")}
        />
        <CreateDocActionButton
          variant="devis"
          label="Nouveau devis"
          onClick={() => onUnavailable("devis")}
        />
      </div>

      <EmptyInvoicesState onCreate={() => onUnavailable("facture")} />

      <p
        className="paipers-text-muted"
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: "17px",
          textAlign: "center",
          color: PAIPERS_COLORS.neutral,
        }}
      >
        Aucune facture ou devis n’est chargé depuis la base sur le web pour le moment. Aucune donnée
        de démonstration n’est affichée.
      </p>
    </div>
  );
}
