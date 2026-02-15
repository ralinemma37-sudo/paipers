import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

async function getAccessToken(refreshToken: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(`Google token error: ${JSON.stringify(json)}`);
  return json.access_token as string;
}

// Gmail = base64url
function base64UrlToUint8Array(b64url: string) {
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function collectAttachmentParts(payload: any) {
  const out: any[] = [];
  const walk = (p: any) => {
    if (!p) return;
    if (p.filename && p.body?.attachmentId) out.push(p);
    if (Array.isArray(p.parts)) p.parts.forEach(walk);
  };
  walk(payload);
  return out;
}

// ✅ IMPORTANT: rend un nom safe pour Supabase Storage
function sanitizeFilename(name: string) {
  const fallback = "piece-jointe.pdf";
  const s = String(name || "").trim();
  if (!s) return fallback;

  // garde une extension si possible
  const dot = s.lastIndexOf(".");
  const ext = dot > 0 && dot < s.length - 1 ? s.slice(dot).toLowerCase() : "";
  const base = dot > 0 ? s.slice(0, dot) : s;

  // enlève accents + caractères non ASCII
  const ascii = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // diacritiques
    .replace(/[^\x00-\x7F]/g, ""); // non-ascii

  // remplace tout ce qui n'est pas alphanum par _
  let clean = ascii.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");

  if (!clean) clean = "piece-jointe";

  // limite longueur
  clean = clean.slice(0, 80);

  // extension safe
  const safeExt = ext && /^[.][a-z0-9]{1,10}$/.test(ext) ? ext : "";

  return clean + safeExt;
}

export async function POST(req: Request) {
  try {
    const { documentId } = await req.json();
    if (!documentId) {
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1) récupérer la notif en attente
    const { data: doc } = await supabase
      .from("documents")
      .select("id,user_id,gmail_email")
      .eq("id", documentId)
      .single();

    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (!doc.gmail_email) {
      return NextResponse.json({ error: "Missing gmail_email on document" }, { status: 400 });
    }

    // 2) récupérer refresh_token + last_processed_message_id
    const { data: conn } = await supabase
      .from("gmail_connections")
      .select("refresh_token,last_processed_message_id")
      .eq("email", doc.gmail_email)
      .maybeSingle();

    if (!conn?.refresh_token) {
      return NextResponse.json({ error: "No refresh token for this Gmail" }, { status: 400 });
    }

    const accessToken = await getAccessToken(conn.refresh_token);

    // 3) récupérer les derniers emails avec PJ (simple MVP)
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=15&q=has:attachment%20newer_than:7d",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const listJson = await listRes.json();
    if (!listRes.ok) {
      return NextResponse.json(
        { error: `Gmail list error: ${JSON.stringify(listJson)}` },
        { status: 500 }
      );
    }

    const messages = listJson?.messages ?? [];
    if (messages.length === 0) {
      return NextResponse.json({ error: "Aucun email avec pièce jointe trouvé." }, { status: 500 });
    }

    // 4) Choisir un message "nouveau"
    const lastProcessed = conn.last_processed_message_id as string | null;

    for (const m of messages) {
      const msgId = m.id;
      if (!msgId) continue;

      if (lastProcessed && msgId === lastProcessed) {
        continue;
      }

      // 5) récupérer le message complet
      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const msgJson = await msgRes.json();
      if (!msgRes.ok) continue;

      const parts = collectAttachmentParts(msgJson?.payload);
      if (parts.length === 0) continue;

      // on prend la 1ère pièce jointe (MVP)
      const first = parts[0];
      const originalFilename = first.filename || "piece-jointe.pdf";
      const filename = sanitizeFilename(originalFilename);
      const attachmentId = first.body?.attachmentId;
      const mimeType = first.mimeType || "application/octet-stream";
      if (!attachmentId) continue;

      // 6) télécharger la PJ
      const attRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}/attachments/${attachmentId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const attJson = await attRes.json();
      if (!attRes.ok || !attJson?.data) continue;

      const bytes = base64UrlToUint8Array(attJson.data);

      // 7) upload storage
      const filePath = `${doc.user_id}/${documentId}_${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, bytes, { contentType: mimeType, upsert: true });

      if (uploadError) {
        return NextResponse.json({ error: `Upload error: ${uploadError.message}` }, { status: 500 });
      }

      // 8) update document
      await supabase
        .from("documents")
        .update({
          title: originalFilename, // on garde le nom original pour l’UI
          original_filename: originalFilename,
          mime_type: mimeType,
          file_path: filePath,
          is_ready: true,
          needs_review: false,
          source: "gmail",
          category: "autres",
          gmail_message_id: msgId,
          gmail_attachment_id: attachmentId,
        })
        .eq("id", documentId);

      // 9) éviter de reprendre le même email
      await supabase
        .from("gmail_connections")
        .update({ last_processed_message_id: msgId })
        .eq("email", doc.gmail_email);

      return NextResponse.json({ success: true, filePath, filename, originalFilename });
    }

    return NextResponse.json(
      { error: "Impossible de trouver une pièce jointe téléchargeable (dans les 15 derniers emails avec PJ)." },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
