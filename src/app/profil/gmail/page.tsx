
"use client";

import Protected from "@/components/Protected";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export default function GmailPage() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      const user = data?.user;

      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email || "");

      // ✅ MVP: si tu as déjà une logique “gmail connecté” en DB, tu peux la brancher ici
      // Pour l’instant on met un placeholder "connected" à false.
      // Exemple futur: fetch profil/emails table etc.
      setConnected(false);

      setLoading(false);
    };

    run();
  }, []);

  return (
    <Protected>
      <div className="px-6 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/profil"
            className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center active:scale-95 transition"
            aria-label="Retour"
          >
            <ArrowLeft className="text-slate-700" size={18} />
          </Link>

          <div className="min-w-0">
            <p className="text-xs text-slate-500">Profil</p>
            <h1 className="text-xl font-bold truncate">Gmail</h1>
          </div>
        </div>

        <div className="card p-4">
          <div className="flex items-center gap-2 text-slate-700">
            <Mail size={18} />
            <p className="text-sm font-semibold">Connexion Gmail</p>
          </div>

          {loading ? (
            <p className="mt-3 text-sm text-slate-500">Chargement…</p>
          ) : (
            <>
              <p className="mt-3 text-sm text-slate-600">
                Compte : <span className="font-semibold">{email || "—"}</span>
              </p>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-800">
                  Statut :{" "}
                  <span className={connected ? "text-green-600" : "text-slate-500"}>
                    {connected ? "Connecté" : "Non connecté (placeholder)"}
                  </span>
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Cette page a été simplifiée pour corriger le build. On peut réactiver l’UI Gmail juste après.
                </p>
              </div>

              <Link
                href="/profil"
                className="mt-4 inline-block text-sm font-semibold text-[hsl(var(--primary))]"
              >
                Retour au profil →
              </Link>
            </>
          )}
        </div>
      </div>
    </Protected>
  );
}
