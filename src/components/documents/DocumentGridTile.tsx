"use client";

/**
 * Réf. : paipers-mobile/src/components/documents/DocumentGridTile.tsx
 */

import Link from "next/link";
import { FileText } from "lucide-react";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

export type DocumentListItem = {
  id: string;
  title: string | null;
  created_at: string;
};

type Props = {
  doc: DocumentListItem;
  href?: string;
  selected?: boolean;
  onSelect?: (id: string) => void;
};

function shortDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export default function DocumentGridTile({
  doc,
  href,
  selected,
  onSelect,
}: Props) {
  const title = doc.title?.trim() || "Document";
  const content = (
    <>
      <div
        style={{
          aspectRatio: "210 / 297",
          borderRadius: 12,
          background: PAIPERS_PALETTES.light.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: selected
            ? `2px solid ${PAIPERS_COLORS.navy}`
            : `1px solid ${PAIPERS_COLORS.border}`,
        }}
      >
        <FileText size={28} color={PAIPERS_COLORS.navy} strokeWidth={2} />
      </div>
      <p
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: 800,
          color: PAIPERS_COLORS.textPrimary,
          lineHeight: "16px",
          marginBottom: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {title}
      </p>
      <p
        className="paipers-text-muted"
        style={{ marginTop: 2, fontSize: 11, fontWeight: 600, marginBottom: 0 }}
      >
        {shortDate(doc.created_at)}
      </p>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(doc.id)}
        style={{
          border: "none",
          background: "transparent",
          padding: 0,
          textAlign: "left",
          cursor: "pointer",
          width: "100%",
        }}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href || `/documents/view?id=${doc.id}`}
      style={{ textDecoration: "none", color: "inherit", display: "block" }}
    >
      {content}
    </Link>
  );
}
