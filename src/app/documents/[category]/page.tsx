"use client";

/**
 * Dossier / catégorie — réf. mobile folder/[id].tsx (liste docs).
 * Desktop : liste + aperçu côte à côte (sélection locale, sans mutation).
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import DocumentGridTile from "@/components/documents/DocumentGridTile";
import { labelCat, normCat } from "@/lib/documentCategories";
import { effectiveDocumentCategory } from "@/lib/runDocumentAnalysis";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

type Doc = {
  id: string;
  title: string | null;
  original_filename: string | null;
  category: string | null;
  ai_category?: string | null;
  created_at: string;
  mime_type: string | null;
  file_path: string | null;
};

export default function CategoryPage() {
  const params = useParams() as { category: string };
  const categoryParam = useMemo(
    () => normCat(params.category || "autres"),
    [params.category],
  );

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string>("");
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("documents")
        .select("id,title,original_filename,category,ai_category,created_at,mime_type,file_path")
        .eq("user_id", user.id)
        .eq("is_ready", true)
        .order("created_at", { ascending: false });

      if (error) {
        setErrorMsg(error.message || "Chargement impossible");
        setDocs([]);
      } else {
        const all = (data || []) as Doc[];
        setDocs(
          all.filter(
            (d) =>
              normCat(effectiveDocumentCategory(d.category, d.ai_category)) ===
              categoryParam,
          ),
        );
      }
      setLoading(false);
    };

    void load();
  }, [categoryParam]);

  useEffect(() => {
    let cancelled = false;

    const loadPreview = async () => {
      setPreviewUrl(null);
      setPreviewError("");
      if (!selectedId) return;

      const doc = docs.find((d) => d.id === selectedId);
      if (!doc?.file_path) {
        setPreviewError("Aperçu indisponible pour ce document.");
        return;
      }

      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_path, 600);

      if (cancelled) return;
      if (error || !data?.signedUrl) {
        setPreviewError("Aperçu indisponible pour ce document.");
        return;
      }
      setPreviewUrl(data.signedUrl);
      setPreviewMime(doc.mime_type || "");
    };

    void loadPreview();
    return () => {
      cancelled = true;
    };
  }, [selectedId, docs]);

  const title = labelCat(categoryParam);

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 1200 }}
        >
          <Link
            href="/documents"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#64748b",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            <ChevronLeft size={18} />
            Retour
          </Link>

          <h1 className="paipers-screen-title" style={{ marginBottom: 16 }}>
            {title}
          </h1>

          {loading ? (
            <p className="paipers-text-muted">Chargement des documents…</p>
          ) : null}

          {errorMsg ? (
            <div
              style={{
                padding: 14,
                borderRadius: 16,
                background: "rgba(185, 28, 28, 0.08)",
                border: "1px solid rgba(185, 28, 28, 0.25)",
              }}
            >
              <p style={{ color: "#991B1B", fontWeight: 700, margin: 0 }}>
                Impossible de charger les documents
              </p>
              <p className="paipers-text-muted" style={{ marginTop: 6, marginBottom: 0 }}>
                {errorMsg}
              </p>
            </div>
          ) : null}

          {!loading && !errorMsg && docs.length === 0 ? (
            <p className="paipers-text-muted" style={{ margin: 0 }}>
              Aucun document dans ce dossier pour l’instant.
            </p>
          ) : null}

          {!loading && docs.length > 0 ? (
            <div className="flex flex-col lg:flex-row gap-6 lg:items-start">
              <div className="flex-1 min-w-0">
                {/* Mobile : navigation pleine page ; desktop : sélection pour aperçu */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:hidden">
                  {docs.map((doc) => (
                    <DocumentGridTile key={doc.id} doc={doc} />
                  ))}
                </div>
                <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-3">
                  {docs.map((doc) => (
                    <DocumentGridTile
                      key={doc.id}
                      doc={doc}
                      selected={selectedId === doc.id}
                      onSelect={setSelectedId}
                    />
                  ))}
                </div>
              </div>

              <aside
                className="hidden lg:block paipers-elevated-card"
                style={{
                  width: 420,
                  flexShrink: 0,
                  padding: 16,
                  minHeight: 480,
                  position: "sticky",
                  top: 24,
                }}
              >
                {!selectedId ? (
                  <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14 }}>
                    Sélectionne un document pour l’aperçu.
                  </p>
                ) : previewError ? (
                  <p style={{ color: "#991B1B", margin: 0 }}>{previewError}</p>
                ) : !previewUrl ? (
                  <p className="paipers-text-muted" style={{ margin: 0 }}>
                    Chargement du document…
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <p
                        style={{
                          fontWeight: 800,
                          margin: 0,
                          color: PAIPERS_COLORS.textPrimary,
                          fontSize: 15,
                        }}
                      >
                        {docs.find((d) => d.id === selectedId)?.title || "Document"}
                      </p>
                      <Link
                        href={`/documents/view?id=${selectedId}`}
                        style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: PAIPERS_COLORS.navy,
                        }}
                      >
                        Ouvrir
                      </Link>
                    </div>
                    {isImage(previewMime, previewUrl) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt=""
                        style={{
                          width: "100%",
                          borderRadius: 12,
                          border: `1px solid ${PAIPERS_COLORS.border}`,
                        }}
                      />
                    ) : (
                      <iframe
                        title="Aperçu document"
                        src={previewUrl}
                        style={{
                          width: "100%",
                          height: 520,
                          border: `1px solid ${PAIPERS_COLORS.border}`,
                          borderRadius: 12,
                        }}
                      />
                    )}
                  </div>
                )}
              </aside>
            </div>
          ) : null}
        </div>
      </AppShell>
    </Protected>
  );
}

function isImage(mime: string, url: string) {
  const m = (mime || "").toLowerCase();
  const u = (url || "").toLowerCase();
  return m.startsWith("image/") || /\.(png|jpe?g|webp|gif)(\?|$)/.test(u);
}
