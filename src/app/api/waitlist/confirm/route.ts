/**
 * GET /api/waitlist/confirm?token=… — double opt-in.
 */

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = (url.searchParams.get("token") || "").trim();
    if (!token || token.length < 16) {
      return NextResponse.json(
        { ok: false, error: "Lien de confirmation invalide." },
        { status: 400 },
      );
    }

    let supabase;
    try {
      supabase = getServiceSupabase();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Service temporairement indisponible." },
        { status: 503 },
      );
    }

    const { data: row, error } = await supabase
      .from("waitlist")
      .select("id,confirmed,email")
      .eq("confirmation_token", token)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }
    if (!row) {
      return NextResponse.json(
        { ok: false, error: "Lien expiré ou inconnu." },
        { status: 404 },
      );
    }

    if (row.confirmed) {
      return NextResponse.json({ ok: true, alreadyConfirmed: true });
    }

    const { error: upErr } = await supabase
      .from("waitlist")
      .update({
        confirmed: true,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (upErr) {
      return NextResponse.json({ ok: false, error: upErr.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, confirmed: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
