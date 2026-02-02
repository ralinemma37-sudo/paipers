"use client";

import { useEffect } from "react";

export default function ThemeInit() {
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme"); // "light" | "dark"
      const prefersDark =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

      const dark = stored ? stored === "dark" : prefersDark;

      document.documentElement.classList.toggle("dark", dark);
    } catch {
      // ignore
    }
  }, []);

  return null;
}
