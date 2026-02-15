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
  if (!res.ok) throw new Error(`Google token error: ${JSON.stringify(json)}`);
  return json.access_token as string;
}

function pickHeader(headers: any[] | undefined, name: string) {
  const h = (headers || []).find((x) => String(x?.name).toLowerCase() === name.toLowerCase());
  return h?.value ?? "";
}

function hasPdfAttachment(payload: any): boolean {
  let found = false;
  const walk = (p: any) => {
    if (!p || found) return;
    const filename = String(p.filename || "");
    const mimeType = String(p.mimeType || "");
    const hasAtt = !!p?.body?.attachmentId;
    if (hasAtt && (filename.toLowerCase().endsWith(".pdf") || mimeType === "application/pdf")) {
      found = true;
      return;
    }
    if (Array.isArray(p.parts)) p.parts.forEach(walk);
  };
  walk(payload);
  return found;
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

    // 1) récupérer la connexion gmail du user
    const { data: conn, error: connErr } = await supabase
      .from("gmail_connections")
      .select("user_id,email,refresh_token")
      .eq("user_id", userId)
      .maybeSingle();

    if (connErr) return NextResponse.json({ error: connErr.message }, { status: 500 });
    if (!conn?.refresh_token) return NextResponse.json({ error: "No gmail connection" }, { status: 400 });

    const accessToken = await getAccessToken(conn.refresh_token);

    // 2) lister messages récents avec PJ
    const listRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=20&q=has:attachment%20newer_than:14d",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const listJson = await listRes.json();
    if (!listRes.ok) {
      return NextResponse.json({ error: `Gmail list error: ${JSON.stringify(listJson)}` }, { status: 500 });
    }

    const messages: { id: string }[] = listJson?.messages ?? [];
    if (messages.length === 0) return NextResponse.json({ created: 0 });

    let created = 0;

    // 3) pour chaque message: check PDF + insert si pas déjà vu
    for (const m of messages) {
      if (!m?.id) continue;

      // skip si déjà dans documents
      const { data: existing } = await supabase
        .from("documents")
        .select("id")
        .eq("user_id", userId)
        .eq("gmail_message_id", m.id)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const msgRes = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=full`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const msgJson = await msgRes.json();
      if (!msgRes.ok) continue;

      if (!hasPdfAttachment(msgJson?.payload)) continue;

      const headers = msgJson?.payload?.headers || [];
      const subject = pickHeader(headers, "Subject") || "Document Gmail";
      const from = pickHeader(headers, "From") || "";
      const date = pickHeader(headers, "Date") || "";

      const { error: insErr } = await supabase.from("documents").insert({
        user_id: userId,
        title: subject,
        needs_review: true,
        is_ready: false,
        source: "gmail",
        gmail_email: conn.email,
        gmail_message_id: m.id,
        metadata: { from, date },
      });

      if (!insErr) created += 1;
    }

    return NextResponse.json({ created });
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
