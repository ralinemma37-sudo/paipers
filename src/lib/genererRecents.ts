/**
 * Récents Générer — réf. paipers-mobile/src/lib/genererRecentsCache.ts (lecture DB).
 */

import { supabase } from "@/lib/supabase";

export type GenererRecentKind = "Rédigé" | "Complété" | "Signé";

export type GenererRecentDoc = {
  id: string;
  title: string;
  created_at: string | null;
  kind: GenererRecentKind;
};

type RecentDocRow = {
  id: string;
  title: string | null;
  created_at: string | null;
  source: string | null;
  metadata: Record<string, unknown> | null;
};

function recentDocLabel(row: RecentDocRow): string {
  const title = (row.title || "").trim();
  return title || "Document";
}

function inferGenererKind(row: RecentDocRow): GenererRecentKind | null {
  const title = (row.title || "").toLowerCase();
  const metadata = row.metadata;

  if (
    title.includes("(signé)") ||
    title.includes("(signe)") ||
    metadata?.signed === true ||
    metadata?.signed_at
  ) {
    return "Signé";
  }

  if (
    metadata?.source === "fill_document" ||
    metadata?.fill_wizard === true ||
    metadata?.fill_wizard_draft === true
  ) {
    return "Complété";
  }

  if (metadata?.generated === true || row.source === "ai") {
    return "Rédigé";
  }

  return null;
}

export function formatRelativeFr(value: string | null | undefined): string {
  if (!value) return "";
  const d = new Date(value);
  const t = d.getTime();
  if (!Number.isFinite(t) || t <= 0) return "";
  const diffMs = Date.now() - t;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "Il y a 1 heure" : `Il y a ${hours} heures`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  return d.toLocaleDateString("fr-FR");
}

export async function fetchGenererRecents(userId: string): Promise<GenererRecentDoc[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("id,title,created_at,source,metadata")
    .eq("user_id", userId)
    .eq("is_ready", true)
    .order("created_at", { ascending: false })
    .limit(40);

  if (error || !data) return [];

  const rows: GenererRecentDoc[] = [];
  for (const d of data as RecentDocRow[]) {
    const kind = inferGenererKind(d);
    if (!kind) continue;
    rows.push({
      id: d.id,
      title: recentDocLabel(d),
      created_at: d.created_at,
      kind,
    });
    if (rows.length >= 5) break;
  }
  return rows;
}
