"use client";

/**
 * Hub Confidentialité & légal — réf. app/legal/confidentialite.tsx
 * Liens vers pages web existantes ; entrées sans page web → indisponible.
 */

import Link from "next/link";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import ProfilSubpageHeader from "@/components/profil/ProfilSubpageHeader";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

const ROWS: {
  title: string;
  desc: string;
  href: string | null;
}[] = [
  {
    title: "Politique de confidentialité",
    desc: "RGPD : données, IA, espaces, invitations, droits.",
    href: "/legal/politique-confidentialite",
  },
  {
    title: "Conditions générales (CGU)",
    desc: "Assistant, Pro, Famille, responsabilités.",
    href: "/legal/cgu",
  },
  {
    title: "Assistant IA",
    desc: "Chat, documents, espace actif, limites.",
    href: null,
  },
  {
    title: "Espaces partagés",
    desc: "Famille (Premium), Pro : membres, invitations.",
    href: null,
  },
  {
    title: "Données et Gmail",
    desc: "Import de pièces jointes et envoi d’invitations.",
    href: null,
  },
  {
    title: "Mentions légales",
    desc: "Éditeur, hébergement, propriété intellectuelle.",
    href: null,
  },
];

export default function ProfilLegalHubPage() {
  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 720 }}
        >
          <ProfilSubpageHeader
            title="Confidentialité et informations légales"
            subtitle="Politique, CGU, assistant IA, espaces, Gmail."
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {ROWS.map((row) =>
              row.href ? (
                <Link
                  key={row.title}
                  href={row.href}
                  className="paipers-elevated-card"
                  style={{
                    display: "block",
                    padding: 16,
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <p style={{ fontWeight: 800, margin: 0, fontSize: 15 }}>{row.title}</p>
                  <p className="paipers-text-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    {row.desc}
                  </p>
                </Link>
              ) : (
                <div
                  key={row.title}
                  className="paipers-elevated-card"
                  style={{ padding: 16, opacity: 0.7 }}
                >
                  <p style={{ fontWeight: 800, margin: 0, fontSize: 15 }}>{row.title}</p>
                  <p className="paipers-text-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                    {row.desc}
                  </p>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 12,
                      fontWeight: 700,
                      color: PAIPERS_COLORS.neutral,
                    }}
                  >
                    Page non portée sur le web pour le moment
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
