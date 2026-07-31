"use client";

/**
 * Réf. : paipers-mobile/src/components/home/HomeImportInboxSection.tsx
 * + HomeImportReviewList.tsx (actions Importer / Supprimer — sans Aperçu web non branché)
 */

import { useMemo, useState } from "react";
import { PAIPERS_COLORS, PAIPERS_GRADIENTS, PAIPERS_RADIUS, gradientCss } from "@/lib/paipersTheme";

export type HomeImportInboxItem = {
  id: string;
  title: string | null;
  original_filename: string | null;
  created_at: string;
};

type Props = {
  items: HomeImportInboxItem[];
  alwaysShow?: boolean;
  loading?: boolean;
  actionLoadingId?: string | null;
  error?: string;
  onImport: (id: string) => void;
  onIgnore: (id: string) => void;
};

const VISIBLE_COUNT = 3;

function formatDateFr(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function HomeImportInboxSection({
  items,
  alwaysShow = false,
  loading = false,
  actionLoadingId = null,
  error,
  onImport,
  onIgnore,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const count = items.length;

  const visible = useMemo(() => {
    if (expanded) return items;
    return items.slice(0, VISIBLE_COUNT);
  }, [expanded, items]);

  const hiddenCount = Math.max(0, count - VISIBLE_COUNT);

  if (!alwaysShow && count <= 0 && !loading) return null;

  const subtitle =
    count > 0
      ? `${count} pièce${count > 1 ? "s" : ""} depuis votre boîte mail — bulletins, factures, relevés…`
      : "Pièces jointes détectées depuis votre boîte mail connectée";

  return (
    <div
      className="paipers-card-gradient md:!p-4"
      style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 0, padding: 16 }}
    >
      <div>
        <p style={{ fontWeight: 800, color: PAIPERS_COLORS.textPrimary, fontSize: 15, margin: 0 }}>
          À importer
        </p>
        <p
          className="paipers-text-muted"
          style={{ marginTop: 4, fontSize: 12, lineHeight: "17px", marginBottom: 0 }}
        >
          {subtitle}
        </p>
      </div>

      {error ? (
        <p style={{ color: "#B91C1C", fontSize: 13, margin: 0 }}>{error}</p>
      ) : null}

      {loading ? (
        <p className="paipers-text-muted" style={{ fontSize: 13, margin: 0 }}>
          Chargement…
        </p>
      ) : null}

      {!loading && count > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {visible.map((d) => {
            const busy = actionLoadingId === d.id;
            const label = d.original_filename || d.title || "Pièce jointe";
            return (
              <div
                key={d.id}
                style={{
                  padding: 14,
                  borderRadius: 16,
                  border: `1px solid ${PAIPERS_COLORS.border}`,
                  background: "#fff",
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: PAIPERS_COLORS.textPrimary,
                    margin: 0,
                  }}
                >
                  {label}
                </p>
                <p
                  className="paipers-text-muted"
                  style={{ marginTop: 4, fontSize: 12, marginBottom: 0 }}
                >
                  {formatDateFr(d.created_at)}
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onImport(d.id)}
                    style={{
                      flex: 1,
                      padding: "12px 8px",
                      borderRadius: PAIPERS_RADIUS.button,
                      border: "none",
                      backgroundImage: gradientCss(PAIPERS_GRADIENTS.button, 90),
                      fontWeight: 800,
                      fontSize: 12,
                      color: PAIPERS_COLORS.textPrimary,
                      cursor: busy ? "wait" : "pointer",
                      opacity: busy ? 0.55 : 1,
                    }}
                  >
                    {busy ? "…" : "Importer"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onIgnore(d.id)}
                    style={{
                      flex: 1,
                      padding: "12px 8px",
                      borderRadius: PAIPERS_RADIUS.button,
                      border: `1px solid ${PAIPERS_COLORS.border}`,
                      background: "#fff",
                      fontWeight: 800,
                      fontSize: 12,
                      color: PAIPERS_COLORS.textPrimary,
                      cursor: busy ? "wait" : "pointer",
                      opacity: busy ? 0.55 : 1,
                    }}
                  >
                    {busy ? "…" : "Supprimer"}
                  </button>
                </div>
              </div>
            );
          })}

          {hiddenCount > 0 ? (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              style={{
                padding: "14px 8px",
                borderRadius: PAIPERS_RADIUS.button,
                border: `1px solid ${PAIPERS_COLORS.border}`,
                background: "#fff",
                fontWeight: 800,
                fontSize: 13,
                color: PAIPERS_COLORS.textPrimary,
                cursor: "pointer",
              }}
            >
              {expanded ? "Voir moins" : `Voir plus (${hiddenCount})`}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
