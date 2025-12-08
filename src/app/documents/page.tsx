"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { importAndClassify } from "@/lib/importAndClassify";

import {
  Search,
  Plus,
  Folder,
  Camera,
  ChevronRight
} from "lucide-react";

export default function DocumentsPage() {
  const [user, setUser] = useState<any>(null);
  const [categories, setCategories] = useState<any>({});

  // Charger utilisateur
  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) setUser(data.user);
    };
    loadUser();
  }, []);

  // Charger documents regroupés par catégorie
  useEffect(() => {
    if (!user) return;

    const loadDocs = async () => {
      const { data: docs } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!docs) return;

      const groups: any = {};

      docs.forEach((doc) => {
        const cat = (doc.category || "autres").toLowerCase();

        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(doc);
      });

      setCategories(groups);
    };

    loadDocs();
  }, [user]);

  // Importer document avec IA
  const handleImport = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    await importAndClassify(file, user.id);
    window.location.reload();
  };

  // Scanner document
  const handleScan = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.onchange = handleImport;
    input.click();
  };

  return (
    <div className="px-6 py-8">

      {/* TITRE */}
      <h1 className="text-3xl font-bold mb-1">Mes documents</h1>
      <p className="text-slate-500 mb-6">Organisés automatiquement ⭐</p>

      {/* RECHERCHE */}
      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un document..."
          className="w-full pl-12 pr-4 py-3 rounded-full bg-[hsl(0_0%_96%)] border border-slate-200 text-sm outline-none"
        />
      </div>

      {/* IMPORT + SCAN */}
      <div className="flex gap-3 mb-6">

        <button className="flex-1 rounded-full bg-white border border-slate-200 px-4 py-3 text-sm">
          Toutes catégories
        </button>

        <label className="btn-gradient flex items-center gap-2 px-5 py-3 rounded-full cursor-pointer">
          <Plus size={20} />
          Importer
          <input type="file" className="hidden" onChange={handleImport} />
        </label>

        <button
          onClick={handleScan}
          className="bg-[hsl(var(--muted))] px-4 py-3 rounded-full border border-slate-300 flex items-center justify-center"
        >
          <Camera size={20} className="text-[hsl(var(--primary))]" />
        </button>
      </div>

      {/* CATÉGORIES */}
      <h2 className="text-xl font-bold mb-4">Mes catégories</h2>

      <div className="flex flex-col gap-4">
        {Object.keys(categories).length === 0 && (
          <p className="text-slate-400 text-sm">
            Aucun document pour le moment 😌 Importez-en un !
          </p>
        )}

        {Object.entries(categories).map(([name, docs]: any) => (
          <CategoryCard
            key={name}
            name={name}
            count={docs.length}
            color="bg-[hsl(var(--primary))]"
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- */

function CategoryCard({ name, count, color }: any) {
  return (
    <a
      href={`/documents/${name.toLowerCase()}`}
      className="card flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}
        >
          <Folder className="text-white" size={24} />
        </div>

        <div>
          <p className="font-semibold text-lg capitalize">{name}</p>
          <p className="text-slate-500 text-sm">{count} documents</p>
        </div>
      </div>

      <ChevronRight className="text-slate-400" />
    </a>
  );
}
