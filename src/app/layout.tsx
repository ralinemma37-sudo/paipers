import "./globals.css";
import AppProviders from "./Providers";
import BottomNav from "@/components/BottomNav";

export const metadata = {
  title: "Paipers",
  description: "Assistant administratif personnel",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
        <AppProviders>
          <main className="flex-1 pb-28">{children}</main>
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
