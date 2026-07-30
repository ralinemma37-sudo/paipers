"use client";

/**
 * Accueil Documents Pro — structure mobile, données Pro non branchées.
 * Réf. : paipers-mobile/src/features/proDocuments/ProDocumentsScreen.tsx
 */

import { ChevronRight, FileText, FolderPlus, ScanLine, Star, Upload } from "lucide-react";
import DocumentsQuickActionCard from "@/components/documents/DocumentsQuickActionCard";
import { PRO_DOCUMENTS_HOME_SPACES } from "@/lib/proDocumentsSpaces";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  importBusy: boolean;
  onImport: () => void;
  onUnavailable: (feature: string) => void;
};

export default function ProDocumentsHome({
  search,
  onSearchChange,
  importBusy,
  onImport,
  onUnavailable,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      <div>
        <h1 className="paipers-screen-title" style={{ marginBottom: 6 }}>
          Documents
        </h1>
        <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
          Organise, retrouve et sécurise tous tes documents.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "stretch" }}>
        <div
          className="paipers-elevated-card"
          style={{ flex: 1, padding: "4px 14px", borderRadius: 14 }}
        >
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un document, dossier, type…"
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              background: "transparent",
              padding: "10px 0",
              fontSize: 15,
              color: PAIPERS_COLORS.textPrimary,
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => onUnavailable("Filtres Pro")}
          className="paipers-elevated-card"
          style={{
            padding: "0 16px",
            border: "none",
            fontWeight: 800,
            fontSize: 13,
            cursor: "pointer",
            color: PAIPERS_COLORS.navy,
            borderRadius: 14,
          }}
        >
          Filtrer
        </button>
      </div>

      <section>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: PAIPERS_COLORS.textPrimary,
            margin: "0 0 10px",
          }}
        >
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 gap-[10px]">
          <DocumentsQuickActionCard
            label={importBusy ? "Import…" : "Importer"}
            Icon={Upload}
            onClick={onImport}
            disabled={importBusy}
            pro
          />
          <DocumentsQuickActionCard
            label="Nouveau dossier"
            Icon={FolderPlus}
            onClick={() => onUnavailable("Nouveau dossier Pro")}
            unavailable
            pro
          />
          <DocumentsQuickActionCard
            label="Scanner"
            Icon={ScanLine}
            onClick={() => onUnavailable("Scanner")}
            unavailable
            pro
          />
          <DocumentsQuickActionCard
            label="Favoris"
            Icon={Star}
            onClick={() => onUnavailable("Favoris")}
            unavailable
            pro
          />
        </div>
      </section>

      <section className="paipers-elevated-card" style={{ padding: 16 }}>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: PAIPERS_COLORS.textPrimary,
            margin: "0 0 8px",
          }}
        >
          À traiter
        </h2>
        <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
          Rien en attente. Paipers classera ici les documents qui nécessitent une action.
        </p>
      </section>

      <section className="paipers-elevated-card" style={{ padding: 16 }}>
        <h2
          style={{
            fontSize: 17,
            fontWeight: 900,
            color: PAIPERS_COLORS.textPrimary,
            margin: "0 0 8px",
          }}
        >
          Récents
        </h2>
        <p
          style={{
            fontWeight: 800,
            color: PAIPERS_COLORS.textPrimary,
            margin: 0,
            fontSize: 15,
          }}
        >
          Aucun document pour le moment.
        </p>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <h2
            style={{
              fontSize: 17,
              fontWeight: 900,
              color: PAIPERS_COLORS.textPrimary,
              margin: 0,
            }}
          >
            Dossiers
          </h2>
          <span className="paipers-text-muted" style={{ fontSize: 13, fontWeight: 700 }}>
            Voir tous
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PRO_DOCUMENTS_HOME_SPACES.map((space) => (
            <div
              key={space.id}
              className="paipers-elevated-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "14px 16px",
              }}
            >
              <span
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "hsl(214 62% 90%)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={18} color={PAIPERS_COLORS.navy} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontWeight: 800,
                    fontSize: 15,
                    color: PAIPERS_COLORS.textPrimary,
                  }}
                >
                  {space.title}
                </span>
                <span
                  className="paipers-text-muted"
                  style={{ display: "block", fontSize: 13, marginTop: 2 }}
                >
                  Aucun document
                </span>
              </span>
              <ChevronRight size={18} color={PAIPERS_PALETTES.light.textMuted} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
