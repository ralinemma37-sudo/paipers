/**
 * SEC-1 — POST /api/gmail/scan (cœur testable).
 *
 * Avant : aucune authentification ; le compte cible était le `userId` du corps de la requête ; avec la clé
 * serveur, la route utilisait sa connexion Gmail et créait des documents chez lui.
 * Après : compte cible = utilisateur de la session vérifiée ; `userId` différent dans le corps → 403
 * sans aucun effet. Logique de scan inchangée (24 h, PDF joints, curseur).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  authenticateRequest,
  jsonError,
  readJsonObject,
  type AuthDeps,
} from "@/lib/server/apiAuth";
import { exchangeGoogleRefreshToken, type GoogleCredentials } from "@/lib/server/routes/googleTokens";

export type GmailScanDeps = {
  auth: AuthDeps;
  getService: () => SupabaseClient | null;
  googleCredentials: () => GoogleCredentials;
  fetch: typeof fetch;
  now: () => Date;
};

type Att = { filename: string; attachmentId: string; mimeType: string };
type GmailPart = {
  filename?: unknown;
  mimeType?: unknown;
  body?: { attachmentId?: unknown };
  parts?: GmailPart[];
  headers?: Array<{ name?: unknown; value?: unknown }>;
};

function pickHeader(headers: GmailPart["headers"], name: string): string {
  const h = (headers || []).find((x) => String(x?.name).toLowerCase() === name.toLowerCase());
  return typeof h?.value === "string" ? h.value : "";
}

function collectPdfAttachments(payload: GmailPart | undefined): Att[] {
  const out: Att[] = [];
  const walk = (p: GmailPart | undefined) => {
    if (!p) return;
    const filename = String(p.filename || "");
    const mimeType = String(p.mimeType || "");
    const attachmentId = String(p?.body?.attachmentId || "");
    const isPdf = filename.toLowerCase().endsWith(".pdf") || mimeType === "application/pdf";
    if (attachmentId && filename && isPdf) {
      out.push({ filename, attachmentId, mimeType: mimeType || "application/pdf" });
    }
    if (Array.isArray(p.parts)) p.parts.forEach(walk);
  };
  walk(payload);
  return out;
}

async function getJson(fetchImpl: typeof fetch, url: string, accessToken: string): Promise<{ ok: boolean; json: unknown }> {
  const res = await fetchImpl(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, json };
}

export async function handleGmailScan(req: Request, deps: GmailScanDeps): Promise<Response> {
  const user = await authenticateRequest(req, deps.auth);
  if (!user) return jsonError(401, "unauthorized");

  const body = await readJsonObject(req, 16 * 1024);
  if (!body.ok) return body.response;
  const claimed = body.value.userId;
  if (claimed !== undefined && claimed !== null && claimed !== "" && claimed !== user.userId) {
    return jsonError(403, "forbidden");
  }
  const userId = user.userId;

  const supabase = deps.getService();
  if (!supabase) return jsonError(503, "unavailable");

  try {
    const { data: conn, error: connErr } = await supabase
      .from("gmail_connections")
      .select("user_id,email,refresh_token,last_history_id")
      .eq("user_id", userId)
      .maybeSingle();
    if (connErr) return jsonError(500, "internal_error");
    const c = conn as { email?: string | null; refresh_token?: string | null; last_history_id?: string | null } | null;
    if (!c?.refresh_token) return jsonError(400, "bad_request", { message: "Aucune connexion Gmail." });

    let accessToken: string;
    try {
      accessToken = await exchangeGoogleRefreshToken(deps.fetch, deps.googleCredentials(), c.refresh_token);
    } catch {
      return jsonError(502, "unavailable");
    }

    const profile = await getJson(deps.fetch, "https://gmail.googleapis.com/gmail/v1/users/me/profile", accessToken);
    if (!profile.ok) return jsonError(502, "unavailable");
    const currentHistoryId = String((profile.json as { historyId?: unknown })?.historyId || "");

    if (!c.last_history_id) {
      await supabase
        .from("gmail_connections")
        .update({ last_history_id: currentHistoryId, last_scanned_at: deps.now().toISOString() })
        .eq("user_id", userId);
      return Response.json({ created: 0, firstTime: true });
    }

    const list = await getJson(
      deps.fetch,
      "https://gmail.googleapis.com/gmail/v1/users/me/messages" +
        `?maxResults=20&q=${encodeURIComponent("has:attachment filename:pdf newer_than:1d")}`,
      accessToken,
    );
    if (!list.ok) return jsonError(502, "unavailable");
    const messages = ((list.json as { messages?: Array<{ id?: unknown }> })?.messages ?? []) as Array<{ id?: unknown }>;

    let created = 0;
    for (const m of messages) {
      const msgId = typeof m?.id === "string" ? m.id : "";
      if (!msgId) continue;

      const msg = await getJson(
        deps.fetch,
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(msgId)}?format=full`,
        accessToken,
      );
      if (!msg.ok) continue;
      const payload = (msg.json as { payload?: GmailPart })?.payload;
      const headers = payload?.headers || [];
      const subject = pickHeader(headers, "Subject") || "Document Gmail";
      const from = pickHeader(headers, "From") || "";
      const date = pickHeader(headers, "Date") || "";

      for (const att of collectPdfAttachments(payload)) {
        const { data: existing } = await supabase
          .from("documents")
          .select("id")
          .eq("user_id", userId)
          .eq("gmail_message_id", msgId)
          .eq("gmail_attachment_id", att.attachmentId)
          .limit(1);
        if (Array.isArray(existing) && existing.length > 0) continue;

        const { error: insErr } = await supabase.from("documents").insert({
          user_id: userId,
          title: att.filename || subject,
          needs_review: true,
          is_ready: false,
          source: "gmail",
          gmail_email: c.email ?? null,
          gmail_message_id: msgId,
          gmail_attachment_id: att.attachmentId,
          metadata: { from, date, subject },
        });
        if (!insErr) created += 1;
      }
    }

    await supabase
      .from("gmail_connections")
      .update({ last_history_id: currentHistoryId, last_scanned_at: deps.now().toISOString() })
      .eq("user_id", userId);

    return Response.json({ created });
  } catch {
    return jsonError(500, "internal_error");
  }
}
