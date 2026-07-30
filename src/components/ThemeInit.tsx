"use client";

import { useEffect } from "react";

/**
 * Applique le thème stocké.
 * Défaut produit = clair (fonds blancs).
 * Ne suit PAS prefers-color-scheme : l’auto-activation OS appliquait .dark
 * (fonds #0B1220 / cartes #1A2332) et donnait l’illusion d’un UI tout bleu marine.
 * Le mode sombre ne s’active que si l’utilisateur a choisi « dark » dans Paramètres.
 */
export default function ThemeInit() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme");
      // Si une session précédente a forcé dark via OS sans choix explicite durable,
      // on ne garde dark que pour la valeur exacte "dark".
      const dark = stored === "dark";
      document.documentElement.classList.toggle("dark", dark);
      if (stored !== "light" && stored !== "dark") {
        localStorage.setItem("theme", "light");
      }
    } catch {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return null;
}
