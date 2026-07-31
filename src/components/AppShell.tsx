"use client";

import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  /** Largeur max du contenu (défaut produit web). */
  maxWidth?: number;
};

/**
 * Conteneur de contenu connecté — canvas desktop SaaS.
 */
export default function AppShell({ children, maxWidth = 1200 }: AppShellProps) {
  return (
    <div className="w-full md:px-6 md:py-5 md:min-h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full min-w-0 paipers-fade-in" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}
