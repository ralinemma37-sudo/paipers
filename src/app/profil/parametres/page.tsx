"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function ParametresPage() {
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState("fr");

  /* Charger thème + langue au chargement */
  useEffect(() => {
    const savedTheme = localStorage.getItem("paipers-theme");
    const savedLang = localStorage.getItem("paipers-lang");

    setDark(savedTheme === "dark");
    setLang(savedLang || "fr");
  }, []);

  /* Basculer thème */
  const toggleTheme = () => {
    const newTheme = !dark ? "dark" : "light";
    setDark(!dark);

    localStorage.setItem("paipers-theme", newTheme);

    if (newTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  };

  /* Changer langue */
  const changeLang = (l: string) => {
    setLang(l);
    localStorage.setItem("paipers-lang", l);
  };

  return (
    <div className="px-6 pt-10 pb-24">

      {/* RETOUR */}
      <Link href="/profil" className="text-[hsl(var(--primary))] block mb-6">
        ← Retour
      </Link>

      <h1 className="text-3xl font-bold mb-2">Paramètres généraux</h1>
      <p className="text-[hsl(var(--foreground)/0.6)] mb-8">
        Personnalisez votre expérience Paipers ✨
      </p>

      {/* ----------------------------- */}
      {/* 🌙 THÈME SOMBRE */}
      {/* ----------------------------- */}
      <div className="card flex items-center justify-between mb-6">
        <span className="font-medium text-[hsl(var(--foreground))]">
          Mode sombre
        </span>

        {/* Switch iOS */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={dark}
            onChange={toggleTheme}
          />
          <div className="w-11 h-6 bg-gray-300 rounded-full peer transition peer-checked:bg-[hsl(var(--primary))] dark:bg-gray-700"></div>
          <span className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition peer-checked:translate-x-5"></span>
        </label>
      </div>

      {/* ----------------------------- */}
      {/* 🌎 LANGUE - Version petite */}
      {/* ----------------------------- */}
      <div className="card mb-6">
        <p className="font-medium text-[hsl(var(--foreground))] mb-4">
          Langue
        </p>

        <div className="flex gap-3">

          {/* FR */}
          <button
            onClick={() => changeLang("fr")}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium transition
              ${lang === "fr"
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"}
            `}
          >
            Français
          </button>

          {/* EN */}
          <button
            onClick={() => changeLang("en")}
            className={`
              px-4 py-1.5 rounded-full text-sm font-medium transition
              ${lang === "en"
                ? "bg-[hsl(var(--primary))] text-white"
                : "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]"}
            `}
          >
            English
          </button>

        </div>
      </div>

      {/* ----------------------------- */}
      {/* 🔔 NOTIFICATIONS */}
      {/* ----------------------------- */}
      <div className="card flex items-center justify-between">
        <span className="font-medium text-[hsl(var(--foreground))]">
          Notifications
        </span>
        <span className="text-[hsl(var(--foreground)/0.5)]">Bientôt</span>
      </div>

    </div>
  );
}
