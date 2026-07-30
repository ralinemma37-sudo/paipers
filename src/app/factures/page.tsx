"use client";

/**
 * Page provisoire Factures — onglet Pro mobile.
 * Réf. route : paipers-mobile/app/(tabs)/factures
 * Contenu métier non porté (étape navigation uniquement).
 */

import AppShell from "@/components/AppShell";
import Protected from "@/components/Protected";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

export default function FacturesPage() {
  return (
    <Protected>
      <AppShell>
        <div
          style={{
            padding: PAIPERS_SPACE.screenPad,
            paddingBottom: 96,
          }}
        >
          <h1 className="paipers-screen-title" style={{ marginBottom: 8 }}>
            Factures
          </h1>
          <p className="paipers-text-muted" style={{ marginBottom: 24 }}>
            Espace Professionnel
          </p>
          <div className="paipers-elevated-card">
            <p
              style={{
                fontWeight: 700,
                color: PAIPERS_COLORS.textPrimary,
                marginBottom: 6,
              }}
            >
              Bientôt disponible sur le web
            </p>
            <p className="paipers-text-muted" style={{ fontSize: 14 }}>
              L’onglet Factures est présent pour coller à la navigation mobile
              Pro. Le contenu métier sera porté dans une étape ultérieure.
            </p>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
