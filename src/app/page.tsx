import LandingPage from "@/components/landing/LandingPage";

/**
 * Accueil public — accessible sans authentification.
 * Pas d’AppShell / BottomNav (gérés par les Gates du layout).
 */
export default function HomePage() {
  return <LandingPage />;
}
