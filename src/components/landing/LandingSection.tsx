/**
 * Conteneur de section landing — styles / tons inchangés.
 */

import type { ReactNode } from "react";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";

export type LandingSectionTone =
  | "light"
  | "canvas"
  | "alt"
  | "night"
  | "marine"
  | "violet"
  | "white";

export default function LandingSection({
  id,
  children,
  className = "",
  tone = "light",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: LandingSectionTone;
}) {
  const bg: Record<LandingSectionTone, string> = {
    // 18/10 (retour Vanessa : sections « fades ») : fonds doux aux couleurs de l'appli —
    // lilas très clair (Personnel) et bleu ciel Paipers, au lieu du gris.
    light: "#FFFFFF",
    canvas: "linear-gradient(180deg, #F6F0F9 0%, #F1E9F5 100%)",
    alt: "linear-gradient(180deg, #EEF6FF 0%, #E6F0FC 100%)",
    // 18/10 (choix Vanessa) : vraies couleurs Paipers — prune (Personnel) et bleu marine (Pro).
    night: "#493653",
    marine: DESKTOP_SURFACES.marine,
    violet: "#3A2A44",
    white: "linear-gradient(180deg, #FFFFFF 0%, #FBF8FD 100%)",
  };
  const isDark = tone === "night" || tone === "marine" || tone === "violet";

  return (
    <section
      data-dark={isDark ? "1" : undefined}
      id={id}
      className={`px-5 md:px-8 py-16 md:py-24 ${className}`}
      style={{ background: bg[tone], color: isDark ? DESKTOP_SURFACES.onDark : undefined }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 1120 }}>
        {children}
      </div>
    </section>
  );
}
