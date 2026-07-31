"use client";

/**
 * Tuiles Accueil — Démarches → /demarches, Agenda → /agenda.
 */

import Link from "next/link";
import { Compass } from "lucide-react";
import HomeMiniMonthCalendar from "@/components/home/HomeMiniMonthCalendar";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import {
  PAIPERS_COLORS,
  PAIPERS_PALETTES,
  PAIPERS_RADIUS,
} from "@/lib/paipersTheme";

type Props = {
  eventDays: Set<number>;
};

export default function HomeTopSquareCards({ eventDays }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] md:items-stretch md:gap-4">
      <Link
        href="/demarches"
        className="paipers-card-marine relative overflow-hidden flex flex-col aspect-square md:aspect-auto md:min-h-0 p-4 paipers-hover-lift"
        style={{ textDecoration: "none" }}
        aria-label="Démarches administratives"
      >
        <div className="flex items-start gap-3 md:items-center">
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
          <div className="min-w-0 flex-1">
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
            <p
              style={{
                marginTop: 8,
                fontSize: 11,
                fontWeight: 700,
                color: DESKTOP_SURFACES.accentLine,
                marginBottom: 0,
              }}
            >
              Ouvrir l’annuaire →
            </p>
          </div>
        </div>
      </Link>

      <Link
        href="/agenda"
        className="paipers-card-white text-left aspect-square md:aspect-auto md:min-h-0 w-full paipers-hover-lift block"
        style={{
          padding: 14,
          borderRadius: PAIPERS_RADIUS.card,
          background: PAIPERS_PALETTES.light.card,
          textDecoration: "none",
          color: "inherit",
        }}
        aria-label="Agenda — voir le calendrier"
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 13,
            fontWeight: 800,
            color: PAIPERS_COLORS.navy,
          }}
        >
          Agenda
        </p>
        <HomeMiniMonthCalendar eventDays={eventDays} fill />
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 11,
            fontWeight: 700,
            color: PAIPERS_COLORS.navy,
          }}
        >
          Voir le calendrier →
        </p>
      </Link>
    </div>
  );
}
