"use client";

/**
 * Carte identité — réf. ProfilIdentityCard.tsx
 */

import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type Props = {
  name: string;
  email: string;
  badge: string;
  href: string;
};

export default function ProfilIdentityCard({ name, email, badge, href }: Props) {
  return (
    <Link
      href={href}
      className="paipers-elevated-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: 16,
        textDecoration: "none",
        color: "inherit",
        marginBottom: 16,
      }}
    >
      <span
        style={{
          width: 56,
          height: 56,
          borderRadius: 999,
          background: "hsl(202 100% 92%)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <User size={26} color={PAIPERS_COLORS.navy} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          className="paipers-text-muted"
          style={{
            display: "block",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 0.2,
          }}
        >
          {badge}
        </span>
        <span
          style={{
            display: "block",
            fontSize: 18,
            fontWeight: 800,
            color: PAIPERS_COLORS.textPrimary,
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </span>
        <span
          className="paipers-text-muted"
          style={{
            display: "block",
            fontSize: 13,
            marginTop: 2,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {email || "—"}
        </span>
      </span>
      <ChevronRight size={20} color={PAIPERS_PALETTES.light.textMuted} />
    </Link>
  );
}
