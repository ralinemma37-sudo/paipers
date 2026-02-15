"use client";

import Protected from "@/components/Protected";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

type GmailConnection = {
  email: string | null;
};

export default function GmailPage() {
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [connEmail, setConnEmail] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");

    const { data, error: userErr } = await supabase.auth.getUser();
    if (userErr) setError(userErr.message);

    const user = data?.user;
    if (!user) {
      setUserId("");
      setUserEmail("");
      setConnected(false);
      setConnEmail("");
      setLoading(false);
      return;
    }

    setUserId(user.id);
    setUserEmail(user.email || "");

    const { data: conn, error: connErr } = await supabase
      .from("gmail_connections")
      .select("email")
      .eq("user_id", user.id)
      .maybeSingle<GmailConnection>();

    if (connErr) {
      setError(connErr.message);
      setConnected(false);
      setConnEmail("");
    } else {
      setConnected(!!conn);
      setConnEmail(conn?.email ?? "");
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectUrl = userId
    ? `/auth/gmail?platform=web&user_id=${encodeURIComponent(userId)}`
    : "";

  const disconnect = async () => {
    if (!userId) return;
    setError("");

    const { error } = await supabase.from("gmail_connections").delete().eq("user_id", userId);
    if (error) {
      setError(error.message);
      return;
    }
    await load();
  };

  return (
    <Protected>
      <div className="px-6 pt-6 pb-24">
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/profil/emails"
            className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center active:scale-95 transition"
            aria-label="Retour"
          >
            <ArrowLeft className="text-slate-700" size={18} />
          </Link>

          <div className="min-w-0">
            <p className="text-xs text-slate-500">Connexions emails</p>
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
                Compte Paipers : <span className="font-semibold">{userEmail || "—"}</span>
              </p>

              {/* DEBUG VISUEL (temporaire) */}
              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">
                  Debug userId : <span className="font-mono text-slate-700">{userId || "VIDE"}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Debug URL :{" "}
                  <span className="font-mono text-slate-700 break-all">
                    {connectUrl || "VIDE (userId manquant)"}
                  </span>
                </p>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-medium text-slate-800">
                  Statut :{" "}
                  <span className={connected ? "text-green-600" : "text-slate-500"}>
                    {connected ? "Connecté" : "Non connecté"}
                  </span>
                </p>

                {connected && (
                  <p className="mt-2 text-xs text-slate-500">
                    Gmail : <span className="font-semibold">{connEmail || "—"}</span>
                  </p>
                )}
              </div>

              {error ? <p className="mt-3 text-sm text-red-600">Erreur : {error}</p> : null}

              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={load}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold active:scale-[0.99] transition"
                >
                  Rafraîchir
                </button>

                {connected ? (
                  <button
                    type="button"
                    onClick={disconnect}
                    className="px-4 py-2 rounded-xl bg-red-100 text-red-700 text-sm font-semibold active:scale-[0.99] transition"
                  >
                    Déconnecter
                  </button>
                ) : (
                  <a
                    href={connectUrl || "#"}
                    onClick={(e) => {
                      if (!connectUrl) e.preventDefault();
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold active:scale-[0.99] transition ${
                      connectUrl
                        ? "bg-[hsl(var(--primary))] text-white"
                        : "bg-slate-200 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    Connecter Gmail
                  </a>
                )}
              </div>

              <Link
                href="/profil/emails"
                className="mt-5 inline-block text-sm font-semibold text-[hsl(var(--primary))]"
              >
                Retour →
              </Link>
            </>
          )}
        </div>
      </div>
    </Protected>
  );
}
