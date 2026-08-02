"use client";

/**
 * Carte hub Générer — même présentation que mobile (carte claire + pastille).
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";
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
}: Props) {
  const inner = (
    <>
      <span
        style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          background: badgePastel,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={26} color={vivid} strokeWidth={2.2} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 17,
            fontWeight: 800,
            color: PAIPERS_COLORS.textPrimary,
            letterSpacing: -0.3,
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
            lineHeight: "19px",
          }}
        >
          {desc}
        </span>
      </span>
      <ChevronRight
        size={22}
        color={PAIPERS_PALETTES.light.textMuted}
        style={{ flexShrink: 0 }}
      />
    </>
  );

  const style: CSSProperties = {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: "20px 18px",
    minHeight: 104,
    textDecoration: "none",
    color: PAIPERS_COLORS.textPrimary,
    border: "none",
    width: "100%",
    textAlign: "left",
    cursor: unavailable ? "not-allowed" : "pointer",
    font: "inherit",
    opacity: unavailable ? 0.72 : 1,
    background: "#fff",
  };

  if (unavailable) {
    return (
      <button
        type="button"
        className="paipers-elevated-card paipers-hover-lift"
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
      className="paipers-elevated-card paipers-hover-lift"
      style={style}
    >
      {inner}
    </Link>
  );
}
