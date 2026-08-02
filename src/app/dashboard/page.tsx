"use client";

/**
 * Accueil web — fidélité mobile.
 * Réf. layout Personnel :
 *   paipers-mobile/src/features/home/personal/PersonalHomeContent.tsx
 * Réf. layout Pro :
 *   paipers-mobile/src/features/proHome/ProHomeContent.tsx
 * Réf. switch :
 *   paipers-mobile/app/(tabs)/index.tsx (HomeScreenPersonal → Pro vs Personal)
 *
 * Données conservées : pending needs_review + accept/ignore Gmail,
 * échéances agenda dérivées de documents.metadata (expiration_date / important_date).
 * Retiré (absent de l’accueil mobile actuel) : StatCards KPI, « Rappels à venir », score hero.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useNavSpace } from "@/components/NavSpaceProvider";
import HomeTopSquareCards from "@/components/home/HomeTopSquareCards";
import HomeDetectedSubscriptionsCard, {
  type DetectedSubscriptionRow,
} from "@/components/home/HomeDetectedSubscriptionsCard";
import HomeImportInboxSection from "@/components/home/HomeImportInboxSection";
import ProHomeActivitySection from "@/components/home/ProHomeActivitySection";
import { fetchAgendaEventsFromDocuments } from "@/lib/agendaEvents";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { supabase } from "@/lib/supabase";
import { PAIPERS_ASSETS, PAIPERS_SPACE } from "@/lib/paipersTheme";

type PendingDoc = {
  id: string;
  title: string | null;
  original_filename: string | null;
  created_at: string;
};

export default function DashboardPage() {
  const { showProTabs, spaceLabel, loaded: spaceLoaded } = useNavSpace();

  const [pendingDocs, setPendingDocs] = useState<PendingDoc[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [uiError, setUiError] = useState("");

  const [agendaEvents, setAgendaEvents] = useState<
    { due_date: string }[]
  >([]);
  const [subscriptions, setSubscriptions] = useState<DetectedSubscriptionRow[]>([]);
  const [subscriptionTotal, setSubscriptionTotal] = useState(0);
  const [subscriptionYearly, setSubscriptionYearly] = useState(0);

  const loadAll = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;

    const { data: pending } = await supabase
      .from("documents")
      .select("id,title,original_filename,created_at")
      .eq("user_id", auth.user.id)
      .eq("needs_review", true)
      .order("created_at", { ascending: false });

    setPendingDocs(pending || []);
    setLoadingPending(false);

    const { events } = await fetchAgendaEventsFromDocuments();
    setAgendaEvents(events);

    // Abonnements : colonne metadata.subscription (logique mobile).
    // Si absente / non peuplée sur le web → état vide officiel, sans inventer.
    const { data: docsWithMeta, error: metaErr } = await supabase
      .from("documents")
      .select("id,title,metadata")
      .eq("user_id", auth.user.id)
      .eq("is_ready", true);

    if (metaErr || !docsWithMeta) {
      setSubscriptions([]);
      setSubscriptionTotal(0);
      setSubscriptionYearly(0);
      return;
    }

    const merged = new Map<
      string,
      { name: string; amount: number; docCount: number }
    >();

    for (const doc of docsWithMeta as {
      id: string;
      title: string | null;
      metadata: Record<string, unknown> | null;
    }[]) {
      const sub = doc.metadata?.subscription as
        | { detected?: boolean; name?: string; amount?: number; mergeKey?: string }
        | undefined;
      if (!sub?.detected) continue;
      const key =
        (typeof sub.mergeKey === "string" && sub.mergeKey) ||
        (typeof sub.name === "string" && sub.name) ||
        doc.id;
      const name =
        (typeof sub.name === "string" && sub.name) ||
        doc.title ||
        "Abonnement";
      const amount = typeof sub.amount === "number" ? sub.amount : 0;
      const prev = merged.get(key);
      if (prev) {
        merged.set(key, {
          name: prev.name,
          amount: prev.amount + amount,
          docCount: prev.docCount + 1,
        });
      } else {
        merged.set(key, { name, amount, docCount: 1 });
      }
    }

    const rows: DetectedSubscriptionRow[] = Array.from(merged.entries()).map(
      ([mergeKey, v]) => ({
        mergeKey,
        name: v.name,
        amount: v.amount,
        docCount: v.docCount,
      }),
    );
    const monthly = rows.reduce((s, r) => s + r.amount, 0);
    setSubscriptions(rows);
    setSubscriptionTotal(monthly);
    setSubscriptionYearly(monthly * 12);
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const eventDays = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const days = new Set<number>();
    for (const r of agendaEvents) {
      const d = new Date(r.due_date);
      if (Number.isNaN(d.getTime())) continue;
      if (d.getFullYear() === y && d.getMonth() === m) {
        days.add(d.getDate());
      }
    }
    return days;
  }, [agendaEvents]);

  async function handleAccept(docId: string) {
    setUiError("");
    setActionLoading(docId);

    try {
      const res = await fetch("/api/gmail/download-attachment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setUiError(data?.error ? `Erreur : ${data.error}` : "Erreur inconnue.");
        setActionLoading(null);
        return;
      }

      window.location.href = "/documents";
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "inconnue";
      setUiError(`Erreur réseau : ${msg}`);
      setActionLoading(null);
    }
  }

  async function handleIgnore(docId: string) {
    setUiError("");
    setActionLoading(docId);

    const { error } = await supabase
      .from("documents")
      .update({ needs_review: false })
      .eq("id", docId);

    if (error) {
      setUiError(`Erreur : ${error.message}`);
      setActionLoading(null);
      return;
    }

    setPendingDocs((prev) => prev.filter((d) => d.id !== docId));
    setActionLoading(null);
  }

  const isProHome = showProTabs;

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-4"
          style={{
            padding: PAIPERS_SPACE.screenPad,
          }}
        >
          <div className="mb-5 md:mb-6">
            <div
              className="hidden md:block p-5 mb-5 paipers-hover-lift"
              style={{
                background: DESKTOP_SURFACES.marine,
                borderRadius: 16,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div className="flex items-center gap-4">
                <img
                  src={PAIPERS_ASSETS.mascot}
                  alt=""
                  className="w-14 h-14 object-contain"
                />
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: DESKTOP_SURFACES.accentLine,
                    }}
                  >
                    Accueil
                  </p>
                  <h1
                    style={{
                      margin: "4px 0 0",
                      fontSize: 24,
                      fontWeight: 800,
                      color: DESKTOP_SURFACES.onDark,
                      letterSpacing: -0.4,
                    }}
                  >
                    Ton espace Paipers
                  </h1>
                  {spaceLoaded ? (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: 13,
                        fontWeight: 600,
                        color: DESKTOP_SURFACES.onDarkMuted,
                      }}
                    >
                      Espace {spaceLabel}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="md:hidden">
              <h1 className="paipers-screen-title" style={{ marginBottom: 4 }}>
                Accueil
              </h1>
              {spaceLoaded ? (
                <p
                  className="paipers-text-muted"
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    margin: 0,
                  }}
                >
                  Espace {spaceLabel}
                </p>
              ) : null}
            </div>
          </div>

          {/* Accueil : pile verticale claire, pas de chevauchement */}
          <div
            className="w-full max-w-5xl"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "relative",
            }}
          >
            <div className="w-full min-w-0">
              <HomeTopSquareCards eventDays={eventDays} />
            </div>

            {isProHome ? (
              <div
                className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4"
                style={{ alignItems: "start" }}
              >
                <div className="min-w-0 w-full">
                  <ProHomeActivitySection />
                </div>
                <div
                  className="min-w-0 w-full"
                  style={{ display: "flex", flexDirection: "column", gap: 16 }}
                >
                  {subscriptions.length > 0 ? (
                    <HomeDetectedSubscriptionsCard
                      items={subscriptions}
                      totalMonthly={subscriptionTotal}
                      totalYearly={subscriptionYearly}
                    />
                  ) : null}
                  <HomeImportInboxSection
                    items={pendingDocs}
                    alwaysShow
                    loading={loadingPending}
                    actionLoadingId={actionLoading}
                    error={uiError}
                    onImport={handleAccept}
                    onIgnore={handleIgnore}
                  />
                </div>
              </div>
            ) : (
              <div
                className="w-full grid grid-cols-1 lg:grid-cols-2 gap-4"
                style={{ alignItems: "start" }}
              >
                <div className="min-w-0 w-full">
                  <HomeDetectedSubscriptionsCard
                    items={subscriptions}
                    totalMonthly={subscriptionTotal}
                    totalYearly={subscriptionYearly}
                    showWhenEmpty
                  />
                </div>
                <div className="min-w-0 w-full">
                  <HomeImportInboxSection
                    items={pendingDocs}
                    alwaysShow
                    loading={loadingPending}
                    actionLoadingId={actionLoading}
                    error={uiError}
                    onImport={handleAccept}
                    onIgnore={handleIgnore}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
