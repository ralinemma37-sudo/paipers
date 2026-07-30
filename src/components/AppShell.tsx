"use client";

import type { ReactNode } from "react";
import DesktopSidebar from "@/components/DesktopSidebar";

type AppShellProps = {
  children: ReactNode;
};

/**
 * Shell responsive Paipers :
 * - Mobile : contenu plein écran (BottomNav reste géré par le layout)
 * - Desktop : sidebar + zone de contenu aérée
 */
export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen md:flex md:bg-gradient-to-br md:from-[hsl(202_100%_98%)] md:via-white md:to-[hsl(328_80%_98%)]">
      <DesktopSidebar />

      <div className="flex-1 min-w-0 md:min-h-screen">
        <div className="md:px-6 md:py-6 md:h-full">
          <div className="md:min-h-[calc(100vh-3rem)] md:rounded-[1.75rem] md:bg-white/80 md:border md:border-slate-100 md:shadow-[0_8px_30px_rgba(0,0,0,0.04)] md:backdrop-blur-sm md:overflow-hidden">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
