"use client";

import Link from "next/link";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl font-bold mb-4">Créer un compte</h1>
      <p className="text-sm text-slate-600 mb-6 text-center max-w-xs">
        Le formulaire d'inscription complet sera bientôt disponible.
      </p>
      <Link
        href="/"
        className="px-4 py-2 rounded-full bg-black text-white text-sm font-medium"
      >
        Retour à l’accueil
      </Link>
    </main>
  );
}
