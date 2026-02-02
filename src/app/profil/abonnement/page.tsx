"use client";

import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";

export default function AbonnementPage() {
  return (
    <div className="px-6 py-6 pb-24">
      {/* Header avec flèche */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href="/profil"
          className="p-2 rounded-full active:scale-95 transition"
          aria-label="Retour au profil"
        >
          <ArrowLeft size={22} />
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Abonnement</h1>
          <p className="text-[hsl(var(--foreground)/0.6)] text-sm">
            Choisissez l’offre qui vous convient 🌸
          </p>
        </div>
      </div>

      {/* ⬅️⬅️ CONTAINER → même hauteur grâce à items-stretch */}
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-6">
        {/* PACK GRATUIT */}
        <div className="card p-6 w-full max-w-sm border-2 border-[hsl(var(--primary))] flex flex-col text-center">
          <h2 className="text-2xl font-bold mb-1">Gratuit</h2>
          <p className="text-[hsl(var(--foreground)/0.6)] mb-6">
            Parfait pour débuter ✨
          </p>

          <ul className="space-y-3 mb-8 text-left mx-auto w-fit">
            <Feature>100% des fonctionnalités</Feature>
            <Feature>IA incluse</Feature>
            <Feature>Renommage intelligent</Feature>
            <Feature>Catégorisation automatique</Feature>
            <Feature>Documents illimités</Feature>
            <Feature>Import automatique Gmail</Feature>
            <Feature>Publicités présentes</Feature>
          </ul>

          <div className="mt-auto">
            <button
              disabled
              className="
                w-full py-3 rounded-full 
                bg-gray-200 dark:bg-gray-700
                text-gray-500 font-semibold cursor-not-allowed
              "
            >
              Offre actuelle
            </button>
          </div>
        </div>

        {/* PACK PREMIUM */}
        <div className="card p-6 w-full max-w-sm border-2 border-[hsl(var(--secondary))] flex flex-col text-center">
          <h2 className="text-2xl font-bold mb-1">Premium</h2>
          <p className="text-[hsl(var(--foreground)/0.6)] mb-6">
            Pour une expérience optimale 💎
          </p>

          <ul className="space-y-3 mb-8 text-left mx-auto w-fit">
            <Feature>Sans publicité</Feature>
            <Feature>Stockage augmenté</Feature>
            <Feature>Analyse avancée des factures</Feature>
            <Feature>Priorité serveur IA</Feature>
            <Feature>Support premium</Feature>
          </ul>

          <div className="mt-auto">
            <button
              className="
                w-full py-3 rounded-full font-semibold text-white
                bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--secondary))] to-[hsl(var(--accent))]
                shadow-md active:scale-95 transition
              "
            >
              S’inscrire au Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({ children }: any) {
  return (
    <li className="flex items-center gap-2 text-[hsl(var(--foreground))]">
      <Check size={18} className="text-[hsl(var(--primary))]" />
      <span>{children}</span>
    </li>
  );
}
