"use client";

import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    // Lire le thème sauvegardé
    const saved = localStorage.getItem("paipers-theme");

    if (saved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return null;
}
