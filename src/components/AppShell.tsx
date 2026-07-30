"use client";

import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  /** Largeur max du contenu (défaut produit web). */
  maxWidth?: number;
};

/**
 * Conteneur de contenu connecté.
 * Desktop : largeur utile (jusqu’à ~1280px), sans carte géante vide.
 * Mobile : plein écran, BottomNav gérée par le layout.
 */
export default function AppShell({ children, maxWidth = 1280 }: AppShellProps) {
  return (
    <div className="w-full md:px-8 md:py-6 md:min-h-[calc(100vh-4rem)]">
      <div
        className="mx-auto w-full min-w-0"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
}
