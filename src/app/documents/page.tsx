"use client";

/**
 * Accueil Documents — fidélité mobile.
 * Personnel : app/(tabs)/documents/index.tsx → DocumentsScreenPersonal
 * Pro : ProDocumentsScreen.tsx (présentation ; données Pro non branchées)
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Layers, ScanLine, Star, Upload } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useNavSpace } from "@/components/NavSpaceProvider";
import DocumentsQuickActionCard from "@/components/documents/DocumentsQuickActionCard";
import DocumentsIndexFolderGrid, {
  type CategoriesViewMode,
} from "@/components/documents/DocumentsIndexFolderGrid";
import DocumentGridTile from "@/components/documents/DocumentGridTile";
import DocumentsImportSourceSheet from "@/components/documents/DocumentsImportSourceSheet";
import ProDocumentsHome from "@/components/documents/ProDocumentsHome";
import { normCat } from "@/lib/documentCategories";
import { importDocumentFile } from "@/lib/importDocument";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_RADIUS, PAIPERS_SPACE } from "@/lib/paipersTheme";

type Doc = {
  id: string;
  title: string | null;
  category: string | null;
  created_at: string;
  file_path: string | null;
};

export default function DocumentsPage() {
  const { showProTabs, loaded: spaceLoaded } = useNavSpace();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<CategoriesViewMode>("grid");

  const [importOpen, setImportOpen] = useState(false);
  const [importBusy, setImportBusy] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [toast, setToast] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const loadDocs = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data, error } = await supabase
      .from("documents")
      .select("id,title,category,created_at,file_path")
      .eq("user_id", auth.user.id)
      .eq("is_ready", true)
      .order("created_at", { ascending: false });

    if (error) {
      setListError(error.message || "Chargement impossible");
      setDocs([]);
    } else {
      setListError(null);
      setDocs((data as Doc[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadDocs();
  }, [loadDocs]);

  const groups = useMemo(() => {
    const g: Record<string, Doc[]> = {};
    docs.forEach((d) => {
      const cat = normCat(d.category);
      if (!g[cat]) g[cat] = [];
      g[cat].push(d);
    });
    return g;
  }, [docs]);

  const categoryList = useMemo(() => {
    const cats = Object.keys(groups);
    cats.sort((a, b) => {
      if (a === "autres") return 1;
      if (b === "autres") return -1;
      return a.localeCompare(b, "fr");
    });
    return cats.map((slug) => ({ slug, count: groups[slug]?.length || 0 }));
  }, [groups]);

  const searchTrim = search.trim().toLowerCase();

  const filteredDocs = useMemo(() => {
    if (!searchTrim) return [];
    return docs.filter((d) => (d.title || "").toLowerCase().includes(searchTrim));
  }, [docs, searchTrim]);

  const recentDocs = useMemo(() => docs.slice(0, 4), [docs]);

  const showUnavailable = (feature: string) => {
    setToast(`${feature} : non disponible sur le web pour le moment.`);
    window.setTimeout(() => setToast(""), 3200);
  };

  const runImport = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setImportBusy(true);
    setImportMsg("");
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Non connecté.");

      for (const file of files) {
        await importDocumentFile(file, auth.user.id);
      }

      setImportOpen(false);
      setToast(
        files.length > 1 ? "Documents importés" : "Document importé",
      );
      window.setTimeout(() => setToast(""), 2800);
      setLoading(true);
      await loadDocs();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Import échoué.";
      setImportMsg(msg);
    } finally {
      setImportBusy(false);
    }
  };

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{
            padding: PAIPERS_SPACE.screenPad,
            maxWidth: 1100,
            position: "relative",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) {
              void runImport(e.dataTransfer.files);
            }
          }}
        >
          {dragOver ? (
            <div
              style={{
                position: "absolute",
                inset: 8,
                borderRadius: 18,
                border: `2px dashed ${PAIPERS_COLORS.navy}`,
                background: "rgba(26, 43, 74, 0.06)",
                zIndex: 20,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                fontWeight: 800,
                color: PAIPERS_COLORS.navy,
              }}
            >
              Dépose tes fichiers pour importer
            </div>
          ) : null}

          {toast ? (
            <div
              className="paipers-elevated-card"
              style={{
                position: "fixed",
                bottom: 96,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 90,
                padding: "12px 18px",
                fontWeight: 800,
                fontSize: 14,
                color: PAIPERS_COLORS.textPrimary,
                maxWidth: "90vw",
              }}
            >
              {toast}
            </div>
          ) : null}

          {spaceLoaded && showProTabs ? (
            <ProDocumentsHome
              search={search}
              onSearchChange={setSearch}
              importBusy={importBusy}
              onImport={() => setImportOpen(true)}
              onUnavailable={showUnavailable}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <h1 className="paipers-screen-title" style={{ marginBottom: 0 }}>
                Documents
              </h1>

              <div
                className="paipers-elevated-card"
                style={{ marginTop: 14, borderRadius: 14, padding: "2px 14px" }}
              >
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un document…"
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    padding: "12px 0",
                    fontSize: 15,
                    color: PAIPERS_COLORS.textPrimary,
                  }}
                />
              </div>

              <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                <div className="grid grid-cols-2 gap-[10px]">
                  <DocumentsQuickActionCard
                    label={importBusy ? "Import…" : "Importer"}
                    Icon={Upload}
                    onClick={() => setImportOpen(true)}
                    disabled={importBusy}
                  />
                  <DocumentsQuickActionCard
                    label="Scanner"
                    Icon={ScanLine}
                    onClick={() => showUnavailable("Scanner")}
                    unavailable
                  />
                </div>
                <div className="grid grid-cols-2 gap-[10px]">
                  <DocumentsQuickActionCard
                    label="Favoris"
                    Icon={Star}
                    onClick={() => showUnavailable("Favoris")}
                    unavailable
                  />
                  <DocumentsQuickActionCard
                    label="Fusionner des PDF"
                    Icon={Layers}
                    onClick={() => showUnavailable("Fusionner des PDF")}
                    unavailable
                  />
                </div>
              </div>

              {listError ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 16,
                    background: "rgba(185, 28, 28, 0.08)",
                    border: "1px solid rgba(185, 28, 28, 0.25)",
                  }}
                >
                  <p style={{ color: "#991B1B", fontWeight: 700, margin: 0 }}>
                    Impossible de charger les documents
                  </p>
                  <p className="paipers-text-muted" style={{ marginTop: 6, fontSize: 14, marginBottom: 0 }}>
                    {listError}
                  </p>
                </div>
              ) : null}

              <div style={{ marginTop: 20 }}>
                {searchTrim.length > 0 ? (
                  filteredDocs.length === 0 ? (
                    <p className="paipers-text-muted" style={{ margin: 0 }}>
                      Aucun document ne correspond à ta recherche.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {filteredDocs.map((d) => (
                        <DocumentGridTile key={d.id} doc={d} />
                      ))}
                    </div>
                  )
                ) : loading && docs.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "16px 0" }}>
                    <p className="paipers-text-muted" style={{ fontSize: 14, margin: 0 }}>
                      Chargement…
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {docs.length === 0 ? (
                      <div
                        style={{
                          padding: 20,
                          borderRadius: 16,
                          background: "var(--paipers-muted, #f4f4f5)",
                          border: `1px solid ${PAIPERS_COLORS.border}`,
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        <p
                          style={{
                            fontWeight: 800,
                            color: PAIPERS_COLORS.textPrimary,
                            fontSize: 16,
                            margin: 0,
                          }}
                        >
                          Aucun document pour l’instant
                        </p>
                        <p
                          className="paipers-text-muted"
                          style={{ fontSize: 14, lineHeight: "20px", margin: 0 }}
                        >
                          Importe un PDF ou scanne une page : après analyse, un dossier adapté
                          peut être créé. Tu peux aussi créer un dossier vide.
                        </p>
                        <button
                          type="button"
                          disabled={importBusy}
                          onClick={() => setImportOpen(true)}
                          style={{
                            padding: "14px 16px",
                            borderRadius: PAIPERS_RADIUS.button,
                            border: "none",
                            background: PAIPERS_COLORS.navy,
                            color: "#fff",
                            fontWeight: 800,
                            cursor: importBusy ? "wait" : "pointer",
                            opacity: importBusy ? 0.6 : 1,
                          }}
                        >
                          {importBusy ? "Import en cours…" : "Importer un document"}
                        </button>
                        <button
                          type="button"
                          onClick={() => showUnavailable("Créer un dossier vide")}
                          style={{
                            padding: "12px 16px",
                            borderRadius: PAIPERS_RADIUS.button,
                            border: `1px solid ${PAIPERS_COLORS.border}`,
                            background: "#fff",
                            color: PAIPERS_COLORS.textPrimary,
                            fontWeight: 800,
                            cursor: "pointer",
                          }}
                        >
                          Créer un dossier vide
                        </button>
                      </div>
                    ) : null}

                    {categoryList.length > 0 ? (
                      <DocumentsIndexFolderGrid
                        folders={categoryList}
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                      />
                    ) : null}

                    {recentDocs.length > 0 ? (
                      <div style={{ marginTop: 12 }}>
                        <p
                          className="paipers-text-muted"
                          style={{
                            fontSize: 13,
                            fontWeight: 800,
                            letterSpacing: 0.4,
                            textTransform: "uppercase",
                            marginBottom: 10,
                          }}
                        >
                          Documents récents
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {recentDocs.map((d) => (
                            <DocumentGridTile key={d.id} doc={d} />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          )}

          <DocumentsImportSourceSheet
            open={importOpen}
            busy={importBusy}
            onClose={() => !importBusy && setImportOpen(false)}
            onPickFiles={(files) => void runImport(files)}
          />

          {importMsg ? (
            <p style={{ color: "#B91C1C", fontSize: 13, marginTop: 12 }}>{importMsg}</p>
          ) : null}
        </div>
      </AppShell>
    </Protected>
  );
}
