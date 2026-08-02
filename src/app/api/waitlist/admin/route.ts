/**
 * GET /api/waitlist/admin — stats + dernières inscriptions (équipe).
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServiceSupabase } from "@/lib/supabaseAdmin";
import { isWaitlistAdminEmail } from "@/lib/waitlist/admin";
import type { WaitlistRow } from "@/lib/waitlist/types";

export const runtime = "nodejs";

async function requireAdmin(req: Request) {
  const auth = req.headers.get("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return { error: NextResponse.json({ error: "Non authentifié" }, { status: 401 }) };
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    return {
      error: NextResponse.json({ error: "Config manquante" }, { status: 503 }),
    };
  }
  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const token = auth.slice(7);
  const { data, error } = await userClient.auth.getUser(token);
  if (error || !data.user?.email) {
    return { error: NextResponse.json({ error: "Session invalide" }, { status: 401 }) };
  }
  if (!isWaitlistAdminEmail(data.user.email)) {
    return { error: NextResponse.json({ error: "Accès refusé" }, { status: 403 }) };
  }
  return { user: data.user };
}

export async function GET(req: Request) {
  try {
    const gate = await requireAdmin(req);
    if ("error" in gate && gate.error) return gate.error;

    let supabase;
    try {
      supabase = getServiceSupabase();
    } catch {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY manquante" },
        { status: 503 },
      );
    }

    const { data, error } = await supabase
      .from("waitlist")
      .select(
        "id,created_at,first_name,email,profile,challenge,marketing_consent,launch_notification,confirmed,confirmed_at,source,utm_source,utm_medium,utm_campaign",
      )
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const rows = (data || []) as Omit<WaitlistRow, "confirmation_token">[];
    const total = rows.length;
    const confirmed = rows.filter((r) => r.confirmed).length;
    const unconfirmed = total - confirmed;
    const byProfile = {
      particulier: rows.filter((r) => r.profile === "particulier").length,
      professionnel: rows.filter((r) => r.profile === "professionnel").length,
      les_deux: rows.filter((r) => r.profile === "les_deux").length,
    };
    const marketing = rows.filter((r) => r.marketing_consent).length;

    const dayCounts: Record<string, number> = {};
    for (const r of rows) {
      const day = (r.created_at || "").slice(0, 10);
      if (!day) continue;
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    }
    const evolution = Object.entries(dayCounts)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    const url = new URL(req.url);
    const exportCsv = url.searchParams.get("export") === "csv";
    if (exportCsv) {
      const header = [
        "created_at",
        "first_name",
        "email",
        "profile",
        "confirmed",
        "confirmed_at",
        "marketing_consent",
        "challenge",
        "source",
        "utm_source",
        "utm_medium",
        "utm_campaign",
      ];
      const escape = (v: unknown) => {
        const s = v == null ? "" : String(v);
        if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
        return s;
      };
      const lines = [
        header.join(","),
        ...rows.map((r) =>
          [
            r.created_at,
            r.first_name,
            r.email,
            r.profile,
            r.confirmed,
            r.confirmed_at,
            r.marketing_consent,
            r.challenge,
            r.source,
            r.utm_source,
            r.utm_medium,
            r.utm_campaign,
          ]
            .map(escape)
            .join(","),
        ),
      ];
      return new NextResponse(lines.join("\n"), {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="paipers-waitlist.csv"`,
        },
      });
    }

    return NextResponse.json({
      ok: true,
      stats: {
        total,
        confirmed,
        unconfirmed,
        byProfile,
        marketing,
      },
      evolution,
      recent: rows.slice(0, 50),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
