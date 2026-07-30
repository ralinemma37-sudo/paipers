"use client";

/**
 * Réf. : paipers-mobile/src/components/PasswordStrengthMeter.tsx
 */

import { analyzePassword } from "@/lib/passwordStrength";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

const SEGMENT_COLORS = {
  0: "transparent",
  1: "#FECACA",
  2: "#FDBA74",
  3: "#FDE047",
  4: "#86EFAC",
} as const;

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const { score, checks, label, level } = analyzePassword(password);

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      <div className="flex" style={{ gap: 6 }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 999,
              backgroundColor:
                i <= score
                  ? SEGMENT_COLORS[score as 1 | 2 | 3 | 4]
                  : PAIPERS_COLORS.border,
              opacity: level === "vide" ? 0.35 : 1,
            }}
          />
        ))}
      </div>

      {label ? (
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            margin: 0,
            color:
              level === "fort"
                ? "#15803D"
                : level === "moyen"
                  ? "#A16207"
                  : level === "faible" || level === "trop_court"
                    ? "#B45309"
                    : PAIPERS_PALETTES.light.textMuted,
          }}
        >
          {label}
        </p>
      ) : null}

      <div className="flex flex-col" style={{ gap: 4 }}>
        <CheckRow ok={checks.minLength} text="Au moins 8 caractères" />
        <CheckRow ok={checks.lower} text="Une minuscule" />
        <CheckRow ok={checks.upper} text="Une majuscule" />
        <CheckRow ok={checks.digit} text="Un chiffre" />
        <CheckRow ok={checks.special} text="Un symbole (!@#…)" />
      </div>
    </div>
  );
}

function CheckRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center" style={{ gap: 8 }}>
      <span
        aria-hidden
        style={{
          width: 18,
          height: 18,
          borderRadius: 999,
          border: `1.5px solid ${ok ? "#16A34A" : PAIPERS_COLORS.border}`,
          background: ok ? "#DCFCE7" : "transparent",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          color: "#16A34A",
          fontWeight: 800,
        }}
      >
        {ok ? "✓" : ""}
      </span>
      <span
        style={{
          fontSize: 13,
          color: ok ? PAIPERS_COLORS.textPrimary : PAIPERS_PALETTES.light.textMuted,
        }}
      >
        {text}
      </span>
    </div>
  );
}
