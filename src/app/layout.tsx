// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import AppProviders from "./Providers";
import BottomNavGate from "@/components/BottomNavGate";
import DesktopChromeGate from "@/components/DesktopChromeGate";
import SpaceSwitcherGate from "@/components/SpaceSwitcherGate";

export const metadata = {
  title: "Paipers",
  description: "Ton administratif, enfin sous contrôle.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="overflow-x-hidden">
        <AppProviders>
          <div className="min-h-screen flex flex-col">
            <SpaceSwitcherGate />
            <main className="flex-1 pb-20 md:pb-0 min-w-0 overflow-x-hidden">
              <DesktopChromeGate>{children}</DesktopChromeGate>
            </main>
            <BottomNavGate />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
