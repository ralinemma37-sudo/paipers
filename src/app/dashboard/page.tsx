"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { supabase } from "@/lib/supabase";
import { FileText, Folder, Wand2, Bell, ChevronRight } from "lucide-react";

type PendingDoc = {
  id: string;
  title: string | null;
  original_filename: string | null;
  created_at: string;
};

type Reminder = {
  id: string;
  title: string;
  due_date: string; // on stocke une date en texte (format ISO), ex: "2026-01-20"
};

function formatDateFr(dateStr: string) {
  // Affiche une date simple : 20/01/2026
  // (sans dépendances compliquées)
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function DashboardPage() {
  const [fullName, setFullName] = useState("");

  // Documents rangés
  const [docCount, setDocCount] = useState(0);

  // Documents en attente (notifications Gmail)
  const [pendingCount, setPendingCount] = useState(0);

  const [catCount, setCatCount] = useState(0);
  const [aiCount, setAiCount] = useState(0);

  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [uiError, setUiError] = useState<string>("");

  // ✅ Rappels réels (plus d’exemples)
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [reminderError, setReminderError] = useState<string>("");

  useEffect(() => {
    const loadAll = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      // 👤 Profil
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", auth.user.id)
        .single();
      setFullName(profile?.full_name || "");

      // 📄 Documents rangés (visibles dans /documents)
      const { count: readyDocs } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", auth.user.id)
        .eq("is_ready", true);
      setDocCount(readyDocs || 0);

      // 🔔 Documents en attente (notifications Gmail)
      const { count: pendingDocsCount } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", auth.user.id)
        .eq("needs_review", true);
      setPendingCount(pendingDocsCount || 0);

      // 📁 Catégories
      const { count: cats } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", auth.user.id);
      setCatCount(cats || 0);

      // 🤖 Docs générés par IA
      const { count: aiDocs } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", auth.user.id)
        .eq("generated_by_ai", true);
      setAiCount(aiDocs || 0);

      // 🔔 Liste des documents en attente (pour la notif principale)
      const { data: pending } = await supabase
        .from("documents")
        .select("id,title,original_filename,created_at")
        .eq("user_id", auth.user.id)
        .eq("needs_review", true)
        .order("created_at", { ascending: false });

      setPendingDocs(pending || []);
      setLoadingPending(false);

      // ⏰ Rappels réels
      // Important : si la table "reminders" n’existe pas encore, ça donnera une erreur.
      // Dans ce cas, on affiche 0 et un petit message, sans casser la page.
      setReminderError("");
      setLoadingReminders(true);

      const { data: rems, error: remErr } = await supabase
        .from("reminders")
        .select("id,title,due_date")
        .eq("user_id", auth.user.id)
        .order("due_date", { ascending: true });

      if (remErr) {
        // On ne casse pas l’accueil : on affiche juste 0 rappel
        setReminders([]);
        setReminderError(
          "Les rappels ne sont pas encore configurés (on le fait à la prochaine étape)."
        );
      } else {
        setReminders((rems as Reminder[]) || []);
      }

      setLoadingReminders(false);
    };

    loadAll();
  }, []);

  async function handleAccept(docId: string) {
    setUiError("");
    setActionLoading(docId);

    try {
      const res = await fetch("/api/gmail/download-attachment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUiError(data?.error ? `Erreur : ${data.error}` : "Erreur inconnue.");
        setActionLoading(null);
        return;
      }

      window.location.href = "/documents";
    } catch (e: any) {
      setUiError(`Erreur réseau : ${e?.message ?? "inconnue"}`);
      setActionLoading(null);
    }
  }

  async function handleIgnore(docId: string) {
    setUiError("");
    setActionLoading(docId);

    const { error } = await supabase
      .from("documents")
      .update({ needs_review: false })
      .eq("id", docId);

    if (error) {
      setUiError(`Erreur : ${error.message}`);
      setActionLoading(null);
      return;
    }

    window.location.reload();
  }

  // Petit affichage : on montre max 3 rappels sur l’accueil
  const remindersPreview = reminders.slice(0, 3);

  return (
    <Protected>
      <div className="px-6 py-8 pb-24">
        <h1 className="text-3xl font-bold mb-1">
          Bonjour <span className="gradient-text">{fullName}</span> 👋
        </h1>
        <p className="text-slate-500 mb-6">
          Voici un aperçu de votre espace Paipers.
        </p>

        {/* 🔔 NOTIFICATIONS GMAIL */}
        <section className="mb-8">
          {uiError && (
            <div className="card p-4 mb-3 border border-red-200 bg-red-50 text-red-700">
              {uiError}
            </div>
          )}

          <h2 className="text-xl font-semibold flex items-center gap-2 mb-3">
            <Bell size={20} /> Notifications
          </h2>

          {loadingPending ? (
            <div className="card p-4 text-slate-500">Chargement…</div>
          ) : pendingDocs.length === 0 ? (
            <div className="card p-4 text-slate-500">
              Aucun document Gmail en attente.
            </div>
          ) : (
            <div className="card p-4">
              <p className="font-semibold">Nouveau document reçu depuis Gmail</p>
              <p className="text-sm text-slate-500 mt-1">
                Souhaitez-vous l’ajouter à vos documents ?
              </p>

              <div className="mt-4">
                {pendingDocs.slice(0, 1).map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="text-sm">
                      <p className="font-medium">
                        {doc.original_filename || doc.title || "Pièce jointe"}
                      </p>
                      <p className="text-slate-500">
                        Elle sera mise dans “Autres”.
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleIgnore(doc.id)}
                        disabled={actionLoading === doc.id}
                        className="px-4 py-2 rounded-full border border-slate-200 bg-white text-sm font-medium"
                      >
                        Non
                      </button>

                      <button
                        onClick={() => handleAccept(doc.id)}
                        disabled={actionLoading === doc.id}
                        className="px-4 py-2 rounded-full text-white text-sm font-medium
                          bg-gradient-to-r from-[hsl(202_100%_82%)]
                          via-[hsl(328_80%_84%)]
                          to-[hsl(39_100%_85%)]
                          shadow-md"
                      >
                        {actionLoading === doc.id ? "Ajout…" : "Oui"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {pendingDocs.length > 1 && (
                <p className="text-xs text-slate-500 mt-3">
                  {pendingDocs.length - 1} autre(s) document(s) en attente
                </p>
              )}
            </div>
          )}
        </section>

        {/* 📊 STATS */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard
            icon={<FileText className="text-[hsl(var(--primary))]" />}
            number={docCount}
            label="Documents"
            sublabel={pendingCount > 0 ? `${pendingCount} en attente` : ""}
          />
          <StatCard
            icon={<Folder className="text-[hsl(var(--primary))]" />}
            number={catCount}
            label="Catégories"
          />
          <StatCard
            icon={<Wand2 className="text-[hsl(var(--primary))]" />}
            number={aiCount}
            label="IA générés"
          />
          <StatCard
            icon={<Bell className="text-[hsl(var(--primary))]" />}
            number={reminders.length}
            label="Rappels"
          />
        </div>

        {/* ⏰ RAPPELS (réels) */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Rappels à venir</h2>

          {loadingReminders ? (
            <div className="card p-4 text-slate-500">Chargement…</div>
          ) : reminders.length === 0 ? (
            <div className="card p-4 text-slate-500">
              Aucun rappel pour le moment.
              {reminderError ? (
                <div className="text-xs text-slate-400 mt-2">{reminderError}</div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {remindersPreview.map((item) => (
                <div
                  key={item.id}
                  className="card flex justify-between items-center py-3"
                >
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-slate-500 text-sm">
                      Date : {formatDateFr(item.due_date)}
                    </p>
                  </div>
                  <ChevronRight className="text-slate-400" />
                </div>
              ))}

              {reminders.length > 3 && (
                <p className="text-xs text-slate-500">
                  + {reminders.length - 3} autre(s) rappel(s)
                </p>
              )}
            </div>
          )}
        </section>
      </div>
    </Protected>
  );
}

function StatCard({ icon, number, label, sublabel }: any) {
  return (
    <div className="card flex flex-col items-start">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xl font-bold">{number}</p>
      <p className="text-slate-500 text-sm">{label}</p>
      {sublabel && <p className="text-xs text-slate-400 mt-1">{sublabel}</p>}
    </div>
  );
}
