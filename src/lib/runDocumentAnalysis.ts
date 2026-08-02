/**
 * Analyse IA document — même contrat que le mobile (edge analyze-document).
 * Réf. paipers-mobile/src/lib/runDocumentAnalysis.ts
 */

import { supabase } from "@/lib/supabase";
import { normCat } from "@/lib/documentCategories";

export type DocumentAnalysisResult = {
  ok: boolean;
  displayTitle?: string | null;
  category?: string | null;
  subcategory?: string | null;
  error?: string;
};

function userMessageForFunctionsInvokeError(error: unknown): string {
  if (!error) return "Analyse impossible.";
  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = String((error as { message?: string }).message || "").trim();
    if (msg) return msg;
  }
  return "Analyse impossible (edge function).";
}

/** Lance l’analyse IA (titre, catégorie, dossier) sur un document déjà en base. */
export async function runDocumentAnalysis(
  documentId: string,
  opts?: { accountScope?: "personal" | "family" | "pro" },
): Promise<DocumentAnalysisResult> {
  const { data, error } = await supabase.functions.invoke("analyze-document", {
    body: {
      document_id: documentId,
      account_scope: opts?.accountScope ?? "personal",
    },
  });

  if (error) {
    return { ok: false, error: userMessageForFunctionsInvokeError(error) };
  }

  const parsed =
    typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
  if (parsed.success !== true) {
    return {
      ok: false,
      error: String(parsed.error ?? parsed.message ?? "Analyse impossible"),
    };
  }

  const displayTitle =
    typeof parsed.display_title === "string" && parsed.display_title.trim().length >= 3
      ? parsed.display_title.trim()
      : null;

  return {
    ok: true,
    displayTitle,
    category: typeof parsed.category === "string" ? parsed.category : null,
    subcategory: typeof parsed.subcategory === "string" ? parsed.subcategory : null,
  };
}

/**
 * Après analyze-document (qui remplit ai_category), aligne aussi `category`
 * pour l’UI web qui groupe sur cette colonne.
 */
export async function syncWebCategoryFromAnalysis(
  documentId: string,
  analysis: DocumentAnalysisResult,
): Promise<void> {
  if (!analysis.ok) return;
  const patch: Record<string, string> = {};
  if (analysis.category) {
    patch.category = normCat(analysis.category);
  }
  if (analysis.displayTitle && analysis.displayTitle.trim().length >= 3) {
    patch.title = analysis.displayTitle.trim();
  }
  if (Object.keys(patch).length === 0) return;

  await supabase.from("documents").update(patch).eq("id", documentId);
}

/** Catégorie effective pour l’affichage web (mobile = ai_category). */
export function effectiveDocumentCategory(
  category: string | null | undefined,
  aiCategory?: string | null | undefined,
): string {
  const ai = (aiCategory || "").trim();
  if (ai && normCat(ai) !== "autres") return ai;
  return category || "autres";
}
