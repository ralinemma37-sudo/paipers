"use client";

/**
 * Accueil Documents — fidélité mobile.
 * Personnel : app/(tabs)/documents/index.tsx → DocumentsScreenPersonal
 * Pro : ProDocumentsScreen.tsx (présentation ; données Pro non branchées)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Layers, Star, Upload } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useNavSpace } from "@/components/NavSpaceProvider";
import DocumentsQuickActionCard from "@/components/documents/DocumentsQuickActionCard";
import DocumentsIndexFolderGrid, {
  type CategoriesViewMode,
} from "@/components/documents/DocumentsIndexFolderGrid";
import DocumentGridTile from "@/components/documents/DocumentGridTile";
import ProDocumentsHome from "@/components/documents/ProDocumentsHome";
import { useDocumentFavorites } from "@/hooks/useDocumentFavorites";
import { classifyDocumentsByIds } from "@/lib/classifyDocumentsClient";
import { normCat } from "@/lib/documentCategories";
import { importDocumentFile } from "@/lib/importDocument";
import { effectiveDocumentCategory } from "@/lib/runDocumentAnalysis";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_RADIUS, PAIPERS_SPACE } from "@/lib/paipersTheme";

type Doc = {
  id: string;
  title: string | null;
  category: string | null;
  ai_category?: string | null;
  created_at: string;
  file_path: string | null;
  mime_type?: string | null;
};

export default function DocumentsPage() {
  const router = useRouter();
  const { showProTabs, loaded: spaceLoaded } = useNavSpace();
  const { favorites } = useDocumentFavorites();

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<CategoriesViewMode>("grid");

  const [importBusy, setImportBusy] = useState(false);
  const [importMsg, setImportMsg] = useState("");
  const [toast, setToast] = useState("");
  const [toastTone, setToastTone] = useState<"info" | "success" | "error">("info");
  const [dragOver, setDragOver] = useState(false);
  const [classifyBusy, setClassifyBusy] = useState(false);
  const autoClassifyTried = useRef(false);
  const importInputRef = useRef<HTMLInputElement>(null);

  const openImportPicker = () => {
    if (importBusy) return;
    importInputRef.current?.click();
  };

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("q");
      if (q) setSearch(q);
    } catch {
      /* ignore */
    }
  }, []);

  const loadDocs = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data, error } = await supabase
      .from("documents")
      .select("id,title,category,ai_category,created_at,file_path,mime_type")
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
      const cat = normCat(effectiveDocumentCategory(d.category, d.ai_category));
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

  const uncategorizedIds = useMemo(
    () =>
      docs
        .filter(
          (d) =>
            normCat(effectiveDocumentCategory(d.category, d.ai_category)) ===
            "autres",
        )
        .map((d) => d.id),
    [docs],
  );

  const runClassifyUncategorized = useCallback(
    async (ids: string[], opts?: { silent?: boolean }) => {
      if (ids.length === 0 || classifyBusy) return;
      setClassifyBusy(true);
      if (!opts?.silent) {
        setToastTone("info");
        setToast(
          ids.length > 1
            ? `Classification IA de ${ids.length} documents…`
            : "Classification IA en cours…",
        );
      }
      try {
        // Un document à la fois (edge analyze-document)
        let okCount = 0;
        const errors: string[] = [];
        for (let i = 0; i < ids.length; i++) {
          setToast(
            `Classification IA… ${i + 1}/${ids.length}`,
          );
          const results = await classifyDocumentsByIds([ids[i]]);
          const r = results[0];
          if (r?.ok) okCount += 1;
          else if (r?.error) errors.push(r.error);
        }
        await loadDocs();
        if (okCount > 0) {
          setToastTone("success");
          setToast(
            okCount > 1
              ? `${okCount} documents classés`
              : "Document classé",
          );
        } else {
          setToastTone("error");
          const firstErr = errors[0] || "Classification impossible";
          setToast(
            firstErr.includes("openai") || firstErr.includes("OPENAI")
              ? "IA non configurée côté serveur Supabase."
              : firstErr,
          );
        }
        window.setTimeout(() => setToast(""), 6000);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Classification impossible.";
        setToastTone("error");
        setToast(msg);
        window.setTimeout(() => setToast(""), 6000);
      } finally {
        setClassifyBusy(false);
      }
    },
    [classifyBusy, loadDocs],
  );

  useEffect(() => {
    if (loading || autoClassifyTried.current || classifyBusy) return;
    if (uncategorizedIds.length === 0) return;
    autoClassifyTried.current = true;
    // Classification automatique (pas de bouton manuel).
    void runClassifyUncategorized(uncategorizedIds, { silent: true });
  }, [loading, uncategorizedIds, classifyBusy, runClassifyUncategorized]);

  const runImport = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;

    setImportBusy(true);
    setImportMsg("");
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Non connecté.");

      setToastTone("info");
      setToast(
        files.length > 1
          ? `Import + classification de ${files.length} fichiers…`
          : "Import + classification…",
      );

      for (const file of files) {
        await importDocumentFile(file, auth.user.id);
      }

      setToastTone("success");
      setToast(
        files.length > 1 ? "Documents importés et classés" : "Document importé et classé",
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
              role="status"
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
                color:
                  toastTone === "success"
                    ? PAIPERS_COLORS.textPrimary
                    : toastTone === "error"
                      ? "#991B1B"
                      : PAIPERS_COLORS.neutral,
                maxWidth: "90vw",
                borderLeft:
                  toastTone === "error"
                    ? "4px solid #B91C1C"
                    : toastTone === "info"
                      ? `4px solid ${PAIPERS_COLORS.neutral}`
                      : `4px solid ${PAIPERS_COLORS.success}`,
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
              onImport={openImportPicker}
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div
                className="hidden md:block paipers-card-marine p-4 mb-4"
                style={{
                  background: `linear-gradient(135deg, ${DESKTOP_SURFACES.marine} 0%, ${DESKTOP_SURFACES.nightSoft} 100%)`,
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 800,
                    color: DESKTOP_SURFACES.onDark,
                    letterSpacing: -0.3,
                  }}
                >
                  Documents
                </h1>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 13,
                    color: DESKTOP_SURFACES.onDarkMuted,
                  }}
                >
                  Classe, retrouve et sécurise ton administratif.
                </p>
              </div>
              <h1 className="paipers-screen-title md:hidden" style={{ marginBottom: 0 }}>
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

              <div className="mt-3.5 grid grid-cols-2 gap-2.5 md:grid-cols-3 md:max-w-2xl">
                <DocumentsQuickActionCard
                  label={importBusy ? "Import…" : "Importer"}
                  Icon={Upload}
                  onClick={openImportPicker}
                  disabled={importBusy || classifyBusy}
                />
                <DocumentsQuickActionCard
                  label={
                    favorites.length > 0
                      ? `Favoris (${favorites.length})`
                      : "Favoris"
                  }
                  Icon={Star}
                  onClick={() => router.push("/documents/favorites")}
                />
                <DocumentsQuickActionCard
                  label="Fusionner des PDF"
                  Icon={Layers}
                  onClick={() => router.push("/documents/fusionner")}
                />
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
                          Importe un PDF ou une image : après analyse, un dossier adapté
                          peut être créé.
                        </p>
                        <button
                          type="button"
                          disabled={importBusy}
                          onClick={openImportPicker}
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

          <input
            ref={importInputRef}
            type="file"
            accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/*"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) void runImport(e.target.files);
              e.target.value = "";
            }}
          />

          {importMsg ? (
            <p style={{ color: "#B91C1C", fontSize: 13, marginTop: 12 }}>{importMsg}</p>
          ) : null}
        </div>
      </AppShell>
    </Protected>
  );
}
