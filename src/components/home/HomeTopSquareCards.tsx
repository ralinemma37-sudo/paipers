"use client";

/**
 * Réf. : paipers-mobile/src/components/home/HomeTopSquareCards.tsx
 * Tuiles : Démarches administratives + Agenda (calendrier).
 */

import { Compass } from "lucide-react";
import HomeMiniMonthCalendar from "@/components/home/HomeMiniMonthCalendar";
import { useNavSpace } from "@/components/NavSpaceProvider";
import {
  PAIPERS_COLORS,
  PAIPERS_GRADIENTS,
  PAIPERS_PALETTES,
  PAIPERS_RADIUS,
  gradientCss,
} from "@/lib/paipersTheme";

type Props = {
  eventDays: Set<number>;
  /** Démarches : route officielle absente sur le web — signalé, pas de fausse nav. */
  onAgendaClick?: () => void;
};

export default function HomeTopSquareCards({ eventDays, onAgendaClick }: Props) {
  const { showProTabs } = useNavSpace();
  const iconColor = showProTabs ? PAIPERS_COLORS.navy : PAIPERS_COLORS.navy;

  return (
    <div
      className="grid grid-cols-2 gap-[14px]"
      style={{ gap: 14 }}
    >
      <div
        className="paipers-elevated-card relative overflow-hidden flex flex-col aspect-square"
        style={{
          padding: 14,
          backgroundImage: gradientCss(
            showProTabs
              ? PAIPERS_GRADIENTS.professionalSoft
              : PAIPERS_GRADIENTS.personalSoft,
          ),
        }}
        title="Sites officiels — écran mobile /(tabs)/official-services non porté sur le web"
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Compass size={20} color={iconColor} strokeWidth={2.2} />
        </div>
        <p
          style={{
            marginTop: 12,
            fontSize: 15,
            fontWeight: 800,
            color: PAIPERS_COLORS.textPrimary,
            lineHeight: "19px",
            marginBottom: 0,
          }}
        >
          Démarches administratives
        </p>
        <p
          className="paipers-text-muted"
          style={{ marginTop: 4, fontSize: 12, lineHeight: "16px", marginBottom: 0 }}
        >
          Sites officiels pour vos démarches
        </p>
      </div>

      <button
        type="button"
        onClick={onAgendaClick}
        className="paipers-elevated-card text-left aspect-square"
        style={{
          padding: 12,
          borderRadius: PAIPERS_RADIUS.card,
          background: PAIPERS_PALETTES.light.card,
        }}
        aria-label="Agenda"
      >
        <HomeMiniMonthCalendar eventDays={eventDays} />
      </button>
    </div>
  );
}
