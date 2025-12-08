"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function CategoryPage() {
  const params = useParams() as { category: string };
  const categoryParam = params.category.toLowerCase();

  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDocs = async () => {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      if (!user) return;

      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("user_id", user.id)
        .eq("category", categoryParam);

      setDocs(data || []);
      setLoading(false);
    };

    loadDocs();
  }, [categoryParam]);

  if (loading) {
    return <div className="p-6 text-slate-500">Chargement...</div>;
  }

  return (
    <div className="px-6 py-8">
      <a href="/documents" className="text-slate-500 text-sm mb-4 inline-block">
        ← Retour
      </a>

      <h1 className="text-3xl font-bold mb-4 capitalize">
        {categoryParam}
      </h1>

      {docs.length === 0 && (
        <p className="text-slate-500">
          Aucun document dans cette catégorie pour le moment.
        </p>
      )}

      <div className="flex flex-col gap-4 mt-4">
        {docs.map((doc) => (
          <a
            key={doc.id}
            href={`/documents/view?id=${doc.id}`}
            className="card flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">{doc.title}</p>
              <p className="text-slate-500 text-sm">
                {doc.original_filename}
              </p>
            </div>
            <span className="text-slate-400">›</span>
          </a>
        ))}
      </div>
    </div>
  );
}
