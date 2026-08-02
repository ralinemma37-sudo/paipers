/**
 * POST /api/documents/classify
 * Classifie un document (ou un lot) via extraction texte + OpenAI.
 * Auth : Bearer access_token utilisateur (RLS).
 */

import { NextResponse } from "next/server";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { extractTextIfPossible } from "@/lib/server/extractDocumentText";
import { classifyDocumentWithOpenAI } from "@/lib/server/classifyWithOpenAI";

export const runtime = "nodejs";

type Body = {
  documentId?: string;
  documentIds?: string[];
};

type DocRow = {
  id: string;
  title: string | null;
  file_path: string | null;
  mime_type: string | null;
  original_filename: string | null;
  is_ready: boolean | null;
  category: string | null;
};

function getUserClient(req: Request): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing Supabase env");

  const auth = req.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return null;
  }

  return createClient(url, anon, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function classifyOne(supabase: SupabaseClient, documentId: string) {
  const { data, error: docErr } = await supabase
    .from("documents")
    .select("id,title,file_path,mime_type,original_filename,is_ready,category")
    .eq("id", documentId)
    .single();

  const doc = data as DocRow | null;
  if (docErr || !doc) {
    return { id: documentId, ok: false as const, error: "Document introuvable" };
  }
  if (!doc.is_ready || !doc.file_path) {
    return { id: documentId, ok: false as const, error: "Document pas prêt" };
  }

  const { data: file, error: dlErr } = await supabase.storage
    .from("documents")
    .download(doc.file_path);
  if (dlErr || !file) {
    return { id: documentId, ok: false as const, error: "Téléchargement impossible" };
  }

  const ab = await file.arrayBuffer();
  const extractedText = await extractTextIfPossible(
    doc.mime_type || "",
    doc.original_filename || doc.title || "",
    ab,
  );

  try {
    const { category, title } = await classifyDocumentWithOpenAI({
      fileName: doc.original_filename || doc.title || "document",
      extractedText,
    });

    const { error: upErr } = await supabase
      .from("documents")
      .update({ title, category })
      .eq("id", doc.id);

    if (upErr) {
      return { id: documentId, ok: false as const, error: upErr.message };
    }

    return { id: documentId, ok: true as const, title, category };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erreur classification";
    return { id: documentId, ok: false as const, error: msg };
  }
}

export async function POST(req: Request) {
  try {
    const supabase = getUserClient(req);
    if (!supabase) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      return NextResponse.json({ error: "Session invalide" }, { status: 401 });
    }

    const body = (await req.json()) as Body;
    const ids = [
      ...(body.documentId ? [body.documentId] : []),
      ...(Array.isArray(body.documentIds) ? body.documentIds : []),
    ].filter(Boolean);

    if (ids.length === 0) {
      return NextResponse.json({ error: "documentId requis" }, { status: 400 });
    }

    const limited = ids.slice(0, 30);
    const results = [];
    for (const id of limited) {
      results.push(await classifyOne(supabase, id));
    }

    return NextResponse.json({ ok: true, results });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
