import { supabase } from "@/lib/supabase";

export async function uploadDocument(file: File, userId: string) {
  const ext = file.name.split(".").pop();
  const fileName = `${Date.now()}.${ext}`;
  const filePath = `documents/${userId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("documents")
    .upload(filePath, file);

  if (error) throw error;

  return filePath;
}
