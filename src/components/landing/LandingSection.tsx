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
    light: "#FFFFFF",
    canvas: DESKTOP_SURFACES.canvas,
    alt: DESKTOP_SURFACES.canvasAlt,
    night: DESKTOP_SURFACES.night,
    marine: DESKTOP_SURFACES.marine,
    violet: DESKTOP_SURFACES.violetDeep,
    white: "#FFFFFF",
  };
  const isDark = tone === "night" || tone === "marine" || tone === "violet";

  return (
    <section
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
