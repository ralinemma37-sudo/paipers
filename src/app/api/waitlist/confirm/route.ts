/**
 * GET /api/waitlist/confirm?token=… — double opt-in.
 * Après confirmation, le token est invalidé (rotation) sans migration schéma.
 * Confirmation atomique : UPDATE conditionnel sur le token original.
 * Aucune donnée personnelle dans la réponse ; le token n’est pas loggé.
 */

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getServiceSupabase } from "@/lib/supabaseAdmin";
import {
  clientIpFromRequest,
  getRateLimitStore,
  rateLimitExceededResponse,
  WAITLIST_RATE_LIMITS,
} from "@/lib/rateLimit";

export const runtime = "nodejs";

/** used_ + 64 hex ≈ 69 chars — colonne `text`, index unique. */
function invalidateTokenValue(): string {
  return `used_${randomBytes(32).toString("hex")}`;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = (url.searchParams.get("token") || "").trim();
    if (!token || token.length < 16 || token.startsWith("used_")) {
      return NextResponse.json(
        { ok: false, error: "Lien de confirmation invalide." },
        { status: 400 },
      );
    }

    const limiter = getRateLimitStore();
    const ip = clientIpFromRequest(req);
    const tokenPrefix = token.slice(0, 12);
    const ipHit = await limiter.hit(
      `waitlist:confirm:ip:${ip}`,
      WAITLIST_RATE_LIMITS.confirmPerIp.limit,
      WAITLIST_RATE_LIMITS.confirmPerIp.windowMs,
    );
    const tokenHit = await limiter.hit(
      `waitlist:confirm:tok:${tokenPrefix}`,
      WAITLIST_RATE_LIMITS.confirmPerTokenPrefix.limit,
      WAITLIST_RATE_LIMITS.confirmPerTokenPrefix.windowMs,
    );
    if (!ipHit.ok || !tokenHit.ok) {
      return rateLimitExceededResponse();
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

    // 1) Confirmation atomique : une seule requête gagne le token + confirmed=false.
    const { data: confirmedRow, error: confirmErr } = await supabase
      .from("waitlist")
      .update({
        confirmed: true,
        confirmed_at: new Date().toISOString(),
        confirmation_token: invalidateTokenValue(),
      })
      .eq("confirmation_token", token)
      .eq("confirmed", false)
      .select("id")
      .maybeSingle();

    if (confirmErr) {
      return NextResponse.json(
        { ok: false, error: "Impossible de confirmer pour le moment." },
        { status: 500 },
      );
    }
    if (confirmedRow) {
      return NextResponse.json({ ok: true, confirmed: true });
    }

    // 2) Déjà confirmé mais token encore présent (lignes legacy) → invalider sans PII.
    const { data: alreadyRow, error: alreadyErr } = await supabase
      .from("waitlist")
      .update({ confirmation_token: invalidateTokenValue() })
      .eq("confirmation_token", token)
      .eq("confirmed", true)
      .select("id")
      .maybeSingle();

    if (alreadyErr) {
      return NextResponse.json(
        { ok: false, error: "Impossible de confirmer pour le moment." },
        { status: 500 },
      );
    }
    if (alreadyRow) {
      return NextResponse.json({ ok: true, alreadyConfirmed: true });
    }

    // Token inconnu, déjà tourné, ou perdu en course concurrente → neutre.
    return NextResponse.json(
      { ok: false, error: "Lien expiré ou inconnu." },
      { status: 404 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: "Erreur serveur" },
      { status: 500 },
    );
  }
}
