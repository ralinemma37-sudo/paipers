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
  if (!res.ok) throw new Error(`Google token error`);
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
      return NextResponse.json({ error: "Missing documentId" }, { status: 400 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1️⃣ Récupérer le document exact
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("id,user_id,gmail_email,gmail_message_id,gmail_attachment_id")
      .eq("id", documentId)
      .single();

    if (docErr || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (!doc.gmail_message_id || !doc.gmail_attachment_id) {
      return NextResponse.json(
        { error: "Missing Gmail identifiers on document" },
        { status: 400 }
      );
    }

    // 2️⃣ Récupérer refresh token
    const { data: conn } = await supabase
      .from("gmail_connections")
      .select("refresh_token")
      .eq("email", doc.gmail_email)
      .maybeSingle();

    if (!conn?.refresh_token) {
      return NextResponse.json({ error: "No Gmail connection" }, { status: 400 });
    }

    const accessToken = await getAccessToken(conn.refresh_token);

    // 3️⃣ Télécharger EXACTEMENT la bonne pièce jointe
    const attRes = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${doc.gmail_message_id}/attachments/${doc.gmail_attachment_id}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const attJson = await attRes.json();
    if (!attRes.ok || !attJson?.data) {
      return NextResponse.json({ error: "Attachment download failed" }, { status: 500 });
    }

    const bytes = base64UrlToUint8Array(attJson.data);

    const filePath = `${doc.user_id}/${documentId}.pdf`;

    // 4️⃣ Upload storage (pas d'upsert)
    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, bytes, { contentType: "application/pdf" });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // 5️⃣ Update document
    await supabase
      .from("documents")
      .update({
        file_path: filePath,
        is_ready: true,
        needs_review: false,
      })
      .eq("id", documentId);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
