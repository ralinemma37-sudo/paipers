"use client";

/**
 * Réf. : paipers-mobile/src/components/documents/DocumentsIndexFolderCard.tsx
 */

import { FileText } from "lucide-react";
import Link from "next/link";
import {
  docCountLabel,
  folderIconColorsForCategory,
  labelCat,
} from "@/lib/documentCategories";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

type Props = {
  categorySlug: string;
  docCount: number;
};

export default function DocumentsIndexFolderCard({ categorySlug, docCount }: Props) {
  const name = labelCat(categorySlug);
  const { iconBg, icon } = folderIconColorsForCategory(name);

  return (
    <Link
      href={`/documents/${encodeURIComponent(categorySlug)}`}
      className="paipers-card-white block md:min-h-[108px] paipers-hover-lift"
      style={{
        minHeight: 120,
        borderRadius: 16,
        padding: 14,
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 999,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <FileText size={20} color={icon} strokeWidth={2.2} />
      </div>
      <p
        style={{
          marginTop: 12,
          fontSize: 15,
          fontWeight: 800,
          color: PAIPERS_COLORS.textPrimary,
          lineHeight: "20px",
          marginBottom: 0,
        }}
      >
        {name}
      </p>
      <p
        className="paipers-text-muted"
        style={{
          marginTop: 4,
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 0,
        }}
      >
        {docCountLabel(docCount)}
      </p>
    </Link>
  );
}
