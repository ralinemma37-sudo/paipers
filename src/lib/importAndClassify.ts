import { supabase } from "@/lib/supabase";

export type ClassifiedDocument = {
  id: string;
  title: string;
  category: string | null;
  user_id: string;
  file_path: string;
  mime_type: string | null;
};

export async function importAndClassify(file: File, userId?: string) {
  if (!userId) throw new Error("userId manquant");

  // 1) Upload dans Storage (bucket: documents)
  const safeName = file.name.replaceAll(" ", "_");
  const filePath = `${userId}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(`Upload error: ${uploadError.message}`);
  }

  // 2) Insert dans la table documents
  const { data: inserted, error: insertError } = await supabase
    .from("documents")
    .insert({
      user_id: userId,
      title: file.name,
      category: null,
      needs_review: false, // import manuel = déjà accepté
      is_ready: true,      // prêt tout de suite
      file_path: filePath,
      mime_type: file.type || null,
      source: "manual",
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error(`Insert error: ${insertError.message}`);
  }

  return inserted as ClassifiedDocument;
}
