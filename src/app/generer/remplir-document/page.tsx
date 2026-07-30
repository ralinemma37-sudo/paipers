"use client";

/**
 * Compléter un document — entrée hub mobile (remplir-document).
 * Edge prepare-document-fill / save-filled-document absents du web → état indisponible.
 */

import Link from "next/link";
import { ChevronLeft, FileEdit } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import {
  PAIPERS_COLORS,
  PAIPERS_FOLDER_CIRCLE_BACKGROUNDS,
  PAIPERS_FOLDER_ICON_COLORS,
  PAIPERS_SPACE,
} from "@/lib/paipersTheme";

export default function RemplirDocumentPage() {
  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 640 }}
        >
          <Link
            href="/generer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "#64748b",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            <ChevronLeft size={18} />
            Retour
          </Link>

          <h1 className="paipers-screen-title" style={{ marginBottom: 8 }}>
            Compléter un document
          </h1>
          <p className="paipers-text-muted" style={{ marginBottom: 22, fontSize: 14, lineHeight: "20px" }}>
            Remplissez automatiquement vos PDF existants. Formulaires, attestations, déclarations.
          </p>

          <div className="paipers-elevated-card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
            <span
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                background: PAIPERS_FOLDER_CIRCLE_BACKGROUNDS["#F7C4E8"],
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <FileEdit size={26} color={PAIPERS_FOLDER_ICON_COLORS["#F7C4E8"]} strokeWidth={2.2} />
            </span>
            <div>
              <p
                style={{
                  fontWeight: 800,
                  fontSize: 16,
                  color: PAIPERS_COLORS.textPrimary,
                  margin: "0 0 8px",
                }}
              >
                Non disponible sur le web pour le moment
              </p>
              <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
                Sur mobile, Paipers prépare et remplit tes PDF via les fonctions{" "}
                <code style={{ fontSize: 12 }}>prepare-document-fill</code> et{" "}
                <code style={{ fontSize: 12 }}>save-filled-document</code>. Ces parcours ne sont
                pas branchés côté web.
              </p>
            </div>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
