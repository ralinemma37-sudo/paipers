/**
 * Événements d’agenda dérivés des documents existants.
 * Pas de table `reminders` côté web : aligné mobile (expiration_date / important_date
 * dans documents.metadata).
 */

import { supabase } from "@/lib/supabase";

export type AgendaEvent = {
  id: string;
  title: string;
  /** ISO date utilisée pour le calendrier */
  due_date: string;
  documentId: string | null;
  kind: "expiration" | "important_date";
};

function parseISODate(value: unknown): Date | null {
  if (typeof value !== "string") return null;
  const m = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

function asMeta(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {};
  return raw as Record<string, unknown>;
}

function isSubscriptionMeta(meta: Record<string, unknown>): boolean {
  const sub = meta.subscription;
  if (sub === true || sub === "true" || sub === 1) return true;
  if (sub && typeof sub === "object" && (sub as { detected?: boolean }).detected) {
    return true;
  }
  return false;
}

/**
 * Charge les échéances depuis `documents.metadata` pour l’utilisateur connecté.
 */
export async function fetchAgendaEventsFromDocuments(): Promise<{
  events: AgendaEvent[];
  error: string | null;
}> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return { events: [], error: null };
  }

  const { data, error } = await supabase
    .from("documents")
    .select("id,title,metadata")
    .eq("user_id", auth.user.id);

  if (error) {
    return { events: [], error: error.message || "Impossible de charger l’agenda." };
  }

  const events: AgendaEvent[] = [];
  const horizon = new Date();
  horizon.setFullYear(horizon.getFullYear() + 5);
  const pastLimit = new Date();
  pastLimit.setFullYear(pastLimit.getFullYear() - 1);

  for (const doc of data || []) {
    const meta = asMeta(doc.metadata);
    if (isSubscriptionMeta(meta)) continue;

    const label = String(doc.title || "Document").trim().slice(0, 120);

    const exp = parseISODate(meta.expiration_date);
    if (exp && exp.getTime() >= pastLimit.getTime() && exp.getTime() <= horizon.getTime()) {
      events.push({
        id: `exp-${doc.id}`,
        title: `${label} — expiration`,
        due_date: exp.toISOString(),
        documentId: doc.id,
        kind: "expiration",
      });
    }

    const important = parseISODate(meta.important_date);
    if (
      important &&
      important.getTime() >= pastLimit.getTime() &&
      important.getTime() <= horizon.getTime()
    ) {
      // Éviter doublon si même jour que expiration
      const sameAsExp =
        exp &&
        exp.getFullYear() === important.getFullYear() &&
        exp.getMonth() === important.getMonth() &&
        exp.getDate() === important.getDate();
      if (!sameAsExp) {
        events.push({
          id: `imp-${doc.id}`,
          title: `${label} — date importante`,
          due_date: important.toISOString(),
          documentId: doc.id,
          kind: "important_date",
        });
      }
    }
  }

  events.sort(
    (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime(),
  );

  return { events, error: null };
}
