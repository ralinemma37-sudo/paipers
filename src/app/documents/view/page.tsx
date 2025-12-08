"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ViewDocumentPage() {
  const searchParams = useSearchParams();
  const docId = searchParams.get("id");

  const [doc, setDoc] = useState<any>(null);

  useEffect(() => {
    const loadDoc = async () => {
      if (!docId) return;

      const { data } = await supabase
        .from("documents")
        .select("*")
        .eq("id", docId)
        .single();

      setDoc(data);
    };

    loadDoc();
  }, [docId]);

  if (!doc) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6">

      <a href="/documents" className="text-slate-500 text-sm mb-4 inline-block">
        ← Retour
      </a>

      <h1 className="text-2xl font-bold mb-4">{doc.title}</h1>

      <iframe
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${doc.storage_path}`}
        className="w-full h-[80vh] border rounded-xl"
      />

    </div>
  );
}
