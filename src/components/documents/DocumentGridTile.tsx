"use client";

/**
 * Réf. : paipers-mobile/src/components/documents/DocumentGridTile.tsx
 */

import Link from "next/link";
import DocumentThumbnail from "@/components/documents/DocumentThumbnail";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export type DocumentListItem = {
  id: string;
  title: string | null;
  created_at: string;
  file_path?: string | null;
  storage_path?: string | null;
  mime_type?: string | null;
};

type Props = {
  doc: DocumentListItem;
  href?: string;
  selected?: boolean;
  /** Rang dans la sélection (1-based) — mode fusion. */
  selectionOrder?: number | null;
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
  selectionOrder,
  onSelect,
}: Props) {
  const title = doc.title?.trim() || "Document";
  const content = (
    <>
      <div style={{ position: "relative" }}>
        <DocumentThumbnail
          filePath={doc.file_path}
          storagePath={doc.storage_path}
          mimeType={doc.mime_type}
          selected={selected}
        />
        {selected && selectionOrder != null ? (
          <span
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 26,
              height: 26,
              borderRadius: 999,
              background: PAIPERS_COLORS.navy,
              color: "#fff",
              fontSize: 12,
              fontWeight: 800,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
            }}
          >
            {selectionOrder}
          </span>
        ) : null}
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
