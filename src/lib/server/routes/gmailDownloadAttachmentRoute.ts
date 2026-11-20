/**
 * SEC-1 — POST /api/gmail/download-attachment (cœur testable).
 *
 * Avant : aucune authentification ; avec la clé serveur, utilisait le jeton Gmail du propriétaire de
 * n'importe quel document et écrivait dans son stockage.
 * Après : session vérifiée → identifiant valide → le document doit appartenir à l'appelant
 * (sinon réponse identique à « introuvable ») → seulement ensuite, Gmail et stockage.
 * Appelant légitime : src/app/dashboard/page.tsx (même site : cookies envoyés).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  authenticateRequest,
  jsonError,
  readJsonObject,
  UUID_RE,
  type AuthDeps,
} from "@/lib/server/apiAuth";
import { exchangeGoogleRefreshToken, type GoogleCredentials } from "@/lib/server/routes/googleTokens";

export type GmailDownloadAttachmentDeps = {
  auth: AuthDeps;
  /** null si la configuration serveur (URL / clé serveur) est absente. */
  getService: () => SupabaseClient | null;
  resolveRefreshToken: (
    supabase: SupabaseClient,
    userId: string,
    accountEmail: string | null,
  ) => Promise<string | null>;
  googleCredentials: () => GoogleCredentials;
  fetch: typeof fetch;
};

const NOT_FOUND_MESSAGE = "Document introuvable.";

function base64UrlToUint8Array(b64url: string) {
  const pad = "=".repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

type DocRow = {
  id: string;
  user_id: string;
  gmail_email: string | null;
  gmail_message_id: string | null;
  gmail_attachment_id: string | null;
};

export async function handleGmailDownloadAttachment(
  req: Request,
  deps: GmailDownloadAttachmentDeps,
): Promise<Response> {
  const user = await authenticateRequest(req, deps.auth);
  if (!user) return jsonError(401, "unauthorized");

  const body = await readJsonObject(req, 16 * 1024);
  if (!body.ok) return body.response;
  const documentId = body.value.documentId;
  if (documentId === undefined || documentId === null || documentId === "") {
    return jsonError(400, "bad_request", { message: "Document manquant." });
  }
  if (typeof documentId !== "string" || !UUID_RE.test(documentId)) {
    return jsonError(404, "not_found", { message: NOT_FOUND_MESSAGE });
  }

  const supabase = deps.getService();
  if (!supabase) return jsonError(503, "unavailable");

  try {
    // Propriété vérifiée DANS la requête : un document d'un autre compte est « introuvable ».
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("id,user_id,gmail_email,gmail_message_id,gmail_attachment_id")
      .eq("id", documentId)
      .eq("user_id", user.userId)
      .maybeSingle();
    if (docErr || !doc) return jsonError(404, "not_found", { message: NOT_FOUND_MESSAGE });

    const row = doc as DocRow;
    if (row.user_id !== user.userId) return jsonError(404, "not_found", { message: NOT_FOUND_MESSAGE });

    if (!row.gmail_message_id || !row.gmail_attachment_id) {
      return jsonError(400, "bad_request", { message: "Identifiants Gmail manquants sur ce document." });
    }

    const refreshToken = await deps.resolveRefreshToken(supabase, user.userId, row.gmail_email);
    if (!refreshToken) {
      return jsonError(400, "bad_request", {
        message: "Aucune connexion Gmail trouvée. Va dans Profil → Gmail et reconnecte ton compte, puis réessaie.",
      });
    }

    let accessToken: string;
    try {
      accessToken = await exchangeGoogleRefreshToken(deps.fetch, deps.googleCredentials(), refreshToken);
    } catch {
      return jsonError(502, "unavailable", {
        message: "Impossible de renouveler l'accès Gmail. Reconnecte Gmail dans Profil.",
      });
    }

    const attRes = await deps.fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(row.gmail_message_id)}/attachments/${encodeURIComponent(row.gmail_attachment_id)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );
    const attJson = (await attRes.json().catch(() => ({}))) as { data?: unknown };
    if (!attRes.ok || typeof attJson.data !== "string" || !attJson.data) {
      return jsonError(502, "unavailable", { message: "Échec du téléchargement de la pièce jointe Gmail." });
    }

    const bytes = base64UrlToUint8Array(attJson.data);
    const filePath = `${user.userId}/${row.id}.pdf`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, bytes, { contentType: "application/pdf", upsert: true });
    if (uploadError) return jsonError(500, "internal_error");

    const { error: updateError } = await supabase
      .from("documents")
      .update({ file_path: filePath, is_ready: true, needs_review: false })
      .eq("id", row.id)
      .eq("user_id", user.userId);
    if (updateError) return jsonError(500, "internal_error");

    return Response.json({ success: true });
  } catch {
    return jsonError(500, "internal_error");
  }
}
