"use client";

/**
 * Sélection document Paipers — réf. mobile « Depuis Paipers » (select-document).
 */

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useEscapeToClose } from "@/hooks/useEscapeToClose";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_RADIUS } from "@/lib/paipersTheme";

export type PickableDoc = {
  id: string;
  title: string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (doc: { documentId: string; title: string }) => void;
};

export default function AssistantDocumentPicker({ open, onClose, onPick }: Props) {
  const [docs, setDocs] = useState<PickableDoc[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEscapeToClose(open, onClose);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setError("Connecte-toi pour joindre un document.");
        setLoading(false);
        return;
      }
      const { data, error: err } = await supabase
        .from("documents")
        .select("id,title")
        .eq("user_id", auth.user.id)
        .eq("is_ready", true)
        .order("created_at", { ascending: false })
        .limit(40);
      if (cancelled) return;
      if (err) {
        setError(err.message);
        setDocs([]);
      } else {
        setDocs((data as PickableDoc[]) || []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Depuis Paipers"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(15, 23, 42, 0.45)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        className="paipers-elevated-card"
        style={{
          width: "100%",
          maxWidth: 480,
          margin: 16,
          borderRadius: 24,
          padding: 20,
          maxHeight: "70vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <p
            style={{
              fontSize: 17,
              fontWeight: 900,
              color: PAIPERS_COLORS.textPrimary,
              margin: 0,
            }}
          >
            Depuis Paipers
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{ border: "none", background: "transparent", cursor: "pointer" }}
          >
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <p className="paipers-text-muted" style={{ marginTop: 16 }}>
            Chargement…
          </p>
        ) : null}
        {error ? (
          <p style={{ color: "#B91C1C", marginTop: 16, fontSize: 14 }}>{error}</p>
        ) : null}
        {!loading && !error && docs.length === 0 ? (
          <p className="paipers-text-muted" style={{ marginTop: 16 }}>
            Je n&apos;ai trouvé aucun document correspondant.
          </p>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
          {docs.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => {
                onPick({
                  documentId: d.id,
                  title: d.title?.trim() || "Document",
                });
                onClose();
              }}
              style={{
                textAlign: "left",
                padding: "12px 14px",
                borderRadius: 14,
                border: `1px solid ${PAIPERS_COLORS.border}`,
                background: "#fff",
                fontWeight: 700,
                fontSize: 14,
                color: PAIPERS_COLORS.textPrimary,
                cursor: "pointer",
              }}
            >
              {d.title?.trim() || "Document"}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 14,
            width: "100%",
            padding: "14px 16px",
            borderRadius: PAIPERS_RADIUS.button,
            border: `1px solid ${PAIPERS_COLORS.border}`,
            background: "#fff",
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}
