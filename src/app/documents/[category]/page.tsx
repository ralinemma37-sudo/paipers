"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FileText, ChevronRight } from "lucide-react";

function normCat(cat: string | null) {
  const c = (cat || "autres").toLowerCase().trim();
  if (c === "non classé" || c === "non classe" || c === "non_classe") return "autres";
  if (c === "facture") return "factures";
  if (c === "contrat") return "contrats";
  if (c === "assurance") return "assurances";
  return c;
}

function labelCat(cat: string) {
  const map: Record<string, string> = {
    factures: "Factures",
    contrats: "Contrats",
    travail: "Travail",
    banque: "Banque",
    assurances: "Assurances",
    autres: "Autres",
  };
  return map[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
}

type Doc = {
  id: string;
  title: string | null;
  original_filename: string | null;
  category: string | null;
  created_at: string;
};

export default function CategoryPage() {
  const params = useParams() as { category: string };
  const categoryParam = useMemo(
    () => (params.category || "autres").toLowerCase(),
    [params.category]
  );

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) return;

      const { data } = await supabase
        .from("documents")
        .select("id,title,original_filename,category,created_at")
        .eq("user_id", user.id)
        .eq("is_ready", true)
        .order("created_at", { ascending: false });

      const all = (data || []) as Doc[];
      const filtered = all.filter((d) => normCat(d.category) === categoryParam);

      setDocs(filtered);
      setLoading(false);
    };

    load();
  }, [categoryParam]);

  if (loading) {
    return <div className="p-6 text-slate-500">Chargement...</div>;
  }

  return (
    <div className="px-6 py-8 pb-24">
      <a href="/documents" className="text-slate-500 text-sm mb-4 inline-block">
        ← Retour
      </a>

      <h1 className="text-3xl font-bold mb-4">{labelCat(categoryParam)}</h1>

      {docs.length === 0 && (
        <p className="text-slate-500">Aucun document dans cette catégorie.</p>
      )}

      <div className="flex flex-col gap-3 mt-4">
        {docs.map((doc) => (
          <a
            key={doc.id}
            href={`/documents/view?id=${doc.id}`}
            className="card flex items-center justify-between py-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--muted))] flex items-center justify-center">
                <FileText className="text-[hsl(var(--primary))]" />
              </div>

              <div>
                <p className="font-medium">{doc.title || "Document"}</p>
                <p className="text-slate-500 text-sm">
                  {new Date(doc.created_at).toLocaleDateString()}
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
