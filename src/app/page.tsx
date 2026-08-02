import type { Metadata } from "next";
import LandingPage from "@/components/landing/LandingPage";

/**
 * Accueil public — pré-lancement / waitlist.
 * Pas d’AppShell / BottomNav (gérés par les Gates du layout).
 */

export const metadata: Metadata = {
  title: "Paipers - Le copilote administratif intelligent arrive bientôt",
  description:
    "Rejoignez la liste d’attente de Paipers et soyez parmi les premiers à découvrir votre futur copilote administratif intelligent.",
};

export default function HomePage() {
  return <LandingPage />;
}
