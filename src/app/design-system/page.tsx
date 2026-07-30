"use client";

/**
 * Page temporaire de contrôle visuel — Étape 1 design tokens.
 * Affiche uniquement des exemples fondés sur les tokens / composants mobiles.
 * Ne pas utiliser en production comme écran métier.
 */

import type { ReactNode } from "react";
import {
  PAIPERS_ASSETS,
  PAIPERS_ASSISTANT_CHAT,
  PAIPERS_COLORS,
  PAIPERS_FOLDER_SWATCHES,
  PAIPERS_GRADIENTS,
  PAIPERS_PALETTES,
  PAIPERS_RADIUS,
  PAIPERS_SHADOWS,
  PAIPERS_SPACE,
  PAIPERS_TYPE,
  gradientCss,
} from "@/lib/paipersTheme";

const BRAND_SWATCHES: { label: string; value: string; source: string }[] = [
  { label: "navy", value: PAIPERS_COLORS.navy, source: "paipersColors.ts" },
  {
    label: "navyLight",
    value: PAIPERS_COLORS.navyLight,
    source: "paipersColors.ts",
  },
  {
    label: "navyMuted",
    value: PAIPERS_COLORS.navyMuted,
    source: "paipersColors.ts",
  },
  {
    label: "navySoft",
    value: PAIPERS_COLORS.navySoft,
    source: "paipersColors.ts",
  },
  {
    label: "gradientStart",
    value: PAIPERS_COLORS.personalGradientStart,
    source: "paipersColors.ts",
  },
  {
    label: "gradientMiddle",
    value: PAIPERS_COLORS.personalGradientMiddle,
    source: "paipersColors.ts",
  },
  {
    label: "gradientEnd",
    value: PAIPERS_COLORS.personalGradientEnd,
    source: "paipersColors.ts",
  },
  {
    label: "softStart",
    value: PAIPERS_COLORS.personalGradientSoftStart,
    source: "paipersColors.ts",
  },
  {
    label: "softMiddle",
    value: PAIPERS_COLORS.personalGradientSoftMiddle,
    source: "paipersColors.ts",
  },
  {
    label: "softEnd",
    value: PAIPERS_COLORS.personalGradientSoftEnd,
    source: "paipersColors.ts",
  },
  {
    label: "primary",
    value: PAIPERS_PALETTES.light.primary,
    source: "paipers.ts",
  },
  {
    label: "secondary",
    value: PAIPERS_PALETTES.light.secondary,
    source: "paipers.ts",
  },
  {
    label: "accent",
    value: PAIPERS_PALETTES.light.accent,
    source: "paipers.ts",
  },
  {
    label: "surface",
    value: PAIPERS_COLORS.surface,
    source: "paipersColors.ts",
  },
  {
    label: "border",
    value: PAIPERS_COLORS.border,
    source: "paipersColors.ts",
  },
  {
    label: "success",
    value: PAIPERS_COLORS.success,
    source: "paipersColors.ts",
  },
  {
    label: "error",
    value: PAIPERS_COLORS.error,
    source: "paipersColors.ts",
  },
  {
    label: "warning",
    value: PAIPERS_COLORS.warning,
    source: "paipersColors.ts",
  },
  {
    label: "familyOrange",
    value: PAIPERS_COLORS.familyOrangeHex,
    source: "paipersColors.ts",
  },
];

const GRADIENT_SAMPLES: { label: string; css: string; source: string }[] = [
  {
    label: "Personnel",
    css: gradientCss(PAIPERS_GRADIENTS.personal),
    source: "spaceTheme PERSONAL_THEME.gradient",
  },
  {
    label: "Personnel soft",
    css: gradientCss(PAIPERS_GRADIENTS.personalSoft),
    source: "spaceTheme PERSONAL_THEME.gradientSoft",
  },
  {
    label: "Bouton PaipersButton",
    css: gradientCss(PAIPERS_GRADIENTS.button, 90),
    source: "PaipersButton.tsx",
  },
  {
    label: "Wash border",
    css: gradientCss(PAIPERS_GRADIENTS.washBorderLight),
    source: "paipers.ts paipersWashBorder.light.trio",
  },
  {
    label: "Soft inner fill",
    css: gradientCss(PAIPERS_GRADIENTS.softInnerFillLight),
    source: "paipers.ts paipersSoftInnerFill.light.trio",
  },
  {
    label: "Professionnel",
    css: gradientCss(PAIPERS_GRADIENTS.professional),
    source: "spaceTheme PROFESSIONAL_THEME.gradient",
  },
  {
    label: "Famille score",
    css: gradientCss(PAIPERS_GRADIENTS.familyScore),
    source: "spaceTheme FAMILY_SCORE_GRADIENT",
  },
];

