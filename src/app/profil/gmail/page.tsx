"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from "react";

export default function GmailPage() {
  const { data: session, status } = useSession();
  const [watchActivated, setWatchActivated] = useState(false);

  const isLoading = status === "loading";
  const isConnected = !!session?.accessToken;

  async function activateWatch() {
    const res = await fetch("/api/google/activate-watch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: session?.accessToken,
      }),
    });

    const data = await res.json();

    if (data.success) {
      alert("Watch Gmail activé !");
      setWatchActivated(true);
    } else {
      console.error(data.error);
      alert("Erreur activation watch Gmail");
    }
  }

  return (
    <div className="px-6 pt-14 pb-24 space-y-6">
      <h1 className="text-2xl font-bold text-main">Connexion Gmail</h1>
      <p className="text-muted text-sm">
        Connectez Gmail pour permettre à Paipers de détecter automatiquement les documents reçus.
      </p>

      {isLoading && <p className="text-muted">Chargement...</p>}

      {!isConnected && !isLoading && (
        <button
          onClick={() => signIn("google")}
          className="w-full py-3 rounded-full bg-[hsl(var(--primary))] text-white font-medium"
        >
          Connecter mon compte Gmail
        </button>
      )}

      {isConnected && (
        <>
          <div className="card p-4">
            <p className="text-sm text-muted">Compte Gmail connecté</p>
            <p className="font-medium text-main">{session.user.googleEmail}</p>
          </div>

          <button
            onClick={activateWatch}
            className="w-full py-3 rounded-full bg-green-500 text-white font-medium"
          >
            Activer le WATCH Gmail
          </button>

          <button
            onClick={() => signOut()}
            className="w-full py-3 rounded-full border border-[hsl(var(--border))] text-main font-medium"
          >
            Déconnecter Gmail
          </button>
        </>
      )}
    </div>
  );
}
