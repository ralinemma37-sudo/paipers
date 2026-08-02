/**
 * Fusion PDF côté client — pdf-lib (déjà dépendant du projet).
 * Réf. mobile : mergePdfFiles.ts + mergeDocumentsPdf.ts
 */

import { PDFDocument } from "pdf-lib";
import { classifyDocumentById } from "@/lib/classifyDocumentsClient";
import { supabase } from "@/lib/supabase";

export type MergeDocInput = {
  id: string;
  file_path: string | null;
  title: string | null;
  mime_type: string | null;
};

export async function mergePdfBuffers(pdfBytesList: Uint8Array[]): Promise<Uint8Array> {
  if (pdfBytesList.length === 0) throw new Error("Aucun PDF à fusionner.");
  const merged = await PDFDocument.create();
  for (const bytes of pdfBytesList) {
    const src = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const copied = await merged.copyPages(src, src.getPageIndices());
    copied.forEach((p) => merged.addPage(p));
  }
  return merged.save();
}

function isPdfDoc(doc: MergeDocInput): boolean {
  const m = (doc.mime_type || "").toLowerCase();
  const p = (doc.file_path || "").toLowerCase();
  return m.includes("pdf") || p.endsWith(".pdf");
}

/**
 * Télécharge, fusionne et enregistre un nouveau document PDF.
 * @returns id du document créé
 */
export async function mergeDocumentsIntoPdf(params: {
  userId: string;
  documents: MergeDocInput[];
  title: string;
  onProgress?: (label: string) => void;
}): Promise<string> {
  const { userId, documents, title, onProgress } = params;
  const pdfs = documents.filter((d) => d.file_path && isPdfDoc(d));
  if (pdfs.length < 2) {
    throw new Error("Choisis au moins deux PDF (l’ordre de sélection = ordre des pages).");
  }

  onProgress?.("Téléchargement des fichiers…");
  const buffers: Uint8Array[] = [];
  for (const doc of pdfs) {
    const path = doc.file_path!;
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(path, 120);
    if (error || !data?.signedUrl) {
      throw new Error(`Téléchargement impossible : ${doc.title || "document"}`);
    }
    const res = await fetch(data.signedUrl);
    if (!res.ok) throw new Error(`Téléchargement échoué : ${doc.title || "document"}`);
    const ab = await res.arrayBuffer();
    buffers.push(new Uint8Array(ab));
  }

  onProgress?.("Fusion des PDF…");
  const merged = await mergePdfBuffers(buffers);
  const fileName = `merge-${Date.now()}.pdf`;
  const filePath = `documents/${userId}/${fileName}`;
  const blob = new Blob([merged.buffer as ArrayBuffer], { type: "application/pdf" });

  onProgress?.("Enregistrement…");
  const { error: upErr } = await supabase.storage
    .from("documents")
    .upload(filePath, blob, { contentType: "application/pdf", upsert: false });
  if (upErr) throw new Error(upErr.message);

  const name = title.trim() || "Document fusionné";
  const { data: created, error: insErr } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title: name,
      original_filename: `${name}.pdf`,
      category: "autres",
      source: "merge",
      file_path: filePath,
      mime_type: "application/pdf",
      is_ready: true,
      needs_review: false,
      metadata: { paipers_composite_merge: true },
    })
    .select("id")
    .single();

  if (insErr) throw new Error(insErr.message);
  if (!created?.id) throw new Error("Création du document fusionné échouée.");

  try {
    await classifyDocumentById(created.id);
  } catch {
    /* best-effort */
  }

  return created.id;
}
