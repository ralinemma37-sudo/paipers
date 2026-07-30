"use client";

/**
 * Sélecteur Factures | Générer — réf. paipers-mobile FacturesGenererSegment.tsx
 */

import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

export type FacturesGenererSection = "factures" | "generer";

type Props = {
  value: FacturesGenererSection;
  onChange: (value: FacturesGenererSection) => void;
};

const PRO_ACCENT = "hsl(220 58% 24%)";

export default function FacturesGenererSegment({ value, onChange }: Props) {
  const options: { id: FacturesGenererSection; label: string }[] = [
    { id: "factures", label: "Factures" },
    { id: "generer", label: "Générer" },
  ];

  return (
    <div
      role="tablist"
      aria-label="Factures ou Générer"
      style={{
        display: "flex",
        flexDirection: "row",
        padding: 4,
        borderRadius: 14,
        background: PAIPERS_PALETTES.light.muted,
        border: `1px solid ${PAIPERS_COLORS.border}`,
        gap: 4,
      }}
    >
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            style={{
              flex: 1,
              padding: "11px 8px",
              borderRadius: 10,
              border: "none",
              background: active ? PRO_ACCENT : "transparent",
              color: active ? "#fff" : PAIPERS_COLORS.textPrimary,
              fontSize: 15,
              fontWeight: 800,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
