"use client";

export default function GmailOpenPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status ?? "connected";

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="card p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold">Gmail</h1>

        <p className="mt-3 text-slate-600">
          {status === "connected"
            ? "✅ Gmail est connecté. Tu peux revenir dans l’app Paipers."
            : "❌ Erreur pendant la connexion. Retourne dans l’app et réessaie."}
        </p>

        <p className="mt-4 text-sm text-slate-500">
          Sur iPhone : appuie sur <b>Terminé</b> (en haut) pour fermer cette page,
          puis reviens dans l’app.
        </p>
      </div>
    </main>
  );
}
