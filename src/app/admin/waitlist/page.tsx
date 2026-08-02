"use client";

/**
 * Stats waitlist — réservé aux emails listés dans WAITLIST_ADMIN_EMAILS.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { supabase } from "@/lib/supabase";
import { profileLabel } from "@/lib/waitlist/types";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

type Stats = {
  total: number;
  confirmed: number;
  unconfirmed: number;
  byProfile: {
    particulier: number;
    professionnel: number;
    les_deux: number;
  };
  marketing: number;
};

type Recent = {
  id: string;
  created_at: string;
  first_name: string | null;
  email: string;
  profile: string;
  confirmed: boolean;
  marketing_consent: boolean;
  challenge: string | null;
};

export default function AdminWaitlistPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);
  const [evolution, setEvolution] = useState<{ date: string; count: number }[]>(
    [],
  );
  const [recent, setRecent] = useState<Recent[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setError("Non connecté.");
      setLoading(false);
      return;
    }
    const res = await fetch("/api/waitlist/admin", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json().catch(() => ({}))) as {
      error?: string;
      stats?: Stats;
      evolution?: { date: string; count: number }[];
      recent?: Recent[];
    };
    if (!res.ok) {
      setError(json.error || "Accès refusé");
      setStats(null);
      setLoading(false);
      return;
    }
    setStats(json.stats || null);
    setEvolution(json.evolution || []);
    setRecent(json.recent || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const exportCsv = async () => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    const res = await fetch("/api/waitlist/admin?export=csv", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      setError("Export impossible");
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "paipers-waitlist.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Protected>
      <AppShell>
        <div style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 960 }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <div>
              <h1 className="paipers-screen-title" style={{ margin: 0 }}>
                Waitlist
              </h1>
              <p className="paipers-text-muted" style={{ margin: "6px 0 0", fontSize: 14 }}>
                Statistiques internes — liste d’attente pré-lancement.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="paipers-button"
                onClick={() => void exportCsv()}
                style={{ padding: "10px 16px", fontSize: 14 }}
              >
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => void load()}
                style={{
                  padding: "10px 16px",
                  fontSize: 14,
                  fontWeight: 700,
                  borderRadius: 999,
                  border: `1px solid ${PAIPERS_COLORS.border}`,
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Actualiser
              </button>
            </div>
          </div>

          {loading ? (
            <p className="paipers-text-muted">Chargement…</p>
          ) : null}

          {error ? (
            <div
              style={{
                padding: 16,
                borderRadius: 14,
                background: "rgba(185,28,28,0.08)",
                border: "1px solid rgba(185,28,28,0.25)",
                marginBottom: 16,
              }}
            >
              <p style={{ margin: 0, color: "#991B1B", fontWeight: 700 }}>{error}</p>
              <p className="paipers-text-muted" style={{ marginTop: 8, fontSize: 13 }}>
                Ajoute ton email dans la variable d’environnement{" "}
                <code>WAITLIST_ADMIN_EMAILS</code> (Vercel / .env.local).
              </p>
              <Link href="/dashboard" style={{ fontWeight: 700, fontSize: 14 }}>
                Retour au dashboard
              </Link>
            </div>
          ) : null}

          {stats ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Inscrits", value: stats.total },
                  { label: "Confirmés", value: stats.confirmed },
                  { label: "Non confirmés", value: stats.unconfirmed },
                  { label: "Actualités OK", value: stats.marketing },
                ].map((c) => (
                  <div key={c.label} className="paipers-elevated-card" style={{ padding: 16 }}>
                    <p
                      className="paipers-text-muted"
                      style={{ margin: 0, fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}
                    >
                      {c.label}
                    </p>
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: 28,
                        fontWeight: 800,
                        color: PAIPERS_COLORS.navy,
                      }}
                    >
                      {c.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="paipers-elevated-card" style={{ padding: 16, marginTop: 16 }}>
                <p style={{ margin: 0, fontWeight: 800 }}>Répartition profils</p>
                <ul style={{ margin: "12px 0 0", paddingLeft: 18 }}>
                  <li>Particuliers : {stats.byProfile.particulier}</li>
                  <li>Professionnels : {stats.byProfile.professionnel}</li>
                  <li>Les deux : {stats.byProfile.les_deux}</li>
                </ul>
              </div>

              <div className="paipers-elevated-card" style={{ padding: 16, marginTop: 16 }}>
                <p style={{ margin: 0, fontWeight: 800 }}>Évolution des inscriptions</p>
                {evolution.length === 0 ? (
                  <p className="paipers-text-muted" style={{ marginTop: 10 }}>
                    Aucune donnée.
                  </p>
                ) : (
                  <div style={{ marginTop: 12, overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                      <thead>
                        <tr>
                          <th style={{ textAlign: "left", padding: "6px 8px" }}>Date</th>
                          <th style={{ textAlign: "right", padding: "6px 8px" }}>Inscriptions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {evolution.slice(-30).map((row) => (
                          <tr key={row.date} style={{ borderTop: `1px solid ${PAIPERS_COLORS.border}` }}>
                            <td style={{ padding: "6px 8px" }}>{row.date}</td>
                            <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>
                              {row.count}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="paipers-elevated-card" style={{ padding: 16, marginTop: 16 }}>
                <p style={{ margin: 0, fontWeight: 800 }}>Dernières inscriptions</p>
                <div style={{ marginTop: 12, overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>
                        <th style={{ textAlign: "left", padding: 6 }}>Date</th>
                        <th style={{ textAlign: "left", padding: 6 }}>Email</th>
                        <th style={{ textAlign: "left", padding: 6 }}>Profil</th>
                        <th style={{ textAlign: "left", padding: 6 }}>Confirmé</th>
                        <th style={{ textAlign: "left", padding: 6 }}>Actus</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((r) => (
                        <tr key={r.id} style={{ borderTop: `1px solid ${PAIPERS_COLORS.border}` }}>
                          <td style={{ padding: 6, whiteSpace: "nowrap" }}>
                            {new Date(r.created_at).toLocaleString("fr-FR")}
                          </td>
                          <td style={{ padding: 6 }}>
                            {r.first_name ? `${r.first_name} · ` : ""}
                            {r.email}
                          </td>
                          <td style={{ padding: 6 }}>{profileLabel(r.profile)}</td>
                          <td style={{ padding: 6 }}>{r.confirmed ? "Oui" : "Non"}</td>
                          <td style={{ padding: 6 }}>
                            {r.marketing_consent ? "Oui" : "Non"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </AppShell>
    </Protected>
  );
}
