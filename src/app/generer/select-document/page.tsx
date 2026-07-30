"use client";

/**
 * Signer — sélection document — réf. generer/select-document.tsx (pick Paipers).
 * Suite : ouverture /documents/view (signature PDF déjà fonctionnelle sur le web).
 * Import téléphone : non branché (pas d’équivalent démontré hors Documents).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_PALETTES, PAIPERS_SPACE } from "@/lib/paipersTheme";

type DocRow = {
  id: string;
  title: string | null;
  mime_type: string | null;
  file_path: string | null;
  created_at: string;
};

function isPdf(mime: string | null, path: string | null) {
  const m = (mime || "").toLowerCase();
  const p = (path || "").toLowerCase();
  return m.includes("pdf") || p.endsWith(".pdf");
}

export default function SelectDocumentToSignPage() {
  const [docs, setDocs] = useState<DocRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }

      const { data, error: err } = await supabase
        .from("documents")
        .select("id,title,mime_type,file_path,created_at")
        .eq("user_id", auth.user.id)
        .eq("is_ready", true)
        .order("created_at", { ascending: false });

      if (err) {
        setError(err.message);
        setDocs([]);
      } else {
        const all = (data || []) as DocRow[];
        setDocs(all.filter((d) => isPdf(d.mime_type, d.file_path)));
      }
      setLoading(false);
    };
    void load();
  }, []);

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 720 }}
        >
          <Link
            href="/generer"
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

          <h1 className="paipers-screen-title" style={{ marginBottom: 8 }}>
            Signer un document
          </h1>
          <p className="paipers-text-muted" style={{ marginBottom: 22, fontSize: 14, lineHeight: "20px" }}>
            Ajoutez votre signature sur n&apos;importe quel PDF. Simple, rapide et légal.
          </p>

          <div className="paipers-elevated-card" style={{ marginBottom: 14 }}>
            <p
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: PAIPERS_COLORS.textPrimary,
                margin: "0 0 4px",
              }}
            >
              Mes documents Paipers
            </p>
            <p className="paipers-text-muted" style={{ margin: 0, fontSize: 13, lineHeight: "18px" }}>
              Parcours tes catégories et choisis un PDF déjà enregistré.
            </p>
          </div>

          <div
            className="paipers-elevated-card"
            style={{ marginBottom: 22, opacity: 0.7 }}
            title="Non disponible sur le web"
          >
            <p
              style={{
                fontWeight: 800,
                fontSize: 15,
                color: PAIPERS_COLORS.textPrimary,
                margin: "0 0 4px",
              }}
            >
              Importer depuis mon téléphone
            </p>
            <p className="paipers-text-muted" style={{ margin: 0, fontSize: 13, lineHeight: "18px" }}>
              Sélectionne un PDF sur ton appareil pour le signer tout de suite. — Non disponible
              sur le web pour le moment.
            </p>
          </div>

          {loading ? (
            <p className="paipers-text-muted">Chargement…</p>
          ) : null}

          {error ? (
            <p style={{ color: "#B91C1C", fontWeight: 600 }}>{error}</p>
          ) : null}

          {!loading && !error && docs.length === 0 ? (
            <p className="paipers-text-muted" style={{ margin: 0, lineHeight: "20px" }}>
              Aucun document PDF prêt à être signé dans cet espace.
            </p>
          ) : null}

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {docs.map((doc) => (
              <Link
                key={doc.id}
                href={`/documents/view?id=${doc.id}`}
                className="paipers-elevated-card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <span
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: PAIPERS_PALETTES.light.muted,
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
                      fontWeight: 700,
                      fontSize: 15,
                      color: PAIPERS_COLORS.textPrimary,
                    }}
                  >
                    {doc.title?.trim() || "Document"}
                  </span>
                  <span className="paipers-text-muted" style={{ fontSize: 12 }}>
                    Ouvre le document puis utilise Signer
                  </span>
                </span>
                <ChevronRight size={18} color={PAIPERS_PALETTES.light.textMuted} />
              </Link>
            ))}
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
