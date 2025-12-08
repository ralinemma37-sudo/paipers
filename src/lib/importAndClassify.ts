import { supabase } from "@/lib/supabase";
import path from "path";

export async function importAndClassify(file: File, userId: string) {
  console.log("📂 Import :", file.name);

  const ext = path.extname(file.name);
  const filePath = `${userId}/${Date.now()}${ext}`;

  // 1️⃣ Upload fichier
  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (uploadError) throw new Error(uploadError.message);

  // 2️⃣ Construire l'URL publique temporaire
  const { data: urlData } = await supabase.storage
    .from("documents")
    .createSignedUrl(filePath, 60);

  const fileUrl = urlData?.signedUrl;

  let extractedText = "";
  let finalTitle = file.name;
  let finalCategory = "autres";

  // 3️⃣ IA OCR → extrait le texte du PDF
  try {
    const res = await fetch("/api/read-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileUrl }),
    });

    const json = await res.json();
    extractedText = json.extracted || "";
  } catch (e) {
    console.warn("⚠ OCR échoué");
  }

  // 4️⃣ IA Renommage
  try {
    const res = await fetch("/api/rename", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, extractedText }),
    });

    const json = await res.json();
    if (json.title) finalTitle = json.title;
  } catch {}

  // 5️⃣ IA Catégorie
  try {
    const res = await fetch("/api/classify-document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileName: file.name, extractedText }),
    });

    const json = await res.json();
    if (json.category) finalCategory = json.category;
  } catch {}

  // 6️⃣ Enregistrer en base
  const { error: insertError } = await supabase.from("documents").insert({
    user_id: userId,
    title: finalTitle,
    original_filename: file.name,
    storage_path: filePath,
    file_type: ext.replace(".", ""),
    category: finalCategory,
    extracted_text: extractedText,
  });

  if (insertError) throw new Error(insertError.message);

  return {
    title: finalTitle,
    category: finalCategory,
  };
}
