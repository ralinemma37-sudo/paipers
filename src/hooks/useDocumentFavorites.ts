"use client";

/**
 * Hook favoris documents — scope Personnel / Pro (NavSpace).
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavSpace } from "@/components/NavSpaceProvider";
import {
  loadDocumentFavorites,
  saveDocumentFavorites,
  type DocumentFavoriteEntry,
} from "@/lib/documentFavoritesStorage";
import { supabase } from "@/lib/supabase";

export function useDocumentFavorites() {
  const { space } = useNavSpace();
  const scopeKey = space === "pro" ? "pro" : "personal";
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<DocumentFavoriteEntry[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    if (!userId) {
      setFavorites([]);
      setReady(true);
      return;
    }
    setReady(false);
    setFavorites(loadDocumentFavorites(userId, scopeKey));
    setReady(true);
  }, [userId, scopeKey]);

  const persist = useCallback(
    (next: DocumentFavoriteEntry[]) => {
      setFavorites(next);
      if (userId) saveDocumentFavorites(userId, scopeKey, next);
    },
    [userId, scopeKey],
  );

  const isFavorite = useCallback(
    (id: string) => favorites.some((f) => f.id === id),
    [favorites],
  );

  const toggleFavorite = useCallback(
    (input: { id: string; title: string; subtitle?: string }): boolean => {
      const exists = favorites.some((f) => f.id === input.id);
      if (exists) {
        persist(favorites.filter((f) => f.id !== input.id));
        return false;
      }
      const entry: DocumentFavoriteEntry = {
        id: input.id,
        kind: scopeKey === "pro" ? "pro_local" : "cloud",
        title: input.title.trim() || "Document",
        subtitle: input.subtitle?.trim() || undefined,
        addedAt: new Date().toISOString(),
      };
      persist([entry, ...favorites]);
      return true;
    },
    [favorites, persist, scopeKey],
  );

  const pruneFavorites = useCallback(
    (validIds: Set<string>) => {
      const next = favorites.filter((f) => validIds.has(f.id));
      if (next.length === favorites.length) return;
      persist(next);
    },
    [favorites, persist],
  );

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);

  return {
    ready,
    favorites,
    favoriteIds,
    isFavorite,
    toggleFavorite,
    pruneFavorites,
  };
}
