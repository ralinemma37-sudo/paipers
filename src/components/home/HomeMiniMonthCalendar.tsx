"use client";

/**
 * Réf. : paipers-mobile/src/components/home/HomeMiniMonthCalendar.tsx (usage via HomeTopSquareCards)
 * Affiche le mois courant + jours avec rappel (points).
 */

import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type Props = {
  eventDays: Set<number>;
  width?: number;
};

export default function HomeMiniMonthCalendar({ eventDays, width = 140 }: Props) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = now.getDate();
  const firstDow = new Date(y, m, 1).getDay(); // 0=dim
  const startOffset = (firstDow + 6) % 7; // lundi = 0
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div style={{ width, display: "flex", flexDirection: "column", gap: 6 }}>
      <p
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: PAIPERS_COLORS.textPrimary,
          textTransform: "capitalize",
          margin: 0,
        }}
      >
        {monthLabel}
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
        }}
      >
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span
            key={`${d}-${i}`}
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: PAIPERS_PALETTES.light.textMuted,
              textAlign: "center",
            }}
          >
            {d}
          </span>
        ))}
        {cells.map((d, i) => (
          <span
            key={i}
            style={{
              fontSize: 10,
              fontWeight: d === today ? 800 : 600,
              color:
                d === today
                  ? PAIPERS_COLORS.navy
                  : PAIPERS_COLORS.textPrimary,
              textAlign: "center",
              position: "relative",
              paddingBottom: 6,
              opacity: d == null ? 0 : 1,
            }}
          >
            {d ?? ""}
            {d != null && eventDays.has(d) ? (
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 4,
                  height: 4,
                  borderRadius: 999,
                  background: PAIPERS_COLORS.personalGradientStart,
                }}
              />
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
