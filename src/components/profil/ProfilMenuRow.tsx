"use client";

/**
 * Ligne menu Profil — réf. app/(tabs)/profil/index.tsx
 */

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type Props = {
  href: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
};

export default function ProfilMenuRow({ href, title, desc, Icon }: Props) {
  return (
    <Link
      href={href}
      className="paipers-elevated-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 16px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 14,
          background: "hsl(202 100% 94%)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={PAIPERS_COLORS.navy} strokeWidth={2.2} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontWeight: 800,
            fontSize: 15,
            color: PAIPERS_COLORS.textPrimary,
          }}
        >
          {title}
        </span>
        <span
          className="paipers-text-muted"
          style={{ display: "block", marginTop: 4, fontSize: 13, lineHeight: "18px" }}
        >
          {desc}
        </span>
      </span>
      <ChevronRight size={20} color={PAIPERS_PALETTES.light.textMuted} />
    </Link>
  );
}
