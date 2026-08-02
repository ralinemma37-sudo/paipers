/**
 * GET /api/waitlist/count — nombre agrégé d’inscriptions confirmées uniquement.
 * Aucune donnée personnelle.
 */

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

const CACHE_TTL_MS = 45_000;
let cache: { count: number; at: number } | null = null;

export async function GET() {
  try {
    const now = Date.now();
    if (cache && now - cache.at < CACHE_TTL_MS) {
      return NextResponse.json(
        { count: cache.count },
        {
          headers: {
            "Cache-Control": "public, s-maxage=45, stale-while-revalidate=90",
          },
        },
      );
    }

    let supabase;
    try {
      supabase = getServiceSupabase();
    } catch {
      return NextResponse.json(
        { error: "service_unavailable" },
        { status: 503 },
      );
    }

    const { count, error } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .eq("confirmed", true);

    if (error) {
      return NextResponse.json({ error: "count_failed" }, { status: 500 });
    }

    const safeCount = typeof count === "number" && count >= 0 ? count : 0;
    cache = { count: safeCount, at: now };

    return NextResponse.json(
      { count: safeCount },
      {
        headers: {
          "Cache-Control": "public, s-maxage=45, stale-while-revalidate=90",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "count_failed" }, { status: 500 });
  }
}
