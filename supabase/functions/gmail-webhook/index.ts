import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

async function getAccessToken(refreshToken: string) {
  const client_id = Deno.env.get("GOOGLE_CLIENT_ID") || "";
  const client_secret = Deno.env.get("GOOGLE_CLIENT_SECRET") || "";

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id,
      client_secret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const json = await res.json();
  if (!res.ok) throw new Error("Google token error");
  return json.access_token as string;
}

async function gmailHistoryList(accessToken: string, startHistoryId: string) {
  const url =
    "https://gmail.googleapis.com/gmail/v1/users/me/history" +
    `?startHistoryId=${encodeURIComponent(startHistoryId)}` +
    `&historyTypes=messageAdded`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  const json = await res.json();
  if (!res.ok) throw new Error("Gmail history error");

  const history = json?.history ?? [];
  const ids = new Set<string>();

  for (const h of history) {
    const msgs = h?.messages ?? [];
    for (const m of msgs) {
      if (m?.id) ids.add(String(m.id));
    }
  }

  return Array.from(ids);
}

async function gmailGetMessageFull(accessToken: string, msgId: string) {
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msgId}?format=full`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const json = await res.json();
  if (!res.ok) throw new Error("Gmail message error");
  return json;
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("gmail-webhook running ✅", { status: 200 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRole);

  const bodyText = await req.text();
  let body: any;
  try {
    body = JSON.parse(bodyText);
  } catch {
    return new Response("OK", { status: 200 });
  }

  const pubsubData = body?.message?.data;
  if (!pubsubData) return new Response("OK", { status: 200 });

  let decoded: any;
  try {
    decoded = JSON.parse(atob(pubsubData));
  } catch {
    return new Response("OK", { status: 200 });
  }

  const emailAddress = decoded?.emailAddress as string | undefined;
  const newHistoryId = String(decoded?.historyId || "");
  if (!emailAddress || !newHistoryId) return new Response("OK", { status: 200 });

  const { data: conn } = await supabase
    .from("gmail_connections")
    .select("user_id,email,refresh_token,last_history_id")
    .eq("email", emailAddress)
    .maybeSingle();

  if (!conn?.user_id || !conn?.refresh_token) return new Response("OK", { status: 200 });

  const userId = String(conn.user_id);
  const lastHistoryId =
    !conn.last_history_id || conn.last_history_id === "0"
      ? ""
      : String(conn.last_history_id);

  // Si jamais pas initialisé → on initialise proprement
  if (!lastHistoryId) {
    await supabase
      .from("gmail_connections")
      .update({ last_history_id: newHistoryId })
      .eq("email", emailAddress);

    console.log("Cursor initialized for", emailAddress);
    return new Response("OK", { status: 200 });
  }

  try {
    const accessToken = await getAccessToken(String(conn.refresh_token));
    const messageIds = await gmailHistoryList(accessToken, lastHistoryId);

    for (const msgId of messageIds) {
      const msg = await gmailGetMessageFull(accessToken, msgId);

      const headers = msg?.payload?.headers || [];
      const subject = pickHeader(headers, "Subject") || "Document Gmail";
      const from = pickHeader(headers, "From") || "";
      const date = pickHeader(headers, "Date") || "";

      const pdfs = collectPdfAttachments(msg?.payload);
      if (pdfs.length === 0) continue;

      for (const att of pdfs) {
        await supabase.from("documents").insert({
          user_id: userId,
          title: att.filename || subject,
          original_filename: att.filename || null,
          source: "gmail",
          category: null,
          needs_review: true,
          is_ready: false,
          file_path: null,
          gmail_email: emailAddress,
          gmail_message_id: msgId,
          gmail_attachment_id: att.attachmentId,
          metadata: { from, date, subject },
        });
      }
    }

    await supabase
      .from("gmail_connections")
      .update({ last_history_id: newHistoryId })
      .eq("email", emailAddress);
  } catch (e) {
    console.log("History reset for", emailAddress);

    await supabase
      .from("gmail_connections")
      .update({ last_history_id: newHistoryId })
      .eq("email", emailAddress);
  }

  return new Response("OK", { status: 200 });
});
