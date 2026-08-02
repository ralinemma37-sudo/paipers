/**
 * Import fichier local → Storage + ligne documents + classification IA.
 * Réutilise uploadDocument.ts + pattern d’insert de generer/page.tsx.
 */

import { uploadDocument } from "@/lib/uploadDocument";
import { classifyDocumentById } from "@/lib/classifyDocumentsClient";
import { supabase } from "@/lib/supabase";

const ALLOWED_EXT = new Set([
  "pdf",
  "png",
  "jpg",
  "jpeg",
  "webp",
  "heic",
  "txt",
]);

export function validateImportFile(file: File): string | null {
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return "Format non pris en charge. Importe un PDF ou une image.";
  }
  // Limite soft alignée usages web existants (évite payloads énormes côté client)
  const maxBytes = 25 * 1024 * 1024;
  if (file.size > maxBytes) {
    return "Fichier trop volumineux (max. 25 Mo).";
  }
  return null;
}

function mimeForFile(file: File): string {
  if (file.type) return file.type;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  if (ext === "pdf") return "application/pdf";
  if (ext === "png") return "image/png";
  if (ext === "jpg" || ext === "jpeg") return "image/jpeg";
  if (ext === "webp") return "image/webp";
  if (ext === "txt") return "text/plain";
  return "application/octet-stream";
}

export type ImportDocumentResult = {
  id: string;
  filePath: string;
};

/**
 * Upload + insert, puis classification (titre + catégorie) comme sur mobile.
 * L’import réussit même si la classification échoue (reste en « Autres »).
 */
export async function importDocumentFile(
  file: File,
  userId: string,
): Promise<ImportDocumentResult> {
  const validation = validateImportFile(file);
  if (validation) throw new Error(validation);

  const filePath = await uploadDocument(file, userId);
  const title = file.name.replace(/\.[^.]+$/, "") || "Document";

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title,
      original_filename: file.name,
      category: "autres",
      source: "upload",
      file_path: filePath,
      mime_type: mimeForFile(file),
      is_ready: true,
      needs_review: false,
    })
    .select("id")
    .single();

  if (error) throw new Error(error.message);
  if (!data?.id) throw new Error("Import échoué.");

  try {
    await classifyDocumentById(data.id);
  } catch {
    /* classification best-effort */
  }

  return { id: data.id, filePath };
}
