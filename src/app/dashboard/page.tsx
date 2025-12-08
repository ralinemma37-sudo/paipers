"use client";

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import { supabase } from "@/lib/supabase";

import {
  FileText,
  Folder,
  Wand2,
  Bell,
  ChevronRight,
} from "lucide-react";

export default function DashboardPage() {
  const [fullName, setFullName] = useState<string>("");
  const [docCount, setDocCount] = useState<number>(0);
  const [catCount, setCatCount] = useState<number>(0);
  const [aiCount, setAiCount] = useState<number>(0);

  // 🔔 Rappels (pour l’instant dummy → on pourra récupérer depuis Supabase plus tard)
  const reminders = [
    { title: "Fin de garantie MacBook", date: "Dans 3 jours" },
    { title: "Assurance Auto à renouveller", date: "Dans 10 jours" },
  ];

  useEffect(() => {
    const loadData = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      // Nom complet
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setFullName(profile?.full_name || "");

      // Documents
      const { count: docs } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setDocCount(docs || 0);

      // Catégories
      const { count: cats } = await supabase
        .from("categories")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setCatCount(cats || 0);

      // IA générés
      const { count: aiDocs } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("generated_by_ai", true);
      setAiCount(aiDocs || 0);
    };

    loadData();
  }, []);

  return (
    <Protected>
      <div className="px-6 py-8">

        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-1 text-[hsl(var(--foreground))]">
          Bonjour{" "}
          <span className="gradient-text">{fullName || ""}</span> 👋
        </h1>

        <p className="text-[hsl(var(--foreground)/0.6)] mb-6">
          Voici un aperçu de votre espace Paipers.
        </p>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <StatCard
            icon={<FileText className="text-[hsl(var(--primary))]" />}
            number={docCount}
            label="Documents"
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

        {/* 📅 RAPPELS À VENIR */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
              Rappels à venir
            </h2>
            <a
              href="#"
              className="text-[hsl(var(--primary))] text-sm font-medium"
            >
              Gérer
            </a>
          </div>

          <div className="flex flex-col gap-3">
            {reminders.map((item, index) => (
              <a key={index} href="#" className="card flex justify-between items-center py-3">
                <div>
                  <p className="font-medium text-[hsl(var(--foreground))]">
                    {item.title}
                  </p>
                  <p className="text-[hsl(var(--foreground)/0.6)] text-sm">
                    {item.date}
                  </p>
                </div>
                <ChevronRight className="text-[hsl(var(--foreground)/0.4)]" />
              </a>
            ))}
          </div>
        </section>

        {/* DOCUMENTS RÉCENTS */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
              Documents récents
            </h2>
            <a
              href="/documents"
              className="text-[hsl(var(--primary))] text-sm font-medium"
            >
              Voir tout
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <DocumentRow title="Facture EDF Janvier.pdf" date="Il y a 2 jours" />
            <DocumentRow title="Contrat de travail.pdf" date="Il y a 5 jours" />
            <DocumentRow title="Assurance Auto 2025.pdf" date="1 semaine" />
          </div>
        </section>

        {/* CATÉGORIES */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[hsl(var(--foreground))]">
              Catégories
            </h2>
            <a
              href="/documents/categories"
              className="text-[hsl(var(--primary))] text-sm font-medium"
            >
              Gérer
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <CategoryCard name="Factures" count={5} color="bg-orange-400" />
            <CategoryCard name="Banque" count={3} color="bg-blue-400" />
            <CategoryCard name="Travail" count={6} color="bg-pink-400" />
            <CategoryCard name="Autres" count={10} color="bg-slate-400" />
          </div>
        </section>

      </div>
    </Protected>
  );
}

/* ---------------------------------------------------------
   COMPONENTS
--------------------------------------------------------- */

function StatCard({ icon, number, label }: any) {
  return (
    <div className="card flex flex-col items-start">
      <div className="text-2xl mb-2">{icon}</div>
      <p className="text-xl font-bold text-[hsl(var(--foreground))]">{number}</p>
      <p className="text-[hsl(var(--foreground)/0.6)] text-sm">{label}</p>
    </div>
  );
}

function DocumentRow({ title, date }: any) {
  return (
    <a href="#" className="card flex items-center justify-between py-3">
      <div>
        <p className="font-medium text-[hsl(var(--foreground))]">{title}</p>
        <p className="text-[hsl(var(--foreground)/0.6)] text-sm">{date}</p>
      </div>
      <ChevronRight className="text-[hsl(var(--foreground)/0.4)]" />
    </a>
  );
}

function CategoryCard({ name, count, color }: any) {
  return (
    <a className="card flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-white`}
      >
        <Folder size={20} />
      </div>
      <div>
        <p className="font-medium text-[hsl(var(--foreground))]">{name}</p>
        <p className="text-[hsl(var(--foreground)/0.6)] text-sm">
          {count} documents
        </p>
      </div>
    </a>
  );
}
