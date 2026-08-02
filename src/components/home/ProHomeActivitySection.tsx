"use client";

/**
 * Réf. : paipers-mobile/src/features/proHome/ProHomeActivitySection.tsx
 * + buildProActivitySummary.ts (états vides officiels — pas de données Pro web).
 */

import Link from "next/link";
import type { CSSProperties } from "react";
import { AlertTriangle, ChevronRight, FileText, Landmark, Package } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type ProActivityCardId = "invoices" | "treasury" | "suppliers" | "compliance";

type ProActivityCard = {
  id: ProActivityCardId;
  title: string;
  subtitle: string;
  href: string | null;
};

const CARD_ICONS: Record<ProActivityCardId, LucideIcon> = {
  invoices: FileText,
  treasury: Landmark,
  suppliers: Package,
  compliance: AlertTriangle,
};

/**
 * États vides Pro web — pas de montants / compteurs fictifs.
 * Réf. empty mobile quand aucune donnée ; hub Factures web = aucune donnée branchée.
 */
const EMPTY_ACTIVITY_CARDS: ProActivityCard[] = [
  {
    id: "invoices",
    title: "Factures",
    subtitle: "Aucune facture en attente",
    href: "/factures",
  },
  {
    id: "treasury",
    title: "Trésorerie",
    subtitle: "Aucune donnée connectée",
    href: null,
  },
  {
    id: "suppliers",
    title: "Fournisseurs",
    subtitle: "Non disponible sur le web",
    href: null,
  },
  {
    id: "compliance",
    title: "Conformité",
    subtitle: "Non disponible sur le web",
    href: null,
  },
];

export default function ProHomeActivitySection() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p
        style={{
          fontSize: 16,
          fontWeight: 800,
          color: PAIPERS_COLORS.textPrimary,
          margin: 0,
        }}
      >
        Mon activité
      </p>
      <div className="flex flex-col gap-2.5 w-full">
        {EMPTY_ACTIVITY_CARDS.map((card) => {
          const Icon = CARD_ICONS[card.id];
          const inner = (
            <>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background:
                    card.id === "invoices"
                      ? "rgba(255,255,255,0.12)"
                      : "hsl(214 62% 90%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon
                  size={20}
                  color={card.id === "invoices" ? "#F5F7FB" : PAIPERS_COLORS.navy}
                  strokeWidth={2.2}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 15,
                    fontWeight: 800,
                    color:
                      card.id === "invoices"
                        ? "#F5F7FB"
                        : PAIPERS_COLORS.textPrimary,
                    margin: 0,
                  }}
                >
                  {card.title}
                </p>
                <p
                  className={card.id === "invoices" ? undefined : "paipers-text-muted"}
                  style={{
                    fontSize: 13,
                    lineHeight: "18px",
                    margin: "2px 0 0",
                    color:
                      card.id === "invoices"
                        ? "rgba(245,247,251,0.68)"
                        : undefined,
                  }}
                >
                  {card.subtitle}
                </p>
              </div>
              <ChevronRight
                size={18}
                color={
                  card.id === "invoices"
                    ? "rgba(245,247,251,0.45)"
                    : PAIPERS_PALETTES.light.textMuted
                }
              />
            </>
          );

          const rowStyle: CSSProperties = {
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            padding: "14px 16px",
            textDecoration: "none",
            color: "inherit",
            width: "100%",
            boxSizing: "border-box",
            border: "none",
            background: "inherit",
            cursor: card.href ? "pointer" : "default",
            textAlign: "left",
            font: "inherit",
          };

          if (card.href) {
            return (
              <Link
                key={card.id}
                href={card.href}
                className={`paipers-hover-lift ${
                  card.id === "invoices" ? "" : "paipers-card-white"
                }`}
                style={{
                  ...rowStyle,
                  ...(card.id === "invoices"
                    ? {
                        background: "#1A2B4A",
                        borderRadius: 16,
                        border: "1px solid rgba(255,255,255,0.08)",
                      }
                    : {}),
                }}
              >
                {inner}
              </Link>
            );
          }

          return (
            <div
              key={card.id}
              className={`paipers-hover-lift ${
                card.id === "compliance" ? "paipers-card-muted" : "paipers-card-white"
              }`}
              style={rowStyle}
            >
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
