"use client";

/**
 * Ligne menu Profil — cartes blanches, texte centré sous l’icône (desktop).
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
      className="paipers-card-white h-full paipers-hover-lift"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: 12,
        padding: "18px 16px",
        textDecoration: "none",
        color: "inherit",
        textAlign: "center",
        minHeight: 148,
      }}
    >
      <span
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "hsl(202 100% 94%)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={PAIPERS_COLORS.navy} strokeWidth={2.2} />
      </span>
      <span style={{ width: "100%", minWidth: 0 }}>
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
          style={{
            display: "block",
            marginTop: 6,
            fontSize: 13,
            lineHeight: "18px",
          }}
        >
          {desc}
        </span>
      </span>
      <ChevronRight
        size={18}
        color={PAIPERS_PALETTES.light.textMuted}
        className="md:hidden"
        style={{ position: "absolute", right: 14, top: "50%", marginTop: -9 }}
      />
    </Link>
  );
}
