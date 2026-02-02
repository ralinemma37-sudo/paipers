"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";

export default function ParametresPage() {
  const [dark, setDark] = useState(false);

  /* Charger thème au chargement */
  useEffect(() => {
    const savedTheme = localStorage.getItem("paipers-theme");
    setDark(savedTheme === "dark");

    if (savedTheme === "dark") {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
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

  return (
    <div className="px-6 py-6 pb-24">
      {/* Header avec flèche */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/profil"
          className="p-2 rounded-full active:scale-95 transition"
          aria-label="Retour au profil"
        >
          <ArrowLeft size={22} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Paramètres</h1>
          <p className="text-[hsl(var(--foreground)/0.6)] text-sm">
            Personnalisez votre expérience Paipers
          </p>
        </div>
      </div>

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
      {/* 🌎 LANGUE */}
      {/* ----------------------------- */}
      <div className="card mb-6">
        <p className="font-medium text-[hsl(var(--foreground))] mb-2">
          Langue
        </p>

        <div className="flex items-center gap-3">
          <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-[hsl(var(--primary))] text-white">
            Français
          </span>

          <span className="text-sm text-[hsl(var(--foreground)/0.55)]">
            Anglais en préparation
          </span>
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
