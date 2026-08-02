"use client";

/**
 * Tuiles Accueil — Démarches + Agenda (même bleu marine), sans chevauchement.
 */

import type { CSSProperties } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import HomeMiniMonthCalendar from "@/components/home/HomeMiniMonthCalendar";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";

type Props = {
  eventDays: Set<number>;
};

export default function HomeTopSquareCards({ eventDays }: Props) {
  const cardStyle: CSSProperties = {
    background: DESKTOP_SURFACES.marine,
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    textDecoration: "none",
    color: "inherit",
    display: "flex",
    flexDirection: "column",
    padding: 16,
    minHeight: 180,
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <Link
        href="/demarches"
        className="paipers-hover-lift min-w-0"
        style={cardStyle}
        aria-label="Démarches administratives"
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Compass size={20} color={DESKTOP_SURFACES.onDark} strokeWidth={2.2} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: DESKTOP_SURFACES.onDark,
                lineHeight: "19px",
                margin: 0,
              }}
            >
              Démarches administratives
            </p>
            <p
              style={{
                marginTop: 4,
                fontSize: 12,
                lineHeight: "16px",
                marginBottom: 0,
                color: DESKTOP_SURFACES.onDarkMuted,
              }}
            >
              Sites officiels pour vos démarches
            </p>
          </div>
        </div>
        <p
          style={{
            marginTop: "auto",
            paddingTop: 14,
            fontSize: 11,
            fontWeight: 700,
            color: DESKTOP_SURFACES.accentLine,
            marginBottom: 0,
          }}
        >
          Ouvrir l’annuaire →
        </p>
      </Link>

      <Link
        href="/agenda"
        className="paipers-hover-lift min-w-0"
        style={cardStyle}
        aria-label="Agenda — voir le calendrier"
      >
        <p
          style={{
            margin: "0 0 10px",
            fontSize: 15,
            fontWeight: 800,
            color: DESKTOP_SURFACES.onDark,
          }}
        >
          Agenda
        </p>
        <HomeMiniMonthCalendar eventDays={eventDays} fill dark />
        <p
          style={{
            margin: "12px 0 0",
            fontSize: 11,
            fontWeight: 700,
            color: DESKTOP_SURFACES.accentLine,
          }}
        >
          Voir le calendrier →
        </p>
      </Link>
    </div>
  );
}
