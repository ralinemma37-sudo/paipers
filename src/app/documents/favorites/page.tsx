"use client";

/**
 * Liste des favoris — réf. mobile app/(tabs)/documents/favorites.tsx
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import DocumentGridTile from "@/components/documents/DocumentGridTile";
import { useDocumentFavorites } from "@/hooks/useDocumentFavorites";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

type Doc = {
  id: string;
  title: string | null;
  created_at: string;
  file_path: string | null;
  mime_type: string | null;
};

export default function DocumentsFavoritesPage() {
  const { favorites, ready, pruneFavorites } = useDocumentFavorites();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setDocs([]);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("documents")
      .select("id,title,created_at,file_path,mime_type")
      .eq("user_id", auth.user.id)
      .order("created_at", { ascending: false });
    setDocs(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!ready || loading) return;
    pruneFavorites(new Set(docs.map((d) => d.id)));
  }, [ready, loading, docs, pruneFavorites]);

  const docById = useMemo(() => {
    const m = new Map<string, Doc>();
    for (const d of docs) m.set(d.id, d);
    return m;
  }, [docs]);

  const favoriteDocs = useMemo(() => {
    return favorites
      .map((f) => docById.get(f.id))
      .filter((d): d is Doc => Boolean(d));
  }, [favorites, docById]);

  return (
    <Protected>
      <AppShell>
        <div className="pb-24 md:pb-6" style={{ padding: PAIPERS_SPACE.screenPad }}>
          <Link
            href="/documents"
            className="inline-flex items-center gap-1.5 text-[13px] font-semibold mb-4"
            style={{ color: PAIPERS_COLORS.navy, textDecoration: "none" }}
          >
            <ArrowLeft size={16} />
            Documents
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <Star size={22} color={PAIPERS_COLORS.navy} fill={PAIPERS_COLORS.navy} />
            <h1 className="paipers-screen-title" style={{ margin: 0 }}>
              Favoris
            </h1>
          </div>
          <p className="paipers-text-muted" style={{ margin: "0 0 20px", fontSize: 14 }}>
            Tes documents favoris sur cet appareil (espace actuel).
          </p>

          {loading || !ready ? (
            <p className="paipers-text-muted text-[14px]">Chargement…</p>
          ) : favoriteDocs.length === 0 ? (
            <div
              className="paipers-card-muted"
              style={{ padding: 20 }}
            >
              <p
                style={{
                  margin: 0,
                  fontWeight: 800,
                  fontSize: 16,
                  color: PAIPERS_COLORS.textPrimary,
                }}
              >
                Aucun favori
              </p>
              <p className="paipers-text-muted" style={{ margin: "8px 0 0", fontSize: 14 }}>
                Ouvre un document et ajoute-le aux favoris depuis sa fiche.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {favoriteDocs.map((d) => (
                <DocumentGridTile
                  key={d.id}
                  doc={d}
                  href={`/documents/view?id=${d.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </Protected>
  );
}
