"use client";

/**
 * Réf. : paipers-mobile/src/components/documents/DocumentsIndexFolderGrid.tsx
 */

import type { ReactNode } from "react";
import { LayoutGrid, List } from "lucide-react";
import DocumentsIndexFolderCard from "@/components/documents/DocumentsIndexFolderCard";
import DocumentsIndexFolderListRow from "@/components/documents/DocumentsIndexFolderListRow";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

export type CategoriesViewMode = "grid" | "list";

type FolderItem = {
  slug: string;
  count: number;
};

type Props = {
  folders: FolderItem[];
  viewMode: CategoriesViewMode;
  onViewModeChange: (mode: CategoriesViewMode) => void;
};

export default function DocumentsIndexFolderGrid({
  folders,
  viewMode,
  onViewModeChange,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: PAIPERS_COLORS.textPrimary,
            margin: 0,
          }}
        >
          Catégories
        </h2>
        <div style={{ display: "flex", gap: 6 }}>
          <ToggleBtn
            active={viewMode === "grid"}
            onClick={() => onViewModeChange("grid")}
            label="Grille"
          >
            <LayoutGrid
              size={16}
              color={viewMode === "grid" ? PAIPERS_COLORS.textPrimary : PAIPERS_PALETTES.light.textMuted}
            />
          </ToggleBtn>
          <ToggleBtn
            active={viewMode === "list"}
            onClick={() => onViewModeChange("list")}
            label="Liste"
          >
            <List
              size={16}
              color={viewMode === "list" ? PAIPERS_COLORS.textPrimary : PAIPERS_PALETTES.light.textMuted}
            />
          </ToggleBtn>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-[14px]">
          {folders.map((f) => (
            <DocumentsIndexFolderCard
              key={f.slug}
              categorySlug={f.slug}
              docCount={f.count}
            />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {folders.map((f) => (
            <DocumentsIndexFolderListRow
              key={f.slug}
              categorySlug={f.slug}
              docCount={f.count}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ToggleBtn({
  active,
  onClick,
  children,
  label,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      style={{
        width: 34,
        height: 34,
        borderRadius: 10,
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: active ? "hsl(202 100% 92%)" : PAIPERS_PALETTES.light.muted,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
