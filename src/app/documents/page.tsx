"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Search, FileText, ChevronRight } from "lucide-react";

type Doc = {
  id: string;
  title: string | null;
  category: string | null;
  created_at: string;
  file_path: string;
};

function normCat(cat: string | null) {
  const c = (cat || "autres").toLowerCase().trim();
  if (c === "non classé" || c === "non classe" || c === "non_classe") return "autres";
  return c;
}

function labelCat(cat: string) {
  const map: Record<string, string> = {
    factures: "Factures",
    facture: "Factures",
    contrats: "Contrats",
    contrat: "Contrats",
    travail: "Travail",
    banque: "Banque",
    assurances: "Assurances",
    assurance: "Assurances",
    autres: "Autres",
  };
  return map[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

function catColorClass(cat: string) {
  const c = normCat(cat);
  if (c === "factures") return "bg-orange-400";
  if (c === "banque") return "bg-blue-400";
  if (c === "travail") return "bg-pink-400";
  if (c === "contrats") return "bg-purple-400";
  if (c === "assurances") return "bg-emerald-400";
  return "bg-slate-400";
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadDocs = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      const { data } = await supabase
        .from("documents")
        .select("id,title,category,created_at,file_path")
        .eq("user_id", auth.user.id)
        .eq("is_ready", true)
        .order("created_at", { ascending: false });

      setDocs(data || []);
      setLoading(false);
    };

    loadDocs();
  }, []);

  const groups = useMemo(() => {
    const g: Record<string, Doc[]> = {};
    docs.forEach((d) => {
      const cat = normCat(d.category);
      if (!g[cat]) g[cat] = [];
      g[cat].push(d);
    });
    return g;
  }, [docs]);

  const categoryList = useMemo(() => {
    const cats = Object.keys(groups);
    cats.sort((a, b) => {
      if (a === "autres") return 1;
      if (b === "autres") return -1;
      return a.localeCompare(b);
    });
    return cats;
  }, [groups]);

  const filteredCategoryList = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return categoryList;

    return categoryList.filter((cat) => {
      const docsInCat = groups[cat] || [];
      return docsInCat.some((d) => (d.title || "").toLowerCase().includes(q));
    });
  }, [search, categoryList, groups]);

  return (
    <div className="px-6 py-8 pb-24">
      <h1 className="text-3xl font-bold mb-1">Documents</h1>
      <p className="text-slate-500 mb-6">Retrouvez vos documents par catégorie ✨</p>

      {/* ✅ Recherche (nouvelle version : FLEX, plus de chevauchement possible) */}
      <div className="mb-6">
        <div className="flex items-center gap-3 w-full rounded-full bg-[hsl(0_0%_96%)] border border-slate-200 px-4 py-3">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher un document…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Mes catégories</h2>

      {loading && <p className="text-slate-400">Chargement…</p>}

      {!loading && filteredCategoryList.length === 0 && (
        <p className="text-slate-400">Aucun résultat.</p>
      )}

      <div className="flex flex-col gap-4">
        {filteredCategoryList.map((cat) => (
          <a
            key={cat}
            href={`/documents/${cat}`}
            className="card flex items-center justify-between py-4"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-2xl ${catColorClass(
                  cat
                )} flex items-center justify-center text-white`}
              >
                <FileText size={22} />
              </div>

              <div>
                <p className="font-semibold text-lg">{labelCat(cat)}</p>
                <p className="text-slate-500 text-sm">
                  {groups[cat]?.length || 0} document(s)
                </p>
              </div>
            </div>

            <ChevronRight className="text-slate-400" />
          </a>
        ))}
      </div>
    </div>
  );
}
