"use client";

/**
 * Réf. : paipers-mobile — DocumentsQuickActionCard
 * unavailable : désactivé clairement, sans onClick fantôme.
 */

import type { LucideIcon } from "lucide-react";
import {
  PAIPERS_COLORS,
  PAIPERS_FOLDER_CIRCLE_BACKGROUNDS,
  PAIPERS_FOLDER_ICON_COLORS,
} from "@/lib/paipersTheme";

const PERSONAL_ICON_BG = PAIPERS_FOLDER_CIRCLE_BACKGROUNDS["#ACE4FF"];
const PERSONAL_ICON = PAIPERS_FOLDER_ICON_COLORS["#ACE4FF"];

type Props = {
  label: string;
  Icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  unavailable?: boolean;
  pro?: boolean;
};

export default function DocumentsQuickActionCard({
  label,
  Icon,
  onClick,
  disabled,
  unavailable,
  pro,
}: Props) {
  const iconBg = pro ? "hsl(214 62% 90%)" : PERSONAL_ICON_BG;
  const iconColor = pro ? PAIPERS_COLORS.navy : PERSONAL_ICON;
  const inert = Boolean(disabled || unavailable);

  return (
    <button
      type="button"
      onClick={inert ? undefined : onClick}
      disabled={inert}
      aria-disabled={inert}
      title={
        unavailable ? "Non disponible sur le web pour le moment" : undefined
      }
      className="paipers-elevated-card md:py-2.5 md:px-3"
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        padding: "12px 12px",
        border: "none",
        cursor: inert ? "not-allowed" : "pointer",
        opacity: inert ? 0.55 : 1,
        textAlign: "left",
        background: "var(--paipers-card, #fff)",
      }}
    >
      <span
        className="md:!w-8 md:!h-8 md:!rounded-lg"
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: iconBg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={17} color={iconColor} strokeWidth={2.2} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 800,
            color: PAIPERS_COLORS.textPrimary,
            lineHeight: 1.25,
          }}
        >
          {label}
        </span>
        {unavailable ? (
          <span
            className="paipers-text-muted"
            style={{
              display: "block",
              fontSize: 11,
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            Indisponible sur le web
          </span>
        ) : null}
      </span>
    </button>
  );
}
