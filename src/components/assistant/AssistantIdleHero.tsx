"use client";

/**
 * Hero idle Pupo — pièce centrale, centrée (mobile + desktop).
 * Réf. AssistantHeroBlock.tsx
 */

import { useEffect } from "react";
import { Check, ChevronRight } from "lucide-react";
import AssistantMascot from "@/components/assistant/AssistantMascot";
import AssistantComposer, {
  type AssistantComposerAttachment,
} from "@/components/assistant/AssistantComposer";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

const ACCENT = PAIPERS_COLORS.navy;
const SUCCESS = PAIPERS_COLORS.success;

type Props = {
  firstName: string;
  isProMode: boolean;
  adminScore: number | null;
  input: string;
  onChangeInput: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  placeholder: string;
  attachment?: AssistantComposerAttachment | null;
  onRemoveAttachment?: () => void;
  onAttachClick?: () => void;
  onOpenPriorities?: () => void;
};

function formatClock(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AssistantIdleHero({
  firstName,
  isProMode,
  adminScore,
  input,
  onChangeInput,
  onSubmit,
  loading,
  placeholder,
  attachment,
  onRemoveAttachment,
  onAttachClick,
  onOpenPriorities,
}: Props) {
  const headline = isProMode
    ? "Ton espace Pro est prêt."
    : "Tout est en ordre aujourd’hui.";
  const sub = isProMode
    ? "Je veille sur tes factures, documents et relances."
    : "Je reste à l’affût de tout ce qui compte.";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 14,
        width: "100%",
        maxWidth: 560,
        margin: "0 auto",
        background: `radial-gradient(ellipse 70% 55% at 50% 18%, rgba(172,228,255,0.28), transparent 58%),
          linear-gradient(165deg, #EAF3FF 0%, #F8F9FC 42%, #FADDEA 100%)`,
        borderRadius: 24,
        padding: "28px 22px 26px",
        border: "1px solid rgba(26,43,74,0.08)",
      }}
    >
      <div style={{ textAlign: "center", width: "100%" }}>
        <p
          style={{
            color: ACCENT,
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: -0.3,
            margin: 0,
          }}
        >
          Pupo
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 5,
            marginTop: 4,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 4,
              background: SUCCESS,
            }}
          />
          <span
            className="paipers-text-muted"
            style={{ fontSize: 12, fontWeight: 600 }}
          >
            En ligne
          </span>
        </div>
      </div>

      <div className="assistant-pupo-float" style={{ padding: 0 }} aria-hidden>
        <AssistantMascot size={240} />
      </div>

      <div className="w-full" style={{ maxWidth: 440, marginTop: -4 }}>
        <div
          style={{
            width: 0,
            height: 0,
            margin: "0 auto -1px",
            borderLeft: "9px solid transparent",
            borderRight: "9px solid transparent",
            borderBottom: "11px solid #1A2B4A",
          }}
        />
        <div
          className="paipers-card-marine"
          style={{
            borderRadius: 18,
            padding: "14px 16px 12px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              margin: "0 0 3px",
              color: DESKTOP_SURFACES.onDark,
            }}
          >
            Salut {firstName} ! 👋
          </p>
          <p
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: DESKTOP_SURFACES.accentLine,
              letterSpacing: -0.2,
              lineHeight: "22px",
              margin: 0,
            }}
          >
            {headline}
          </p>
          <p
            style={{
              fontSize: 13,
              marginTop: 5,
              lineHeight: "18px",
              marginBottom: 0,
              color: DESKTOP_SURFACES.onDarkMuted,
            }}
          >
            {sub}
          </p>
          <p
            style={{
              fontSize: 11,
              marginTop: 10,
              marginBottom: 0,
              color: DESKTOP_SURFACES.onDarkSoft,
            }}
          >
            {formatClock()}
          </p>
        </div>
      </div>

      <div className="w-full" style={{ maxWidth: 440 }}>
        {adminScore != null && !isProMode ? (
          <AdminScoreCard score={adminScore} onPress={onOpenPriorities} />
        ) : (
          <StatusCard />
        )}
      </div>

      <div className="w-full" style={{ maxWidth: 480, marginTop: 4 }}>
        <AssistantComposer
          value={input}
          onChange={onChangeInput}
          onSubmit={onSubmit}
          loading={loading}
          placeholder={
            attachment ? "Que veux-tu faire avec ce document ?" : placeholder
          }
          variant="pill"
          attachment={attachment}
          onRemoveAttachment={onRemoveAttachment}
          onAttachClick={onAttachClick}
        />
      </div>
    </div>
  );
}

