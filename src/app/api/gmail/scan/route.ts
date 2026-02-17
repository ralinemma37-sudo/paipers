import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

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
  if (!res.ok) throw new Error("Google token error");
  return json.access_token as string;
}

type Att = { filename: string; attachmentId: string; mimeType: string };

function pickHeader(headers: any[] | undefined, name: string) {
  const h = (headers || []).find(
    (x) => String(x?.name).toLowerCase() === name.toLowerCase()
  );
  return h?.value ?? "";
}

function collectPdfAttachments(payload: any): Att[] {
  const out: Att[] = [];
  const walk = (p: any) => {
    if (!p) return;

    const filename = String(p.filename || "");
    const mimeType = String(p.mimeType || "");
    const attachmentId = String(p?.body?.attachmentId || "");

    const isPdf =
      filename.toLowerCase().endsWith(".pdf") || mimeType === "application/pdf";

    if (attachmentId && filename && isPdf) {
      out.push({ filename, attachmentId, mimeType: mimeType || "application/pdf" });
    }

    if (Array.isArray(p.parts)) p.parts.forEach(walk);
  };
  walk(payload);
  return out;
}

async function gmailGetProfile(accessToken: string) {
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error("Gmail profile error");
  return json as { historyId: string };
}

async function gmailListMessages(accessToken: string, q: string, maxResults = 20) {
  const url =
    "https://gmail.googleapis.com/gmail/v1/users/me/messages" +
    `?maxResults=${maxResults}` +
    `&q=${encodeURIComponent(q)}`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const json = await res.json();
  if (!res.ok) throw new Error("Gmail list error");
  return (json?.messages ?? []) as { id: string }[];
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = String(body?.userId || "");
    if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: conn, error: connErr } = await supabase
      .from("gmail_connections")
      .select("user_id,email,refresh_token,last_history_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (connErr) return NextResponse.json({ error: connErr.message }, { status: 500 });
    if (!conn?.refresh_token) return NextResponse.json({ error: "No gmail connection" }, { status: 400 });

    const accessToken = await getAccessToken(conn.refresh_token);

    // 1) Lire le historyId actuel
    const profile = await gmailGetProfile(accessToken);
    const currentHistoryId = String(profile.historyId || "");

    // 2) PREMIÈRE FOIS : on enregistre et on NE remonte RIEN (évite les vieux emails)
    if (!conn.last_history_id) {
      await supabase
        .from("gmail_connections")
        .update({ last_history_id: currentHistoryId, last_scanned_at: new Date().toISOString() })
        .eq("user_id", userId);

      return NextResponse.json({ created: 0, firstTime: true });
    }

    // 3) Mode MVP “nouveaux seulement” :
    // on ne prend que les emails récents (24h) + PDF + attachment
    // (simple, robuste, pas de vieux spam)
    const messages = await gmailListMessages(
      accessToken,
      "has:attachment filename:pdf newer_than:1d",
      20
    );

    let created = 0;

    for (const m of messages) {
      const msgId = m?.id;
      if (!msgId) continue;

      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const msgJson = await msgRes.json();
      if (!msgRes.ok) continue;

      const headers = msgJson?.payload?.headers || [];
      const subject = pickHeader(headers, "Subject") || "Document Gmail";
      const from = pickHeader(headers, "From") || "";
      const date = pickHeader(headers, "Date") || "";

      const pdfs = collectPdfAttachments(msgJson?.payload);
      if (pdfs.length === 0) continue;

      for (const att of pdfs) {
        const { data: existing } = await supabase
          .from("documents")
          .select("id")
          .eq("user_id", userId)
          .eq("gmail_message_id", msgId)
          .eq("gmail_attachment_id", att.attachmentId)
          .limit(1);

        if (existing && existing.length > 0) continue;

        const { error: insErr } = await supabase.from("documents").insert({
          user_id: userId,
          title: att.filename || subject,
          needs_review: true,
          is_ready: false,
          source: "gmail",
          gmail_email: conn.email,
          gmail_message_id: msgId,
          gmail_attachment_id: att.attachmentId,
          metadata: { from, date, subject },
        });

        if (!insErr) created += 1;
      }
    }

    // 4) On avance le curseur
    await supabase
      .from("gmail_connections")
      .update({ last_history_id: currentHistoryId, last_scanned_at: new Date().toISOString() })
      .eq("user_id", userId);

    return NextResponse.json({ created });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
