"use client";

/**
 * Réf. : paipers-mobile/src/features/documentImport/DocumentImportSourceSheet.tsx
 * Web : équivalent Fichiers (+ images) — pas d’appareil photo / scan simulé.
 */

import { useRef } from "react";
import { X } from "lucide-react";
import { useEscapeToClose } from "@/hooks/useEscapeToClose";
import { PAIPERS_COLORS, PAIPERS_RADIUS } from "@/lib/paipersTheme";

type Props = {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onPickFiles: (files: FileList | File[]) => void;
};

export default function DocumentsImportSourceSheet({
  open,
  busy,
  onClose,
  onPickFiles,
}: Props) {
  const filesRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  useEscapeToClose(open && !busy, onClose);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal
      aria-label="Importer un document"
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
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <p
              style={{
                fontSize: 17,
                fontWeight: 900,
                color: PAIPERS_COLORS.textPrimary,
                margin: 0,
              }}
            >
              Importer un document
            </p>
            <p
              className="paipers-text-muted"
              style={{ marginTop: 6, fontSize: 13, lineHeight: "18px", marginBottom: 0 }}
            >
              {busy
                ? "Import en cours…"
                : "PDF ou photos depuis tes fichiers ou ta galerie — Paipers range tout automatiquement."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <X size={20} color={PAIPERS_COLORS.textPrimary} />
          </button>
        </div>

        <input
          ref={filesRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onPickFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={galleryRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onPickFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <ActionBtn
          disabled={busy}
          label="Importer depuis Fichiers"
          onClick={() => filesRef.current?.click()}
        />
        <ActionBtn
          disabled={busy}
          label="Importer depuis la Galerie"
          onClick={() => galleryRef.current?.click()}
        />
        <button
          type="button"
          onClick={onClose}
          disabled={busy}
          style={{
            marginTop: 4,
            padding: "14px 16px",
            borderRadius: PAIPERS_RADIUS.button,
            border: `1px solid ${PAIPERS_COLORS.border}`,
            background: "#fff",
            fontWeight: 800,
            fontSize: 14,
            cursor: "pointer",
            color: PAIPERS_COLORS.textPrimary,
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
}

function ActionBtn({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        padding: "14px 16px",
        borderRadius: PAIPERS_RADIUS.button,
        border: "none",
        background: PAIPERS_COLORS.navy,
        color: "#fff",
        fontWeight: 800,
        fontSize: 14,
        cursor: disabled ? "wait" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}
