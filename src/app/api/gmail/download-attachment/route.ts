import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const API_VERSION = "sanitize-v2-2026-02-15";

export async function GET() {
  return NextResponse.json({ ok: true, version: API_VERSION });
}

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

// ✅ filename safe pour Storage
function sanitizeFilename(name: string) {
  const fallback = "piece-jointe.pdf";
  const s = String(name || "").trim();
  if (!s) return fallback;

  const dot = s.lastIndexOf(".");
  const ext = dot > 0 && dot < s.length - 1 ? s.slice(dot).toLowerCase() : "";
  const base = dot > 0 ? s.slice(0, dot) : s;

  const ascii = base
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "");

  let clean = ascii.replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  if (!clean) clean = "piece-jointe";
  clean = clean.slice(0, 80);

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

    const { data: doc } = await supabase
      .from("documents")
      .select("id,user_id,gmail_email")
      .eq("id", documentId)
      .single();

    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });
    if (!doc.gmail_email) {
      return NextResponse.json({ error: "Missing gmail_email on document" }, { status: 400 });
    }

    const { data: conn } = await supabase
      .from("gmail_connections")
      .select("refresh_token,last_processed_message_id")
      .eq("email", doc.gmail_email)
      .maybeSingle();

    if (!conn?.refresh_token) {
      return NextResponse.json({ error: "No refresh token for this Gmail" }, { status: 400 });
    }

    const accessToken = await getAccessToken(conn.refresh_token);

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

    const lastProcessed = conn.last_processed_message_id as string | null;

    for (const m of messages) {
      const msgId = m.id;
      if (!msgId) continue;
      if (lastProcessed && msgId === lastProcessed) continue;

      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const msgJson = await msgRes.json();
      if (!msgRes.ok) continue;

      const parts = collectAttachmentParts(msgJson?.payload);
      if (parts.length === 0) continue;

      const first = parts[0];
      const originalFilename = first.filename || "piece-jointe.pdf";
      const filename = sanitizeFilename(originalFilename);

      const attachmentId = first.body?.attachmentId;
      const mimeType = first.mimeType || "application/octet-stream";
      if (!attachmentId) continue;

      const attRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}/attachments/${attachmentId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const attJson = await attRes.json();
      if (!attRes.ok || !attJson?.data) continue;

      const bytes = base64UrlToUint8Array(attJson.data);

      const filePath = `${doc.user_id}/${documentId}_${filename}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, bytes, { contentType: mimeType, upsert: true });

      if (uploadError) {
        return NextResponse.json(
          { error: `Upload error: ${uploadError.message}`, version: API_VERSION, filePath },
          { status: 500 }
        );
      }

      await supabase
        .from("documents")
        .update({
          title: originalFilename,
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

      await supabase
        .from("gmail_connections")
        .update({ last_processed_message_id: msgId })
        .eq("email", doc.gmail_email);

      return NextResponse.json({ success: true, version: API_VERSION, filePath, originalFilename });
    }

    return NextResponse.json(
      { error: "Aucune pièce jointe téléchargeable trouvée.", version: API_VERSION },
      { status: 500 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error", version: API_VERSION },
      { status: 500 }
    );
  }
}
