import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

/**
 * Accueil public — vitrine + création de compte (appli sous /app).
 * Pas d’AppShell / BottomNav (gérés par les Gates du layout).
 */

export const metadata: Metadata = {
  title: "Paipers — Ton assistant administratif",
  description:
    "Paipers range tes papiers, trie tes mails et veille sur ton budget. Crée ton compte : 7 jours d’essai gratuit.",
};

export default function HomePage() {
  return <LandingPage />;
}
