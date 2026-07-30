"use client";

/**
 * Réf. : paipers-mobile/src/components/auth/SignupPlanPicker.tsx
 */

import {
  SIGNUP_SPACE_CARDS,
  signupSpaceAccent,
  type OnboardingSpaceChoice,
} from "@/lib/signup/signupSpaceContent";
import { PAIPERS_COLORS, PAIPERS_PALETTES, PAIPERS_RADIUS } from "@/lib/paipersTheme";

type Props = {
  value: OnboardingSpaceChoice;
  onChange: (space: OnboardingSpaceChoice) => void;
};

const SPACES: OnboardingSpaceChoice[] = ["personal", "professional"];

export default function SignupPlanPicker({ value, onChange }: Props) {
  return (
    <div className="flex flex-col" style={{ gap: 12 }}>
      {SPACES.map((space) => {
        const card = SIGNUP_SPACE_CARDS[space];
        const selected = value === space;
        const accent = signupSpaceAccent(space);

        return (
          <button
            key={space}
            type="button"
            onClick={() => onChange(space)}
            aria-pressed={selected}
            className="text-left w-full"
            style={{
              borderRadius: PAIPERS_RADIUS.card,
              borderWidth: selected ? 2 : 1,
              borderStyle: "solid",
              borderColor: selected ? accent.border : PAIPERS_COLORS.border,
              background: PAIPERS_PALETTES.light.card,
              padding: 16,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 900,
                  color: PAIPERS_COLORS.textPrimary,
                }}
              >
                {card.title}
              </span>
              <span
                style={{
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: accent.badgeBg,
                  fontSize: 12,
                  fontWeight: 800,
                  color: accent.badgeText,
                }}
              >
                {card.badge}
              </span>
            </div>

            <p
              style={{
                marginTop: 10,
                fontSize: 14,
                lineHeight: "20px",
                color: PAIPERS_PALETTES.light.textMuted,
              }}
            >
              {card.description}
            </p>

            {card.trialLine ? (
              <p
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  fontWeight: 800,
                  color: accent.badgeText,
                }}
              >
                {card.trialLine}
              </p>
            ) : null}

            <ul
              className="list-none p-0 m-0"
              style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}
            >
              {card.benefits.map((benefit) => (
                <li
                  key={benefit}
                  style={{
                    fontSize: 13,
                    lineHeight: "19px",
                    color: PAIPERS_COLORS.textPrimary,
                  }}
                >
                  · {benefit}
                </li>
              ))}
            </ul>

            <div
              style={{
                marginTop: 12,
                padding: "12px 0",
                borderRadius: PAIPERS_RADIUS.button,
                borderWidth: selected ? 2 : 1,
                borderStyle: "solid",
                borderColor: selected ? accent.ctaBorder : PAIPERS_COLORS.border,
                background: selected ? accent.badgeBg : PAIPERS_PALETTES.light.muted,
                textAlign: "center",
                fontSize: 15,
                fontWeight: 800,
                color: selected ? accent.ctaText : PAIPERS_COLORS.textPrimary,
              }}
            >
              {selected ? `✓ ${card.cta}` : card.cta}
            </div>
          </button>
        );
      })}
    </div>
  );
}
