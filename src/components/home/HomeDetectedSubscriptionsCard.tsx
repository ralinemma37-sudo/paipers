"use client";

/**
 * Réf. : paipers-mobile/src/components/home/HomeDetectedSubscriptionsCard.tsx
 */

import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

export type DetectedSubscriptionRow = {
  mergeKey: string;
  name: string;
  amount: number;
  docCount: number;
};

type Props = {
  items: DetectedSubscriptionRow[];
  totalMonthly: number;
  totalYearly: number;
  showWhenEmpty?: boolean;
};

function formatEuro(value: number): string {
  return `${value.toFixed(2).replace(".", ",")} €`;
}

export default function HomeDetectedSubscriptionsCard({
  items,
  totalMonthly,
  totalYearly,
  showWhenEmpty = false,
}: Props) {
  if (items.length === 0 && !showWhenEmpty) return null;

  return (
    <div className="paipers-elevated-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <p
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: PAIPERS_COLORS.textPrimary,
            margin: 0,
          }}
        >
          Abonnements détectés
        </p>
        {items.length > 0 ? (
          <p
            className="paipers-text-muted"
            style={{ fontSize: 14, lineHeight: "20px", margin: "4px 0 0" }}
          >
            {items.length} détecté{items.length > 1 ? "s" : ""} ·{" "}
            <span style={{ fontWeight: 800, color: PAIPERS_COLORS.textPrimary }}>
              {formatEuro(totalMonthly)}
            </span>{" "}
            / mois ·{" "}
            <span style={{ fontWeight: 800, color: PAIPERS_COLORS.textPrimary }}>
              {formatEuro(totalYearly)}
            </span>{" "}
            / an
          </p>
        ) : (
          <p
            className="paipers-text-muted"
            style={{ fontSize: 14, lineHeight: "20px", margin: "4px 0 0" }}
          >
            Importez vos factures et contrats pour repérer automatiquement vos
            abonnements récurrents.
          </p>
        )}
      </div>

      {items.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item) => (
            <div
              key={item.mergeKey}
              style={{
                padding: 14,
                borderRadius: 16,
                background: PAIPERS_PALETTES.light.card,
                border: `1px solid ${PAIPERS_COLORS.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color: PAIPERS_COLORS.textPrimary,
                    margin: 0,
                  }}
                >
                  {item.name}
                </p>
                {item.docCount > 1 ? (
                  <p
                    className="paipers-text-muted"
                    style={{ marginTop: 3, fontSize: 12, marginBottom: 0 }}
                  >
                    {item.docCount} documents fusionnés pour le total
                  </p>
                ) : null}
              </div>
              {item.amount > 0 ? (
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 900,
                    color: PAIPERS_COLORS.textPrimary,
                    margin: 0,
                  }}
                >
                  {formatEuro(item.amount)}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
