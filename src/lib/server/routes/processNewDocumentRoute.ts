/**
 * SEC-1 — POST /api/process-new-document (cœur testable). Webhook de base de données (supposé).
 *
 * Avant : aucune authentification ; avec la clé serveur, lisait, faisait classer par l'IA et
 * RÉÉCRIVAIT n'importe quel document à partir de son identifiant, et renvoyait titre et catégorie.
 *
 * Après :
 * - secret de webhook OBLIGATOIRE : en-tête `x-plaidoc-webhook-secret` comparé à temps constant à la
 *   variable serveur PROCESS_NEW_DOCUMENT_WEBHOOK_SECRET ; variable absente → refus systématique (503) ;
 * - charge utile validée (table public.documents, identifiant uuid) ;
 * - quota IA appliqué au propriétaire du document ;
 * - classement appelé directement (plus d'appel HTTP vers /api/classify-document, désormais protégé) ;
 * - réponse réduite à { ok: true } : ni titre, ni catégorie, ni message interne.
 *
 * PRÉREQUIS DE DÉPLOIEMENT COORDONNÉ : si un webhook Supabase appelle cette route, il faudra
 * (1) créer le secret dans Vercel, (2) ajouter le même en-tête au webhook. Sans cela, la route refuse tout.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  enforceAiQuota,
  jsonError,
  readJsonObject,
  safeEqualSecret,
  UUID_RE,
  type QuotaDeps,
} from "@/lib/server/apiAuth";
import type { ClassifyResult } from "@/lib/server/classifyWithOpenAI";

export const WEBHOOK_SECRET_HEADER = "x-plaidoc-webhook-secret";

export type ProcessNewDocumentDeps = {
  /** Secret attendu (variable serveur) ; undefined ou vide → route fermée. */
  webhookSecret: () => string | undefined;
  getService: () => SupabaseClient;
  quota: QuotaDeps;
  extractText: (mime: string, filename: string, ab: ArrayBuffer) => Promise<string>;
  classify: (params: { fileName: string; extractedText: string }) => Promise<ClassifyResult>;
};

type DocRow = {
  id: string;
  user_id: string;
  title: string | null;
  file_path: string | null;
  mime_type: string | null;
  original_filename: string | null;
  is_ready: boolean | null;
};

const OK = () => Response.json({ ok: true });

export async function handleProcessNewDocument(req: Request, deps: ProcessNewDocumentDeps): Promise<Response> {
  const expected = (deps.webhookSecret() ?? "").trim();
  if (!expected) return jsonError(503, "unavailable");
  if (!safeEqualSecret(req.headers.get(WEBHOOK_SECRET_HEADER), expected)) {
    return jsonError(401, "unauthorized");
  }

  const body = await readJsonObject(req, 256 * 1024);
  if (!body.ok) return body.response;

  const p = body.value as { type?: unknown; table?: unknown; schema?: unknown; record?: unknown };
  if (p.type !== "INSERT" && p.type !== "UPDATE" && p.type !== "DELETE") return jsonError(400, "bad_request");
  if (p.type === "DELETE") return OK();
  if (p.table !== "documents" || p.schema !== "public") return jsonError(400, "bad_request");
  const docId = (p.record as { id?: unknown } | null | undefined)?.id;
  if (typeof docId !== "string" || !UUID_RE.test(docId)) return jsonError(400, "bad_request");

  try {
    const supabase = deps.getService();

    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("id, user_id, title, file_path, mime_type, original_filename, is_ready")
      .eq("id", docId)
      .maybeSingle();
    if (docErr || !doc) return jsonError(404, "not_found");

    const row = doc as DocRow;
    if (!row.is_ready || !row.file_path) return OK();

    const denied = await enforceAiQuota(deps.quota, row.user_id, "web_webhook_classify");
    if (denied) return denied;

    const { data: file, error: dlErr } = await supabase.storage.from("documents").download(row.file_path);
    if (dlErr || !file) return jsonError(500, "internal_error");

    const extractedText = await deps.extractText(
      row.mime_type || "",
      row.original_filename || "",
      await file.arrayBuffer(),
    );

    const { category, title } = await deps.classify({
      fileName: row.original_filename || row.title || "document",
      extractedText,
    });

    const { error: upErr } = await supabase.from("documents").update({ title, category }).eq("id", row.id);
    if (upErr) return jsonError(500, "internal_error");

    return OK();
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "openai_not_configured") return jsonError(503, "unavailable");
    return jsonError(500, "internal_error");
  }
}
