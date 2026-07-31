"use client";

/**
 * Accueil Documents Pro — structure mobile, données Pro non branchées.
 * Réf. : paipers-mobile/src/features/proDocuments/ProDocumentsScreen.tsx
 */

import { FileText, FolderPlus, ScanLine, Star, Upload } from "lucide-react";
import DocumentsQuickActionCard from "@/components/documents/DocumentsQuickActionCard";
import { PRO_DOCUMENTS_HOME_SPACES } from "@/lib/proDocumentsSpaces";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

type Props = {
  search: string;
  onSearchChange: (v: string) => void;
  importBusy: boolean;
  onImport: () => void;
};

export default function ProDocumentsHome({
  search,
  onSearchChange,
  importBusy,
  onImport,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
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
          disabled
          aria-disabled
          title="Filtres Pro — non disponibles sur le web"
          className="paipers-elevated-card"
          style={{
            padding: "0 16px",
            border: "none",
            fontWeight: 800,
            fontSize: 13,
            cursor: "not-allowed",
            color: PAIPERS_COLORS.navy,
            borderRadius: 14,
            opacity: 0.55,
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
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-2.5">
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
            unavailable
            pro
          />
          <DocumentsQuickActionCard
            label="Scanner"
            Icon={ScanLine}
            unavailable
            pro
          />
          <DocumentsQuickActionCard
            label="Favoris"
            Icon={Star}
            unavailable
            pro
          />
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <section className="paipers-elevated-card" style={{ padding: 14 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: PAIPERS_COLORS.textPrimary,
              margin: "0 0 6px",
            }}
          >
            À traiter
          </h2>
          <p className="paipers-text-muted" style={{ margin: 0, fontSize: 13, lineHeight: "19px" }}>
            Rien en attente. Paipers classera ici les documents qui nécessitent une action.
          </p>
        </section>

        <section className="paipers-elevated-card" style={{ padding: 14 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: PAIPERS_COLORS.textPrimary,
              margin: "0 0 6px",
            }}
          >
            Récents
          </h2>
          <p
            style={{
              fontWeight: 800,
              color: PAIPERS_COLORS.textPrimary,
              margin: 0,
              fontSize: 14,
            }}
          >
            Aucun document pour le moment.
          </p>
        </section>
      </div>

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
            Aperçu
          </span>
        </div>
        <p
          className="paipers-text-muted"
          style={{ margin: "0 0 10px", fontSize: 12, lineHeight: "17px" }}
        >
          Dossiers professionnels affichés pour fidélité mobile — non synchronisés sur le web.
        </p>
        <div className="flex flex-col gap-2 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-3">
          {PRO_DOCUMENTS_HOME_SPACES.map((space) => (
            <div
              key={space.id}
              className="paipers-elevated-card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "hsl(214 62% 90%)",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileText size={17} color={PAIPERS_COLORS.navy} />
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span
                  style={{
                    display: "block",
                    fontWeight: 800,
                    fontSize: 14,
                    color: PAIPERS_COLORS.textPrimary,
                  }}
                >
                  {space.title}
                </span>
                <span
                  className="paipers-text-muted"
                  style={{ display: "block", fontSize: 12, marginTop: 2 }}
                >
                  Aucun document
                </span>
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
