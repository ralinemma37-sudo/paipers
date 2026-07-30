"use client";

import Link from "next/link";
import {
  PRIVACY_POLICY_DISCLAIMER_FR,
  PRIVACY_POLICY_LAST_UPDATED,
  privacyPolicySectionsFr,
} from "@/legal/privacyPolicyFr";
import {
  PUBLISHER_FIELD_LABELS_FR,
  PUBLISHER_FIELDS_TO_COMPLETE_BY_FOUNDERS,
  PUBLISHER_FIELD_STATUS,
} from "@/legal/publisherPlaceholdersFr";
import { PAIPERS_COLORS, PAIPERS_PALETTES, PAIPERS_SPACE } from "@/lib/paipersTheme";

/**
 * Réf. : paipers-mobile/app/legal/politique-confidentialite.tsx
 */
export default function PolitiqueConfidentialitePage() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div
      className="min-h-screen"
      style={{
        background: PAIPERS_PALETTES.light.background,
        padding: PAIPERS_SPACE.screenPad,
        paddingBottom: 48,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link
          href="/signup"
          style={{
            fontWeight: 700,
            color: PAIPERS_PALETTES.light.textMuted,
            textDecoration: "none",
          }}
        >
          ← Retour
        </Link>

        {isDev ? (
          <div
            className="paipers-elevated-card"
            style={{ marginTop: 16, borderColor: PAIPERS_COLORS.warning }}
            role="status"
          >
            <p style={{ fontWeight: 800, margin: "0 0 8px", color: PAIPERS_COLORS.warning }}>
              Information à compléter — environnement de développement
            </p>
            <p className="paipers-text-muted" style={{ fontSize: 13, margin: 0 }}>
              Les mentions d’éditeur ci-dessous ne sont pas définitives. Champs
              encore ouverts :{" "}
              {PUBLISHER_FIELDS_TO_COMPLETE_BY_FOUNDERS.map(
                (k) =>
                  `${PUBLISHER_FIELD_LABELS_FR[k]} (${PUBLISHER_FIELD_STATUS[k]})`,
              ).join(" · ")}
              .
            </p>
          </div>
        ) : null}

        <h1
          className="paipers-screen-title"
          style={{ marginTop: 16, marginBottom: 8 }}
        >
          Politique de confidentialité
        </h1>
        <p className="paipers-text-muted" style={{ marginBottom: 24 }}>
          Dernière mise à jour : {PRIVACY_POLICY_LAST_UPDATED}
        </p>
        {privacyPolicySectionsFr.map((section) => (
          <section key={section.title} style={{ marginBottom: 24 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: PAIPERS_COLORS.navy,
                marginBottom: 8,
              }}
            >
              {section.title}
            </h2>
            {section.paragraphs.map((p) => (
              <p
                key={p.slice(0, 48)}
                style={{
                  fontSize: 14,
                  lineHeight: "22px",
                  color: PAIPERS_COLORS.textPrimary,
                  marginBottom: 10,
                }}
              >
                {p}
              </p>
            ))}
          </section>
        ))}
        <div className="paipers-elevated-card" style={{ marginTop: 16 }}>
          <p style={{ fontWeight: 700, marginBottom: 6 }}>
            Note — relecture juridique recommandée
          </p>
          <p className="paipers-text-muted" style={{ fontSize: 13, margin: 0 }}>
            {PRIVACY_POLICY_DISCLAIMER_FR}
          </p>
        </div>
      </div>
    </div>
  );
}
