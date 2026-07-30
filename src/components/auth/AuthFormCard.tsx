"use client";

/**
 * Carte auth centrée — miroir AuthFormCard mobile.
 * Réf. : paipers-mobile/src/components/AuthFormCard.tsx
 */

import type { ReactNode } from "react";
import { PAIPERS_COLORS, PAIPERS_PALETTES, PAIPERS_RADIUS } from "@/lib/paipersTheme";

type Props = {
  title?: string;
  subtitle?: string;
  brand?: ReactNode;
  children: ReactNode;
};

export default function AuthFormCard({ title, subtitle, brand, children }: Props) {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-8"
      style={{ background: PAIPERS_PALETTES.light.background }}
    >
      <div
        className="w-full"
        style={{
          maxWidth: 420,
          background: PAIPERS_PALETTES.light.card,
          borderRadius: PAIPERS_RADIUS.card,
          border: `1px solid ${PAIPERS_COLORS.border}`,
          padding: "28px 22px",
          boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
        }}
      >
        {brand ? (
          <div
            className="flex justify-center"
            style={{ marginBottom: title || subtitle ? 22 : 8 }}
          >
            {brand}
          </div>
        ) : null}

        {title ? (
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              textAlign: "center",
              color: PAIPERS_COLORS.textPrimary,
              letterSpacing: "-0.3px",
              margin: 0,
            }}
          >
            {title}
          </h1>
        ) : null}

        {subtitle ? (
          <p
            style={{
              marginTop: title ? 10 : 0,
              textAlign: "center",
              color: PAIPERS_PALETTES.light.textMuted,
              fontSize: 15,
              lineHeight: "22px",
              marginBottom: 0,
            }}
          >
            {subtitle}
          </p>
        ) : null}

        <div
          className="flex flex-col"
          style={{ marginTop: title || subtitle ? 26 : 20, gap: 12 }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
