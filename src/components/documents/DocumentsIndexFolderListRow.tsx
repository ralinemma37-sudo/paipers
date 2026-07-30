"use client";

/**
 * Réf. : paipers-mobile/src/components/documents/DocumentsIndexFolderListRow.tsx
 */

import { ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import {
  docCountLabel,
  folderIconColorsForCategory,
  labelCat,
} from "@/lib/documentCategories";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type Props = {
  categorySlug: string;
  docCount: number;
};

export default function DocumentsIndexFolderListRow({
  categorySlug,
  docCount,
}: Props) {
  const name = labelCat(categorySlug);
  const { iconBg, icon } = folderIconColorsForCategory(name);

  return (
    <Link
      href={`/documents/${encodeURIComponent(categorySlug)}`}
      className="paipers-elevated-card"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: iconBg,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <FileText size={18} color={icon} strokeWidth={2.2} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 15,
            fontWeight: 800,
            color: PAIPERS_COLORS.textPrimary,
          }}
        >
          {name}
        </span>
        <span
          className="paipers-text-muted"
          style={{ display: "block", fontSize: 13, fontWeight: 600, marginTop: 2 }}
        >
          {docCountLabel(docCount)}
        </span>
      </span>
      <ChevronRight size={18} color={PAIPERS_PALETTES.light.textMuted} />
    </Link>
  );
}
