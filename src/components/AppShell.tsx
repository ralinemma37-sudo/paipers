"use client";

import type { ReactNode } from "react";
import { PAIPERS_RADIUS } from "@/lib/paipersTheme";

type AppShellProps = {
  children: ReactNode;
};

/**
 * Conteneur de contenu desktop (carte aérée).
 * La sidebar est gérée par le layout (DesktopSidebarGate) — comme les Tabs mobiles.
 */
export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="md:p-6 md:min-h-full">
      <div
        className="md:min-h-[calc(100vh-3rem)] md:overflow-auto md:border md:border-[color:var(--paipers-border)] md:bg-[color:var(--paipers-card)] md:shadow-[var(--paipers-shadow-card)]"
        style={{ borderRadius: PAIPERS_RADIUS.card }}
      >
        {children}
      </div>
    </div>
  );
}
