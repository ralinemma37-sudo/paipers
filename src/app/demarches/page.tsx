"use client";

/**
 * /demarches — annuaire de sites officiels (redirection externe uniquement).
 * Aucune automatisation de démarche, aucun identifiant stocké.
 */

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import {
  DEMARCHE_CATEGORIES,
  DEMARCHE_DISCLAIMER,
  DEMARCHE_SUBTITLE,
} from "@/lib/officialServices/demarchesCatalog";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

export default function DemarchesPage() {
  return (
    <Protected>
      <AppShell>
        <div className="pb-24 md:pb-6" style={{ padding: PAIPERS_SPACE.screenPad }}>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold mb-4"
            style={{ color: PAIPERS_COLORS.navy, textDecoration: "none" }}
          >
            <ArrowLeft size={16} />
            Retour à l’accueil
          </Link>

          <div
            className="paipers-card-marine p-5 mb-5"
            style={{
              background: `linear-gradient(135deg, ${DESKTOP_SURFACES.marine} 0%, ${DESKTOP_SURFACES.night} 100%)`,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 800,
                color: DESKTOP_SURFACES.onDark,
                letterSpacing: -0.4,
              }}
            >
              Démarches administratives
            </h1>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 14,
                lineHeight: "20px",
                color: DESKTOP_SURFACES.onDarkMuted,
              }}
            >
              {DEMARCHE_SUBTITLE}
            </p>
          </div>

          <p
            className="paipers-card-muted text-[13px] leading-relaxed mb-6"
            style={{ padding: 14, margin: "0 0 24px" }}
            role="note"
          >
            {DEMARCHE_DISCLAIMER}
          </p>

          <div className="flex flex-col gap-6">
            {DEMARCHE_CATEGORIES.map((cat) => (
              <section key={cat.id}>
                <h2
                  style={{
                    margin: "0 0 10px",
                    fontSize: 17,
                    fontWeight: 800,
                    color: PAIPERS_COLORS.textPrimary,
                  }}
                >
                  {cat.label}
                </h2>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  {cat.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="paipers-card-white paipers-hover-lift block"
                      style={{
                        padding: 14,
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          style={{
                            margin: 0,
                            fontSize: 15,
                            fontWeight: 800,
                            color: PAIPERS_COLORS.textPrimary,
                          }}
                        >
                          {link.title}
                        </p>
                        <ExternalLink
                          size={16}
                          color={PAIPERS_COLORS.navy}
                          className="shrink-0 mt-0.5"
                          aria-hidden
                        />
                      </div>
                      <p
                        className="paipers-text-muted"
                        style={{ margin: "6px 0 0", fontSize: 13, lineHeight: "18px" }}
                      >
                        {link.description}
                      </p>
                      <p
                        style={{
                          margin: "8px 0 0",
                          fontSize: 11,
                          fontWeight: 700,
                          color: PAIPERS_COLORS.navy,
                        }}
                      >
                        Site externe · {link.officialDomain}
                      </p>
                    </a>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
