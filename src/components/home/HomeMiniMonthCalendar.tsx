"use client";

/**
 * Mini calendrier mois — Accueil.
 */

import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type Props = {
  eventDays: Set<number>;
  width?: number;
  fill?: boolean;
  /** Texte clair sur carte marine. */
  dark?: boolean;
};

export default function HomeMiniMonthCalendar({
  eventDays,
  width = 140,
  fill = false,
  dark = false,
}: Props) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const today = now.getDate();
  const firstDow = new Date(y, m, 1).getDay();
  const startOffset = (firstDow + 6) % 7;
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const monthLabel = now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const titleColor = dark ? DESKTOP_SURFACES.onDark : PAIPERS_COLORS.textPrimary;
  const mutedColor = dark ? DESKTOP_SURFACES.onDarkMuted : PAIPERS_PALETTES.light.textMuted;
  const dayColor = dark ? DESKTOP_SURFACES.onDark : PAIPERS_COLORS.textPrimary;
  const todayColor = dark ? DESKTOP_SURFACES.accentLine : PAIPERS_COLORS.navy;

  return (
    <div
      style={{
        width: fill ? "100%" : width,
        maxWidth: fill ? 360 : undefined,
        display: "flex",
        flexDirection: "column",
        gap: fill ? 8 : 6,
      }}
    >
      <p
        style={{
          fontSize: fill ? 14 : 12,
          fontWeight: 800,
          color: titleColor,
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
          gap: fill ? 4 : 2,
        }}
      >
        {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
          <span
            key={`${d}-${i}`}
            style={{
              fontSize: fill ? 11 : 9,
              fontWeight: 700,
              color: mutedColor,
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
              fontSize: fill ? 13 : 10,
              fontWeight: d === today ? 800 : 600,
              color: d === today ? todayColor : dayColor,
              textAlign: "center",
              position: "relative",
              paddingBottom: fill ? 8 : 6,
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
                  background: DESKTOP_SURFACES.accentLine,
                }}
              />
            ) : null}
          </span>
        ))}
      </div>
    </div>
  );
}
