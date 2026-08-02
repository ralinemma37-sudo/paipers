/**
 * Réf. : paipers-mobile/src/lib/documentPreviewUrl.ts
 */

import { supabase } from "@/lib/supabase";

type SignedUrlEntry = { url: string; expiresAt: number };
const signedUrlCache = new Map<string, SignedUrlEntry>();
const CACHE_REFRESH_MARGIN_MS = 60_000;

export type DocumentStorageRef = {
  storage_path?: string | null;
  file_path?: string | null;
  url?: string | null;
};

export async function createSignedDocumentUrl(
  path: string,
  ttlSeconds = 60 * 15,
): Promise<string> {
  const now = Date.now();
  const cached = signedUrlCache.get(path);
  if (cached && cached.expiresAt > now + CACHE_REFRESH_MARGIN_MS) {
    return cached.url;
  }

  const { data, error } = await supabase.storage
    .from("documents")
    .createSignedUrl(path, ttlSeconds);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error("URL invalide");

  signedUrlCache.set(path, {
    url: data.signedUrl,
    expiresAt: now + ttlSeconds * 1000,
  });
  return data.signedUrl;
}

export async function resolveDocumentPreviewUrl(
  doc: DocumentStorageRef,
): Promise<string> {
  if (doc.storage_path) return createSignedDocumentUrl(doc.storage_path);
  if (doc.file_path) return createSignedDocumentUrl(doc.file_path);
  if (doc.url?.startsWith("http")) return doc.url;
  return "";
}
