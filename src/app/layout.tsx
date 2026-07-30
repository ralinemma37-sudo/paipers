// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import AppProviders from "./Providers";
import BottomNavGate from "@/components/BottomNavGate";
import DesktopSidebarGate from "@/components/DesktopSidebarGate";
import SpaceSwitcherGate from "@/components/SpaceSwitcherGate";

export const metadata = {
  title: "Paipers",
  description: "Votre coffre-fort administratif intelligent",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppProviders>
          <div className="min-h-screen md:flex">
            <DesktopSidebarGate />
            <div className="flex-1 min-w-0 flex flex-col min-h-screen">
              <SpaceSwitcherGate />
              <main className="flex-1 pb-20 md:pb-0">{children}</main>
            </div>
            <BottomNavGate />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
