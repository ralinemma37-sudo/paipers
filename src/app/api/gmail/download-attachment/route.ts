import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveEmailRefreshToken } from "@/lib/resolveEmailConnection";

async function getAccessToken(refreshToken: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error(
      "Configuration Google incomplète (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).",
    );
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      json?.error_description ||
        json?.error ||
        "Impossible de renouveler le jeton Gmail. Reconnecte Gmail dans Profil.",
    );
  }
  return json.access_token as string;
}

function base64UrlToUint8Array(b64url: string) {
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export async function POST(req: Request) {
  try {
    const { documentId } = await req.json();
    if (!documentId) {
      return NextResponse.json({ error: "Document manquant." }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        {
          error:
            "Configuration serveur incomplète : ajoute SUPABASE_SERVICE_ROLE_KEY dans .env.local, puis redémarre le serveur.",
        },
        { status: 503 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("id,user_id,gmail_email,gmail_message_id,gmail_attachment_id")
      .eq("id", documentId)
      .single();

    if (docErr || !doc) {
      return NextResponse.json({ error: "Document introuvable." }, { status: 404 });
    }

    if (!doc.gmail_message_id || !doc.gmail_attachment_id) {
      return NextResponse.json(
        { error: "Identifiants Gmail manquants sur ce document." },
        { status: 400 },
      );
    }

    // Connexion OAuth actuelle = external_connections (pas l’ancienne gmail_connections seule).
    const refreshToken = await resolveEmailRefreshToken(supabase, doc.user_id, "gmail", {
      accountEmail: doc.gmail_email,
    });

    if (!refreshToken) {
      return NextResponse.json(
        {
          error:
            "Aucune connexion Gmail trouvée. Va dans Profil → Gmail et reconnecte ton compte, puis réessaie.",
        },
        { status: 400 },
      );
    }

    const accessToken = await getAccessToken(refreshToken);

    const attRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${doc.gmail_message_id}/attachments/${doc.gmail_attachment_id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    const attJson = await attRes.json();
    if (!attRes.ok || !attJson?.data) {
      return NextResponse.json(
        { error: "Échec du téléchargement de la pièce jointe Gmail." },
        { status: 500 },
      );
    }

    const bytes = base64UrlToUint8Array(attJson.data);
    const filePath = `${doc.user_id}/${documentId}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, bytes, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    await supabase
      .from("documents")
      .update({
        file_path: filePath,
        is_ready: true,
        needs_review: false,
      })
      .eq("id", documentId);

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
