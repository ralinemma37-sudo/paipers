"use client";

/**
 * Carte hub Générer — variantes desktop premium (visuel uniquement).
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type Props = {
  href: string;
  title: string;
  desc: string;
  Icon: LucideIcon;
  badgePastel: string;
  vivid: string;
  unavailable?: boolean;
  onUnavailable?: () => void;
  /** Variante visuelle desktop */
  tone?: "white" | "marine" | "gradient" | "violet";
};

export default function GenererActionCard({
  href,
  title,
  desc,
  Icon,
  badgePastel,
  vivid,
  unavailable,
  onUnavailable,
  tone = "white",
}: Props) {
  const dark = tone === "marine" || tone === "violet";
  const toneClass =
    tone === "marine"
      ? "paipers-card-marine"
      : tone === "violet"
        ? "paipers-card-violet"
        : tone === "gradient"
          ? "paipers-card-gradient"
          : "paipers-card-white";

  const titleColor = dark ? DESKTOP_SURFACES.onDark : PAIPERS_COLORS.textPrimary;
  const descColor = dark ? DESKTOP_SURFACES.onDarkMuted : undefined;

  const inner = (
    <>
      <span
        className="md:mb-3"
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: dark ? "rgba(255,255,255,0.12)" : badgePastel,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={22} color={dark ? DESKTOP_SURFACES.onDark : vivid} strokeWidth={2.2} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 17,
            fontWeight: 800,
            color: titleColor,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </span>
        <span
          className={dark ? undefined : "paipers-text-muted"}
          style={{
            display: "block",
            marginTop: 6,
            fontSize: 13,
            lineHeight: "19px",
            color: descColor,
          }}
        >
          {desc}
        </span>
      </span>
      <ChevronRight
        size={20}
        color={dark ? DESKTOP_SURFACES.onDarkSoft : PAIPERS_PALETTES.light.textMuted}
        className="md:hidden"
        style={{ flexShrink: 0 }}
      />
    </>
  );

  const style: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "18px 18px",
    minHeight: 96,
    textDecoration: "none",
    color: "inherit",
    border: "none",
    width: "100%",
    height: "100%",
    textAlign: "left",
    cursor: "pointer",
    font: "inherit",
    opacity: unavailable ? 0.72 : 1,
    background: "transparent",
  };

  if (unavailable) {
    return (
      <button
        type="button"
        className={`${toneClass} flex flex-row md:flex-col md:items-start md:min-h-[168px] md:h-full paipers-hover-lift`}
        style={style}
        onClick={onUnavailable}
        title="Non disponible sur le web pour le moment"
      >
        {inner}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`${toneClass} flex flex-row md:flex-col md:items-start md:min-h-[168px] md:h-full paipers-hover-lift`}
      style={style}
    >
      {inner}
    </Link>
  );
}