function AdminScoreCard({
  score,
  onPress,
}: {
  score: number;
  onPress?: () => void;
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const ringColor =
    clamped >= 90
      ? SUCCESS
      : clamped >= 70
        ? ACCENT
        : PAIPERS_COLORS.personalGradientMiddle;
  const title =
    clamped >= 90 ? "Excellent ✨" : clamped >= 70 ? "En bonne voie" : "À améliorer";
  const caption =
    clamped >= 90
      ? "Tu gères ! Tout est suivi de près."
      : clamped >= 70
        ? "Bon niveau — quelques points à récupérer."
        : "Des actions peuvent améliorer ton score.";

  return (
    <div
      className="paipers-elevated-card"
      style={{
        borderRadius: 22,
        padding: "14px 14px 12px",
        border: "1px solid rgba(26,43,74,0.1)",
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <ScoreRing progress={clamped} color={ringColor} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 10,
              fontWeight: 800,
              color: ringColor,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              margin: 0,
            }}
          >
            Score administratif
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
            <p style={{ fontSize: 20, fontWeight: 800, color: ringColor, margin: 0 }}>
              {title}
            </p>
            <p className="paipers-text-muted" style={{ fontSize: 13, fontWeight: 700, margin: 0 }}>
              {clamped}/100
            </p>
          </div>
          <div
            style={{
              margin: "8px 0",
              height: 6,
              borderRadius: 999,
              background: "rgba(26,43,74,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${clamped}%`,
                height: "100%",
                background: ringColor,
                borderRadius: 999,
              }}
            />
          </div>
          <p className="paipers-text-muted" style={{ fontSize: 12, lineHeight: "16px", margin: 0 }}>
            {caption}
          </p>
        </div>
      </div>

      {onPress ? (
        <button
          type="button"
          onClick={onPress}
          style={{
            marginTop: 14,
            width: "100%",
            padding: "14px 12px",
            borderRadius: 16,
            border: "none",
            background: ACCENT,
            color: "#fff",
            fontWeight: 800,
            fontSize: 15,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
          }}
        >
          Voir mes priorités
          <ChevronRight size={18} strokeWidth={2.8} />
        </button>
      ) : null}
    </div>
  );
}

function ScoreRing({ progress, color }: { progress: number; color: string }) {
  const size = 70;
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress / 100);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(26,43,74,0.08)"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="54%"
        textAnchor="middle"
        fontSize="14"
        fontWeight="800"
        fill={color}
      >
        {progress}
      </text>
    </svg>
  );
}

function StatusCard() {
  return (
    <div
      className="paipers-elevated-card"
      style={{
        borderRadius: 20,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          background: "hsl(168 45% 92%)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Check size={16} color={SUCCESS} strokeWidth={2.8} />
      </span>
      <span>
        <span
          style={{
            display: "block",
            fontSize: 14,
            fontWeight: 800,
            color: PAIPERS_COLORS.textPrimary,
          }}
        >
          Aucune action nécessaire
        </span>
        <span
          className="paipers-text-muted"
          style={{ display: "block", fontSize: 12, marginTop: 2, lineHeight: "16px" }}
        >
          Profite de ta journée, je gère le reste !
        </span>
      </span>
    </div>
  );
}

export function AssistantPupoFloatStyles() {
  useEffect(() => {
    const id = "assistant-pupo-float-style";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes assistant-pupo-float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }
      @keyframes assistant-spin {
        to { transform: rotate(360deg); }
      }
      .assistant-pupo-float {
        animation: assistant-pupo-float 4.4s ease-in-out infinite;
      }
      .assistant-pupo-float:active {
        animation: none;
      }
      .assistant-spinner {
        animation: assistant-spin 0.8s linear infinite;
      }
    `;
    document.head.appendChild(style);
  }, []);
  return null;
}