export default function DesignSystemPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: PAIPERS_COLORS.background,
        color: PAIPERS_COLORS.textPrimary,
        padding: PAIPERS_SPACE.screenPad,
        paddingBottom: 48,
      }}
    >
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: PAIPERS_COLORS.textSecondary,
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Contrôle temporaire — Étape 1
        </p>
        <h1 className="paipers-screen-title" style={{ marginBottom: 8 }}>
          Design system Paipers
        </h1>
        <p className="paipers-text-muted" style={{ marginBottom: 32 }}>
          Valeurs extraites de paipers-mobile. Aucune couleur inventée.
        </p>

        {/* Assets */}
        <Section title="Logo & mascotte Pupo">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
              alignItems: "flex-end",
            }}
          >
            <figure style={{ margin: 0, textAlign: "center" }}>
              <img
                src={PAIPERS_ASSETS.logoSplashLight}
                alt="Logo Paipers splash light"
                style={{ width: 120, height: "auto" }}
              />
              <figcaption
                className="paipers-text-muted"
                style={{ fontSize: 12, marginTop: 8 }}
              >
                splash-logo-light.png
              </figcaption>
            </figure>
            <figure style={{ margin: 0, textAlign: "center" }}>
              <img
                src={PAIPERS_ASSETS.mascot}
                alt="Mascotte Pupo"
                style={{ width: 200, height: "auto" }}
              />
              <figcaption
                className="paipers-text-muted"
                style={{ fontSize: 12, marginTop: 8 }}
              >
                assistant-mascot.png (Pupo)
              </figcaption>
            </figure>
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 29,
                background: PAIPERS_ASSISTANT_CHAT.tabIconSky,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxShadow: "0 4px 10px rgba(172, 228, 255, 0.28)",
              }}
            >
              <img
                src={PAIPERS_ASSETS.mascot}
                alt="Avatar Pupo tab"
                style={{
                  width: 48,
                  height: 48,
                  objectFit: "cover",
                  objectPosition: "center top",
                }}
              />
            </div>
          </div>
          <p className="paipers-text-muted" style={{ fontSize: 12, marginTop: 12 }}>
            Sources : assets/images/splash-logo-light.png ·
            assets/images/assistant-mascot.png · tab focus
            PAIPERS_COLORS.personalGradientStart
          </p>
        </Section>

        {/* Palette */}
        <Section title="Palette officielle">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
              gap: 12,
            }}
          >
            {BRAND_SWATCHES.map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    height: 56,
                    borderRadius: 12,
                    background: s.value,
                    border: `1px solid ${PAIPERS_COLORS.border}`,
                  }}
                />
                <p style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>
                  {s.label}
                </p>
                <p className="paipers-text-muted" style={{ fontSize: 11 }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Gradients */}
        <Section title="Gradients officiels">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {GRADIENT_SAMPLES.map((g) => (
              <div key={g.label}>
                <div
                  style={{
                    height: 48,
                    borderRadius: PAIPERS_RADIUS.card,
                    backgroundImage: g.css,
                    border: `1px solid ${PAIPERS_COLORS.border}`,
                  }}
                />
                <p style={{ fontSize: 13, fontWeight: 700, marginTop: 6 }}>
                  {g.label}
                </p>
                <p className="paipers-text-muted" style={{ fontSize: 11 }}>
                  {g.source}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Typography */}
        <Section title="Typographie">
          <p className="paipers-screen-title">Titre d’écran (28 / 800)</p>
          <p style={{ marginTop: 8, color: PAIPERS_COLORS.textPrimary }}>
            Texte principal — {PAIPERS_COLORS.textPrimary}
          </p>
          <p className="paipers-text-muted" style={{ marginTop: 4 }}>
            Texte secondaire — {PAIPERS_COLORS.textSecondary}
          </p>
          <p className="paipers-text-muted" style={{ fontSize: 12, marginTop: 12 }}>
            Source : typography.ts screenTitleStyle · police système (mobile sans
            font custom UI)
          </p>
        </Section>

        {/* Buttons */}
        <Section title="Bouton (PaipersButton)">
          <button type="button" className="paipers-button">
            Continuer
          </button>
          <p className="paipers-text-muted" style={{ fontSize: 12, marginTop: 12 }}>
            Gradient hsl(202 100% 82%) → hsl(328 80% 84%) → hsl(39 100% 85%) ·
            radius {PAIPERS_RADIUS.button} · ombre {PAIPERS_SHADOWS.button} ·
            texte blanc 16/800
          </p>
        </Section>

        {/* Cards */}
        <Section title="Cartes (elevated card)">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: PAIPERS_SPACE.homeGridGap,
            }}
          >
            <div className="paipers-elevated-card">
              <p style={{ fontWeight: 800, marginBottom: 6 }}>Carte élevée</p>
              <p className="paipers-text-muted" style={{ fontSize: 14 }}>
                getPaipersElevatedCard — fond card, border, radius{" "}
                {PAIPERS_RADIUS.card}, ombre {PAIPERS_SHADOWS.cardLight}
              </p>
            </div>
            <div className="card">
              <p style={{ fontWeight: 800, marginBottom: 6 }}>
                Classe .card (web)
              </p>
              <p className="paipers-text-muted" style={{ fontSize: 14 }}>
                Alignée sur la carte élevée mobile.
              </p>
            </div>
            <div
              className="paipers-elevated-card paipers-gradient-soft-fill"
              style={{ borderColor: "transparent" }}
            >
              <p style={{ fontWeight: 800, marginBottom: 6 }}>Soft inner fill</p>
              <p className="paipers-text-muted" style={{ fontSize: 14 }}>
                paipersSoftInnerFill.light.trio
              </p>
            </div>
          </div>
        </Section>

        {/* Radius & space */}
        <Section title="Rayons & espacements">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
            {(
              [
                ["card", PAIPERS_RADIUS.card],
                ["input", PAIPERS_RADIUS.input],
                ["button", PAIPERS_RADIUS.button],
              ] as const
            ).map(([name, r]) => (
              <div
                key={name}
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: r === 999 ? 999 : r,
                  background: PAIPERS_COLORS.personalGradientSoftStart,
                  border: `1px solid ${PAIPERS_COLORS.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {name} {r}
              </div>
            ))}
          </div>
          <p className="paipers-text-muted" style={{ fontSize: 12, marginTop: 12 }}>
            Screen pad {PAIPERS_SPACE.screenPad} · card pad {PAIPERS_SPACE.cardPad}{" "}
            · grid gap {PAIPERS_SPACE.homeGridGap} · title {PAIPERS_TYPE.screenTitle.fontSize}/
            {PAIPERS_TYPE.screenTitle.fontWeight}
          </p>
        </Section>

        {/* Assistant colors */}
        <Section title="Couleurs Assistant (chat)">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            <Bubble
              label="Bulle user"
              bg={PAIPERS_ASSISTANT_CHAT.userBubbleBg}
            />
            <Bubble
              label="Action"
              bg={PAIPERS_ASSISTANT_CHAT.actionButtonBg}
            />
            <Bubble
              label="Idle page"
              bg={PAIPERS_ASSISTANT_CHAT.idlePageBg}
            />
            <Bubble label="Tab sky" bg={PAIPERS_ASSISTANT_CHAT.tabIconSky} />
            <Bubble label="Tab gray" bg={PAIPERS_ASSISTANT_CHAT.tabIconGray} />
          </div>
          <p className="paipers-text-muted" style={{ fontSize: 12, marginTop: 12 }}>
            assistantChatTheme.ts · AssistantHeroBlock PAGE_BG ·
            AssistantMascot tab icons
          </p>
        </Section>

        {/* Folder swatches */}
        <Section title="Pastels dossiers">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PAIPERS_FOLDER_SWATCHES.map((c) => (
              <div
                key={c}
                title={c}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: c,
                  border: `1px solid ${PAIPERS_COLORS.border}`,
                }}
              />
            ))}
          </div>
          <p className="paipers-text-muted" style={{ fontSize: 12, marginTop: 12 }}>
            folderColors.ts FOLDER_COLOR_SWATCHES
          </p>
        </Section>

        <p
          className="paipers-text-muted"
          style={{ fontSize: 12, marginTop: 40, textAlign: "center" }}
        >
          /design-system — page de contrôle uniquement. Attendre validation avant
          étape 2 (navigation).
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section style={{ marginBottom: 40 }}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 800,
          marginBottom: 16,
          color: PAIPERS_COLORS.navy,
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Bubble({ label, bg }: { label: string; bg: string }) {
  return (
    <div
      style={{
        padding: "12px 16px",
        borderRadius: 16,
        background: bg,
        color: PAIPERS_COLORS.textPrimary,
        fontSize: 13,
        fontWeight: 600,
        border: `1px solid ${PAIPERS_COLORS.border}`,
      }}
    >
      {label}
    </div>
  );
}
