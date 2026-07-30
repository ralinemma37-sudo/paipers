"use client";

/**
 * État vide Factures — réf. EmptyInvoicesState.tsx (sans Essayer la démo : non passé sur hub mobile).
 */

import { Receipt } from "lucide-react";
import { PAIPERS_COLORS, PAIPERS_RADIUS } from "@/lib/paipersTheme";

type Props = {
  onCreate: () => void;
};

export default function EmptyInvoicesState({ onCreate }: Props) {
  return (
    <div
      className="paipers-elevated-card"
      style={{
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 12,
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: 16,
          background: "hsl(220 30% 96%)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Receipt size={28} color={PAIPERS_COLORS.navy} strokeWidth={2.2} />
      </span>
      <p
        style={{
          margin: 0,
          fontSize: 18,
          fontWeight: 800,
          color: PAIPERS_COLORS.textPrimary,
        }}
      >
        Créez votre première facture
      </p>
      <p
        className="paipers-text-muted"
        style={{ margin: 0, fontSize: 14, lineHeight: "20px", maxWidth: 360 }}
      >
        Facturez un client en quelques minutes. Paipers prépare le PDF et vous aide à suivre le
        paiement.
      </p>
      <button
        type="button"
        onClick={onCreate}
        style={{
          marginTop: 8,
          padding: "14px 18px",
          borderRadius: PAIPERS_RADIUS.button,
          border: "none",
          background: PAIPERS_COLORS.navy,
          color: "#fff",
          fontWeight: 800,
          fontSize: 15,
          cursor: "pointer",
          width: "100%",
          maxWidth: 280,
        }}
      >
        Créer une facture
      </button>
    </div>
  );
}
