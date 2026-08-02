/**
 * Favoris documents — miroir mobile (AsyncStorage → localStorage).
 * Réf. : paipers-mobile/src/lib/documentFavoritesStorage.ts
 */

export type DocumentFavoriteEntry = {
  id: string;
  kind: "cloud" | "pro_local";
  title: string;
  subtitle?: string;
  addedAt: string;
};

const STORAGE_VERSION = 1;
const PREFIX = "paipers_document_favorites_v1";

function storageKey(userId: string, scopeKey: string): string {
  return `${PREFIX}::${userId}::${scopeKey}`;
}

export function loadDocumentFavorites(
  userId: string,
  scopeKey: string,
): DocumentFavoriteEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(storageKey(userId, scopeKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { v?: number; items?: DocumentFavoriteEntry[] };
    if (parsed.v !== STORAGE_VERSION || !Array.isArray(parsed.items)) return [];
    return parsed.items.filter(
      (e) => typeof e.id === "string" && e.id.length > 0 && typeof e.title === "string",
    );
  } catch {
    return [];
  }
}

export function saveDocumentFavorites(
  userId: string,
  scopeKey: string,
  items: DocumentFavoriteEntry[],
): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    storageKey(userId, scopeKey),
    JSON.stringify({ v: STORAGE_VERSION, items }),
  );
}
