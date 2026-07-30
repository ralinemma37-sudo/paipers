"use client";

/**
 * Réf. : paipers-mobile/app/(tabs)/documents/index.tsx — DocumentsQuickActionCard
 */

import type { LucideIcon } from "lucide-react";
import { PAIPERS_COLORS, PAIPERS_FOLDER_CIRCLE_BACKGROUNDS, PAIPERS_FOLDER_ICON_COLORS } from "@/lib/paipersTheme";

const PERSONAL_ICON_BG = PAIPERS_FOLDER_CIRCLE_BACKGROUNDS["#ACE4FF"];
const PERSONAL_ICON = PAIPERS_FOLDER_ICON_COLORS["#ACE4FF"];

type Props = {
  label: string;
  Icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  unavailable?: boolean;
  /** Variante Pro — accent navy */
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

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || unavailable}
      title={unavailable ? "Non disponible sur le web pour le moment" : undefined}
      className="paipers-elevated-card"
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: "14px 14px",
        border: "none",
        cursor: disabled || unavailable ? "not-allowed" : "pointer",
        opacity: disabled || unavailable ? 0.55 : 1,
        textAlign: "left",
        background: "var(--paipers-card, #fff)",
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          background: iconBg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={iconColor} strokeWidth={2.2} />
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: PAIPERS_COLORS.textPrimary,
          lineHeight: 1.25,
        }}
      >
        {label}
      </span>
    </button>
  );
}
