/**
 * POST /api/waitlist/join — inscription liste d’attente + email double opt-in.
 */

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getAppBaseUrl, getServiceSupabase } from "@/lib/supabaseAdmin";
import { sendWaitlistConfirmEmail } from "@/lib/waitlist/email";
import {
  isValidEmail,
  normalizeEmail,
  type WaitlistProfile,
} from "@/lib/waitlist/types";

export const runtime = "nodejs";

type Body = {
  firstName?: string;
  email?: string;
  profile?: string;
  challenge?: string;
  marketingConsent?: boolean;
  source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

const PROFILES = new Set<WaitlistProfile>([
  "particulier",
  "professionnel",
  "les_deux",
]);

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const email = normalizeEmail(body.email || "");
    const firstName = (body.firstName || "").trim().slice(0, 80) || null;
    const profile = (body.profile || "") as WaitlistProfile;
    const challenge = (body.challenge || "").trim().slice(0, 2000) || null;
    const marketingConsent = Boolean(body.marketingConsent);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Adresse email invalide." },
        { status: 400 },
      );
    }
    if (!PROFILES.has(profile)) {
      return NextResponse.json(
        { error: "Choisis un profil (Particulier, Professionnel ou Les deux)." },
        { status: 400 },
      );
    }

    let supabase;
    try {
      supabase = getServiceSupabase();
    } catch {
      return NextResponse.json(
        {
          error:
            "Service temporairement indisponible (configuration serveur).",
        },
        { status: 503 },
      );
    }

    const { data: existing } = await supabase
      .from("waitlist")
      .select(
        "id,email,confirmed,confirmation_token,first_name,marketing_consent",
      )
      .ilike("email", email)
      .maybeSingle();

    const baseUrl = getAppBaseUrl(req);

    if (existing?.confirmed) {
      return NextResponse.json({
        ok: true,
        alreadyConfirmed: true,
        message:
          "Cette adresse est déjà inscrite et confirmée. Merci pour ton intérêt !",
      });
    }

    let token = existing?.confirmation_token as string | undefined;
    if (!token) token = randomBytes(32).toString("hex");

    if (existing) {
      const { error: upErr } = await supabase
        .from("waitlist")
        .update({
          first_name: firstName ?? existing.first_name,
          profile,
          challenge,
          marketing_consent: marketingConsent,
          launch_notification: true,
          confirmation_token: token,
          source: (body.source || "landing").slice(0, 80),
          utm_source: body.utm_source?.slice(0, 120) || null,
          utm_medium: body.utm_medium?.slice(0, 120) || null,
          utm_campaign: body.utm_campaign?.slice(0, 120) || null,
        })
        .eq("id", existing.id);

      if (upErr) {
        return NextResponse.json({ error: upErr.message }, { status: 500 });
      }
    } else {
      const { error: insErr } = await supabase.from("waitlist").insert({
        first_name: firstName,
        email,
        profile,
        challenge,
        marketing_consent: marketingConsent,
        launch_notification: true,
        confirmed: false,
        confirmation_token: token,
        source: (body.source || "landing").slice(0, 80),
        utm_source: body.utm_source?.slice(0, 120) || null,
        utm_medium: body.utm_medium?.slice(0, 120) || null,
        utm_campaign: body.utm_campaign?.slice(0, 120) || null,
      });

      if (insErr) {
        if (insErr.code === "23505") {
          return NextResponse.json({
            ok: true,
            alreadyRegistered: true,
            message:
              "Cette adresse est déjà inscrite. Vérifie ta boîte mail pour confirmer.",
          });
        }
        return NextResponse.json({ error: insErr.message }, { status: 500 });
      }
    }

    const confirmUrl = `${baseUrl}/waitlist/confirm?token=${encodeURIComponent(token)}`;
    const mail = await sendWaitlistConfirmEmail({
      to: email,
      firstName,
      confirmUrl,
    });

    const payload: Record<string, unknown> = {
      ok: true,
      message:
        "Presque terminé : confirme ton inscription via l’email que nous venons d’envoyer.",
      emailSent: mail.ok,
    };

    if (!mail.ok) {
      payload.emailWarning =
        mail.error === "email_not_configured"
          ? "Email de confirmation non configuré sur le serveur. Ton inscription est enregistrée."
          : "L’email n’a pas pu être envoyé. Réessaie dans quelques minutes.";
      if (process.env.NODE_ENV !== "production") {
        payload.devConfirmUrl = confirmUrl;
      }
    }

    return NextResponse.json(payload);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
