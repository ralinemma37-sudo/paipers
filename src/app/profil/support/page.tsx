"use client";

/**
 * Aide & assistance — réf. SupportScreen.tsx (entrées réellement présentes).
 */

import Link from "next/link";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import ProfilSubpageHeader from "@/components/profil/ProfilSubpageHeader";
import { PAIPERS_COLORS, PAIPERS_RADIUS, PAIPERS_SPACE } from "@/lib/paipersTheme";

export default function SupportPage() {
  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 960 }}
        >
          <ProfilSubpageHeader
            title="Aide & assistance"
            subtitle="Besoin d'aide ? Retrouvez les réponses fréquentes ou contactez l'équipe Paipers."
          />

          <p
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: PAIPERS_COLORS.textPrimary,
              marginBottom: 14,
            }}
          >
            Comment pouvons-nous vous aider ?
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            <Link
              href="/assistant"
              className="paipers-elevated-card"
              style={{ display: "block", padding: 16, textDecoration: "none", color: "inherit" }}
            >
              <p style={{ fontWeight: 800, margin: 0 }}>Contacter l&apos;assistant</p>
              <p className="paipers-text-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                Pose une question à Pupo
              </p>
            </Link>

            <a
              href="mailto:support@paipers.app"
              className="paipers-elevated-card"
              style={{ display: "block", padding: 16, textDecoration: "none", color: "inherit" }}
            >
              <p style={{ fontWeight: 800, margin: 0 }}>Contacter le support</p>
              <p className="paipers-text-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                support@paipers.app
              </p>
            </a>
          </div>

          <div className="paipers-elevated-card">
            <p style={{ fontWeight: 800, margin: "0 0 8px" }}>Contacter Paipers</p>
            <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
              Notre équipe vous répond sous 48 h ouvrées.
            </p>
            <a
              href="mailto:support@paipers.app?subject=Contact%20Paipers"
              style={{
                display: "inline-flex",
                marginTop: 14,
                padding: "12px 16px",
                borderRadius: PAIPERS_RADIUS.button,
                background: PAIPERS_COLORS.navy,
                color: "#fff",
                fontWeight: 800,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Envoyer un message
            </a>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
