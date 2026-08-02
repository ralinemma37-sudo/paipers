/**
 * Classifie des documents comme sur mobile : edge analyze-document + sync category web.
 */

import { supabase } from "@/lib/supabase";
import { normCat } from "@/lib/documentCategories";
import {
  runDocumentAnalysis,
  syncWebCategoryFromAnalysis,
} from "@/lib/runDocumentAnalysis";

export type ClassifyApiResult = {
  id: string;
  ok: boolean;
  title?: string;
  category?: string;
  error?: string;
};

/**
 * Si ai_category est déjà renseigné (ex. import mobile), synchronise `category` sans rappel IA.
 */
export async function syncCategoryFromAiFields(
  documentIds: string[],
): Promise<ClassifyApiResult[]> {
  if (documentIds.length === 0) return [];

  const { data, error } = await supabase
    .from("documents")
    .select("id,title,ai_title,category,ai_category")
    .in("id", documentIds);

  if (error) {
    return documentIds.map((id) => ({ id, ok: false, error: error.message }));
  }

  const results: ClassifyApiResult[] = [];
  for (const row of data || []) {
    const ai = (row.ai_category as string | null) || "";
    if (!ai || normCat(ai) === "autres") {
      results.push({ id: row.id, ok: false, error: "pas_encore_analyse" });
      continue;
    }
    const category = normCat(ai);
    const title =
      (typeof row.ai_title === "string" && row.ai_title.trim().length >= 3
        ? row.ai_title.trim()
        : null) ||
      (typeof row.title === "string" ? row.title : undefined);

    const { error: upErr } = await supabase
      .from("documents")
      .update({
        category,
        ...(title ? { title } : {}),
      })
      .eq("id", row.id);

    if (upErr) {
      results.push({ id: row.id, ok: false, error: upErr.message });
    } else {
      results.push({ id: row.id, ok: true, category, title: title || undefined });
    }
  }
  return results;
}

export async function classifyDocumentById(
  documentId: string,
): Promise<ClassifyApiResult> {
  // 1) Sync rapide si déjà analysé côté mobile
  const synced = await syncCategoryFromAiFields([documentId]);
  if (synced[0]?.ok) return synced[0];

  // 2) Sinon edge analyze-document (clés OpenAI côté Supabase)
  const analysis = await runDocumentAnalysis(documentId);
  if (!analysis.ok) {
    return {
      id: documentId,
      ok: false,
      error: analysis.error || "Analyse impossible",
    };
  }

  try {
    await syncWebCategoryFromAnalysis(documentId, analysis);
  } catch (e: unknown) {
    return {
      id: documentId,
      ok: false,
      error: e instanceof Error ? e.message : "Sync catégorie échouée",
    };
  }

  return {
    id: documentId,
    ok: true,
    title: analysis.displayTitle || undefined,
    category: analysis.category ? normCat(analysis.category) : undefined,
  };
}

export async function classifyDocumentsByIds(
  documentIds: string[],
): Promise<ClassifyApiResult[]> {
  if (documentIds.length === 0) return [];

  const results: ClassifyApiResult[] = [];
  // Un par un : l’edge analyze-document est lourde (OCR / OpenAI)
  for (const id of documentIds) {
    results.push(await classifyDocumentById(id));
  }
  return results;
}
