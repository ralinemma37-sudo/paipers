"use client";

/**
 * Fusionner des PDF — dossiers (catégories) puis grille avec aperçus.
 * Réf. mobile : documents/merge.tsx
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Layers } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import DocumentGridTile from "@/components/documents/DocumentGridTile";
import DocumentsIndexFolderCard from "@/components/documents/DocumentsIndexFolderCard";
import {
  labelCat,
  normCat,
} from "@/lib/documentCategories";
import {
  mergeDocumentsIntoPdf,
  type MergeDocInput,
} from "@/lib/mergeDocumentsPdf";
import { effectiveDocumentCategory } from "@/lib/runDocumentAnalysis";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_RADIUS, PAIPERS_SPACE } from "@/lib/paipersTheme";

type MergeDoc = MergeDocInput & {
  created_at: string;
  category: string | null;
  ai_category?: string | null;
};

function isPdf(mime: string | null, path: string | null): boolean {
  const m = (mime || "").toLowerCase();
  const p = (path || "").toLowerCase();
  return m.includes("pdf") || p.endsWith(".pdf");
}

export default function DocumentsMergePage() {
  const router = useRouter();
  const [docs, setDocs] = useState<MergeDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [browseSlug, setBrowseSlug] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [title, setTitle] = useState("Document fusionné");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setDocs([]);
      setLoading(false);
      return;
    }
    const { data, error: err } = await supabase
      .from("documents")
      .select("id,title,file_path,mime_type,created_at,category,ai_category")
      .eq("user_id", auth.user.id)
      .eq("is_ready", true)
      .order("created_at", { ascending: false });

    if (err) {
      setError(err.message);
      setDocs([]);
    } else {
      setDocs(
        ((data || []) as MergeDoc[]).filter((d) => isPdf(d.mime_type, d.file_path)),
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const folders = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const d of docs) {
      const slug = normCat(effectiveDocumentCategory(d.category, d.ai_category));
      counts[slug] = (counts[slug] || 0) + 1;
    }
    return Object.keys(counts)
      .sort((a, b) => labelCat(a).localeCompare(labelCat(b), "fr"))
      .map((slug) => ({ slug, count: counts[slug] }));
  }, [docs]);

  const docsInView = useMemo(() => {
    if (!browseSlug) return [];
    return docs.filter(
      (d) =>
        normCat(effectiveDocumentCategory(d.category, d.ai_category)) === browseSlug,
    );
  }, [browseSlug, docs]);

  const selectedDocs = useMemo(() => {
    const byId = new Map(docs.map((d) => [d.id, d]));
    return selectedIds
      .map((id) => byId.get(id))
      .filter((d): d is MergeDoc => Boolean(d));
  }, [docs, selectedIds]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const move = (id: string, dir: -1 | 1) => {
    setSelectedIds((prev) => {
      const i = prev.indexOf(id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[i];
      next[i] = next[j];
      next[j] = tmp;
      return next;
    });
  };

  const handleMerge = async () => {
    setError("");
    setBusy(true);
    setProgress("");
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Non connecté.");
      const newId = await mergeDocumentsIntoPdf({
        userId: auth.user.id,
        documents: selectedDocs,
        title,
        onProgress: setProgress,
      });
      router.push(`/documents/view?id=${newId}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fusion impossible.");
      setBusy(false);
      setProgress("");
    }
  };

  const goBack = () => {
    if (browseSlug) {
      setBrowseSlug(null);
      return;
    }
    router.push("/documents");
  };

  const screenTitle = browseSlug ? labelCat(browseSlug) : "Fusionner des PDF";
  const subtitle = loading
    ? "Chargement…"
    : selectedIds.length > 0
      ? `${selectedIds.length} sélectionné(s) · ordre = ordre de sélection`
      : browseSlug
        ? `${docsInView.length} PDF dans ce dossier`
        : "Ouvre un dossier pour choisir des PDF";

  return (
    <Protected>
      <AppShell>
        <div className="pb-24 md:pb-6" style={{ padding: PAIPERS_SPACE.screenPad }}>
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold mb-4 border-0 bg-transparent p-0 cursor-pointer"
            style={{ color: PAIPERS_COLORS.navy }}
          >
            <ArrowLeft size={16} />
            {browseSlug ? "Dossiers" : "Documents"}
          </button>

          <div className="flex items-center gap-2 mb-2">
            <Layers size={22} color={PAIPERS_COLORS.navy} />
            <h1 className="paipers-screen-title" style={{ margin: 0 }}>
              {screenTitle}
            </h1>
          </div>
          <p className="paipers-text-muted" style={{ margin: "0 0 20px", fontSize: 14 }}>
            {subtitle}
          </p>

          {error ? (
            <p
              role="alert"
              style={{
                color: "#991B1B",
                fontWeight: 700,
                fontSize: 14,
                marginBottom: 12,
              }}
            >
              {error}
            </p>
          ) : null}

          {loading ? (
            <p className="paipers-text-muted">Chargement…</p>
          ) : docs.length === 0 ? (
            <div className="paipers-card-muted" style={{ padding: 20 }}>
              <p style={{ margin: 0, fontWeight: 800 }}>Aucun PDF disponible</p>
              <p className="paipers-text-muted" style={{ margin: "8px 0 0", fontSize: 14 }}>
                Importe d’abord des PDF dans Documents.
              </p>
              <Link
                href="/documents"
                style={{
                  display: "inline-block",
                  marginTop: 12,
                  fontWeight: 700,
                  color: PAIPERS_COLORS.navy,
                }}
              >
                Aller à Documents →
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="min-w-0">
                {!browseSlug ? (
                  <>
                    {!loading && selectedDocs.length > 0 ? (
                      <div
                        className="paipers-card-muted mb-4"
                        style={{ padding: 14 }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 800,
                            color: PAIPERS_COLORS.textPrimary,
                          }}
                        >
                          {selectedDocs.length} document(s) sélectionné(s)
                        </p>
                        <p
                          className="paipers-text-muted"
                          style={{ margin: "6px 0 0", fontSize: 13, lineHeight: "18px" }}
                        >
                          Ouvre d’autres dossiers pour en ajouter. L’ordre de
                          sélection = ordre des pages dans le PDF fusionné.
                        </p>
                      </div>
                    ) : null}

                    <p
                      className="paipers-text-muted"
                      style={{ margin: "0 0 12px", fontSize: 13 }}
                    >
                      Ouvre un dossier pour choisir des PDF. Tu peux en sélectionner
                      dans plusieurs dossiers.
                    </p>

                    {folders.length === 0 ? (
                      <p className="paipers-text-muted">Aucun dossier pour l’instant.</p>
                    ) : (
                      <>
                        <h2
                          style={{
                            fontSize: 20,
                            fontWeight: 800,
                            color: PAIPERS_COLORS.textPrimary,
                            margin: "0 0 14px",
                          }}
                        >
                          Dossiers
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                          {folders.map((f) => (
                            <DocumentsIndexFolderCard
                              key={f.slug}
                              categorySlug={f.slug}
                              docCount={f.count}
                              onSelect={() => setBrowseSlug(f.slug)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : docsInView.length === 0 ? (
                  <div className="paipers-card-muted" style={{ padding: 20 }}>
                    <p className="paipers-text-muted" style={{ margin: 0 }}>
                      Aucun PDF dans ce dossier.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {docsInView.map((d) => {
                      const order = selectedIds.indexOf(d.id);
                      const selected = order >= 0;
                      return (
                        <DocumentGridTile
                          key={d.id}
                          doc={d}
                          selected={selected}
                          selectionOrder={selected ? order + 1 : null}
                          onSelect={toggle}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="paipers-card-muted p-4 h-fit sticky top-20">
                <p
                  style={{
                    margin: 0,
                    fontWeight: 800,
                    fontSize: 15,
                    color: PAIPERS_COLORS.textPrimary,
                  }}
                >
                  Sélection ({selectedIds.length})
                </p>
                {selectedDocs.length === 0 ? (
                  <p className="paipers-text-muted text-[13px] mt-2">
                    Ouvre un dossier et clique sur les aperçus à assembler.
                  </p>
                ) : (
                  <ul
                    className="mt-3 flex flex-col gap-2"
                    style={{ listStyle: "none", padding: 0, margin: "12px 0 0" }}
                  >
                    {selectedDocs.map((d, i) => (
                      <li
                        key={d.id}
                        className="paipers-card-white"
                        style={{
                          padding: "10px 12px",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: 12,
                            color: PAIPERS_COLORS.navy,
                          }}
                        >
                          {i + 1}.
                        </span>
                        <span className="flex-1 text-[13px] font-semibold truncate">
                          {d.title?.trim() || "Document"}
                        </span>
                        <button
                          type="button"
                          disabled={busy || i === 0}
                          onClick={() => move(d.id, -1)}
                          className="border-0 bg-transparent cursor-pointer text-[12px] font-bold"
                          style={{
                            color: PAIPERS_COLORS.navy,
                            opacity: i === 0 ? 0.3 : 1,
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          disabled={busy || i === selectedDocs.length - 1}
                          onClick={() => move(d.id, 1)}
                          className="border-0 bg-transparent cursor-pointer text-[12px] font-bold"
                          style={{
                            color: PAIPERS_COLORS.navy,
                            opacity: i === selectedDocs.length - 1 ? 0.3 : 1,
                          }}
                        >
                          ↓
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <label
                  className="block mt-4 text-[12px] font-bold"
                  style={{ color: PAIPERS_COLORS.textPrimary }}
                >
                  Nom du fichier fusionné
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={busy}
                    className="mt-1.5 w-full"
                    style={{
                      padding: "10px 12px",
                      borderRadius: PAIPERS_RADIUS.input,
                      border: `1px solid ${PAIPERS_COLORS.border}`,
                      background: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  />
                </label>

                {progress ? (
                  <p
                    className="paipers-text-muted text-[12px] mt-3"
                    style={{ marginBottom: 0 }}
                  >
                    {progress}
                  </p>
                ) : null}

                <button
                  type="button"
                  disabled={busy || selectedIds.length < 2}
                  onClick={() => void handleMerge()}
                  className="paipers-button w-full mt-4"
                  style={{
                    opacity: busy || selectedIds.length < 2 ? 0.5 : 1,
                    cursor:
                      busy || selectedIds.length < 2 ? "not-allowed" : "pointer",
                  }}
                >
                  {busy ? "Fusion en cours…" : `Fusionner${selectedIds.length >= 2 ? ` (${selectedIds.length})` : ""}`}
                </button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </Protected>
  );
}
