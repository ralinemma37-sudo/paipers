"use client";

/**
 * Réf. : paipers-mobile/src/components/assistant/AssistantCommandComposer.tsx
 * Web : pas de micro / import téléphone (non équivalents démontrés).
 */

import { ArrowRight, FileText, Paperclip, X } from "lucide-react";
import {
  PAIPERS_ASSISTANT_CHAT,
  PAIPERS_COLORS,
  PAIPERS_PALETTES,
} from "@/lib/paipersTheme";

export type AssistantComposerAttachment = {
  documentId: string;
  title: string;
};

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  placeholder: string;
  /** Idle personal utilise le cercle navy + flèche (label Créer non affiché en pill). */
  variant?: "pill" | "compact";
  attachment?: AssistantComposerAttachment | null;
  onRemoveAttachment?: () => void;
  onAttachClick?: () => void;
  ariaLabel?: string;
};

export default function AssistantComposer({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder,
  variant = "pill",
  attachment,
  onRemoveAttachment,
  onAttachClick,
  ariaLabel = "Message à Pupo",
}: Props) {
  const canSubmit = value.trim().length > 0 || !!attachment;
  const isPill = variant === "pill";

  return (
    <div
      className="paipers-elevated-card"
      style={{
        borderRadius: isPill ? 999 : 20,
        padding: isPill ? "8px 10px 8px 16px" : 12,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {attachment ? (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            alignSelf: "flex-start",
            padding: "6px 10px",
            borderRadius: 12,
            background: "rgba(26,43,74,0.06)",
            maxWidth: "100%",
          }}
        >
          <FileText size={14} color={PAIPERS_COLORS.navy} />
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: PAIPERS_COLORS.textPrimary,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              maxWidth: 220,
            }}
          >
            {attachment.title}
          </span>
          {onRemoveAttachment ? (
            <button
              type="button"
              onClick={onRemoveAttachment}
              aria-label="Retirer la pièce jointe"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                padding: 2,
                display: "inline-flex",
              }}
            >
              <X size={14} color={PAIPERS_PALETTES.light.textMuted} />
            </button>
          ) : null}
        </div>
      ) : null}

      <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
        {onAttachClick ? (
          <button
            type="button"
            onClick={onAttachClick}
            disabled={loading}
            aria-label="Joindre un document"
            style={{
              border: "none",
              background: "transparent",
              cursor: loading ? "wait" : "pointer",
              padding: 6,
              display: "inline-flex",
              flexShrink: 0,
            }}
          >
            <Paperclip size={20} color={PAIPERS_PALETTES.light.textMuted} />
          </button>
        ) : null}

        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
          disabled={loading}
          rows={isPill ? 1 : 2}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              if (canSubmit && !loading) onSubmit();
            }
          }}
          style={{
            flex: 1,
            minWidth: 0,
            border: "none",
            outline: "none",
            resize: "none",
            background: "transparent",
            fontSize: isPill ? 15 : 15,
            lineHeight: "22px",
            color: PAIPERS_COLORS.textPrimary,
            padding: "8px 4px",
            maxHeight: 96,
            fontFamily: "inherit",
          }}
        />

        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          aria-label="Envoyer"
          style={{
            width: 44,
            height: 44,
            borderRadius: 999,
            border: "none",
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: !canSubmit || loading ? "not-allowed" : "pointer",
            opacity: !canSubmit || loading ? 0.45 : 1,
            background: isPill ? "#111827" : PAIPERS_ASSISTANT_CHAT.actionButtonBg,
            color: isPill ? "#fff" : PAIPERS_ASSISTANT_CHAT.actionButtonText,
          }}
        >
          <ArrowRight size={20} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
