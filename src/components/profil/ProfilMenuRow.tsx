"use client";

/**
 * Ligne menu Profil — variantes de contraste desktop.
 */

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type Props = {
  href: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  tone?: "white" | "muted" | "marine" | "gradient";
};

export default function ProfilMenuRow({
  href,
  title,
  desc,
  Icon,
  tone = "white",
}: Props) {
  const dark = tone === "marine";
  const cls =
    tone === "marine"
      ? "paipers-card-marine"
      : tone === "muted"
        ? "paipers-card-muted"
        : tone === "gradient"
          ? "paipers-card-gradient"
          : "paipers-card-white";

  return (
    <Link
      href={href}
      className={`${cls} h-full md:min-h-0 md:flex-col md:items-start md:gap-3 paipers-hover-lift`}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 14px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: dark ? "rgba(255,255,255,0.12)" : "hsl(202 100% 94%)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon
          size={20}
          color={dark ? DESKTOP_SURFACES.onDark : PAIPERS_COLORS.navy}
          strokeWidth={2.2}
        />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontWeight: 800,
            fontSize: 15,
            color: dark ? DESKTOP_SURFACES.onDark : PAIPERS_COLORS.textPrimary,
          }}
        >
          {title}
        </span>
        <span
          className={dark ? undefined : "paipers-text-muted"}
          style={{
            display: "block",
            marginTop: 4,
            fontSize: 13,
            lineHeight: "18px",
            color: dark ? DESKTOP_SURFACES.onDarkMuted : undefined,
          }}
        >
          {desc}
        </span>
      </span>
      <ChevronRight
        size={18}
        color={dark ? DESKTOP_SURFACES.onDarkSoft : PAIPERS_PALETTES.light.textMuted}
        className="md:hidden"
      />
    </Link>
  );
}
