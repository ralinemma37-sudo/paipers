// src/app/layout.tsx
import "./globals.css";
import type { ReactNode } from "react";
import AppProviders from "./Providers";
import BottomNavGate from "@/components/BottomNavGate";

export const metadata = {
  title: "Paipers",
  description: "Votre coffre-fort administratif intelligent",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppProviders>
          <div className="min-h-screen">
            <main className="pb-20">{children}</main>
            <BottomNavGate />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}

