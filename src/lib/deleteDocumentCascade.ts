/**
 * Suppression documentaire web — même contrat que le mobile.
 * RPC `delete_document_cascade` d’abord ; Storage seulement si
 * remaining_reference_count === 0. Aucun DELETE direct, aucun repli.
 */

import { supabase } from "@/lib/supabase";

export const DELETE_DOCUMENT_CASCADE_FN = "delete_document_cascade";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const DOCUMENT_DELETION_RETRY_USER_MESSAGE =
  "La suppression est temporairement indisponible. Réessayez dans quelques instants.";

export type DeleteDocumentCascadeArgs = {
  p_user_id: string;
  p_document_id: string;
};

export type DeleteDocumentCascadeSqlRow = {
  deleted: boolean;
  document_id: string;
  storage_path: string | null;
  remaining_reference_count: number;
  archi_purged_count: number;
};

export type DeleteDocumentCascadeRow = {
  deleted: true;
  documentId: string;
  storagePath: string | null;
  remainingReferenceCount: number;
  archiPurgedCount: number;
};

export type DocumentDeletionWarning = {
  code: "storage_object_left_behind";
  path: string;
  detail: string;
};

export type DocumentDeletionResult =
  | { ok: true; warnings: DocumentDeletionWarning[] }
  | { ok: false; error: string };

function isUuid(value: unknown): boolean {
  return UUID_RE.test(String(value ?? "").trim());
}

function asFiniteCount(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim()) {
    const n = Number(value);
    if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function normalizeDeleteDocumentCascadeRow(
  data: unknown,
): DeleteDocumentCascadeRow | null {
  const raw = Array.isArray(data) ? data[0] : data;
  if (!isRecord(raw)) return null;
  if (raw.deleted !== true) return null;
  const documentId = String(raw.document_id ?? raw.documentId ?? "").trim();
  if (!documentId) return null;
  const remaining = asFiniteCount(
    raw.remaining_reference_count ?? raw.remainingReferenceCount,
  );
  if (remaining === null) return null;
  const archi = asFiniteCount(raw.archi_purged_count ?? raw.archiPurgedCount);
  if (archi === null) return null;
  const pathRaw = raw.storage_path ?? raw.storagePath;
  const storagePath =
    pathRaw == null || String(pathRaw).trim() === ""
      ? null
      : String(pathRaw).trim();
  return {
    deleted: true,
    documentId,
    storagePath,
    remainingReferenceCount: remaining,
    archiPurgedCount: archi,
  };
}

function isDeleteDocumentCascadeUnavailable(error: {
  code?: string | null;
  message?: string | null;
} | null): boolean {
  if (!error) return false;
  const code = String(error.code ?? "");
  const msg = String(error.message ?? "").toLowerCase();
  if (code === "PGRST202" || code === "42883") return true;
  return (
    msg.includes("delete_document_cascade") &&
    (msg.includes("does not exist") || msg.includes("could not find"))
  );
}

function mapDeleteDocumentCascadeError(message: string | null | undefined): string {
  const m = String(message ?? "");
  if (m.includes("delete_document_cascade:not_authenticated")) {
    return "not_authenticated";
  }
  if (m.includes("delete_document_cascade:caller_mismatch")) {
    return "caller_mismatch";
  }
  if (m.includes("delete_document_cascade:document_not_found")) {
    return "document_introuvable";
  }
  if (m.includes("delete_document_cascade:invalid_ids")) {
    return "invalid_ids";
  }
  if (m.includes("delete_document_cascade:delete_failed")) {
    return "suppression_refusee";
  }
  return m.trim() || "rpc_failed";
}

export function userMessageForDocumentDeletionError(error: string): string {
  const code = String(error || "").trim();
  if (
    code === "delete_document_cascade_unavailable" ||
    code === "rpc_failed" ||
    /failed to fetch|network request failed|timeout|econnreset|networkerror/i.test(
      code,
    )
  ) {
    return DOCUMENT_DELETION_RETRY_USER_MESSAGE;
  }
  if (code === "document_introuvable") return "Document introuvable.";
  if (code === "caller_mismatch" || code === "not_authenticated") {
    return "Suppression non autorisée.";
  }
  if (code === "invalid_ids" || code === "missing_ids") {
    return "Impossible de supprimer ce document.";
  }
  if (code === "suppression_refusee") {
    return "La suppression a été refusée. Réessayez.";
  }
  return "Impossible de supprimer.";
}

/**
 * Point d’entrée web. Client anon + session utilisateur uniquement.
 */
export async function deletePaipersCloudDocument(input: {
  userId: string;
  documentId: string;
}): Promise<DocumentDeletionResult> {
  const userId = String(input.userId || "").trim();
  const documentId = String(input.documentId || "").trim();

  if (!userId || !documentId) return { ok: false, error: "missing_ids" };
  if (!isUuid(userId) || !isUuid(documentId)) {
    return { ok: false, error: "invalid_ids" };
  }

  const args: DeleteDocumentCascadeArgs = {
    p_user_id: userId,
    p_document_id: documentId,
  };

  let data: unknown;
  let error: { message?: string | null; code?: string | null } | null;
  try {
    const res = await supabase.rpc(DELETE_DOCUMENT_CASCADE_FN, args);
    data = res.data;
    error = res.error;
  } catch {
    return { ok: false, error: "rpc_failed" };
  }

  if (error) {
    if (isDeleteDocumentCascadeUnavailable(error)) {
      return { ok: false, error: "delete_document_cascade_unavailable" };
    }
    return { ok: false, error: mapDeleteDocumentCascadeError(error.message) };
  }

  const row = normalizeDeleteDocumentCascadeRow(data);
  if (!row) {
    return { ok: false, error: "suppression_refusee" };
  }

  const warnings: DocumentDeletionWarning[] = [];
  const path = row.storagePath;
  if (path && row.remainingReferenceCount === 0) {
    const { error: rmErr } = await supabase.storage
      .from("documents")
      .remove([path]);
    if (rmErr) {
      warnings.push({
        code: "storage_object_left_behind",
        path,
        detail: String(rmErr.message || "storage_remove_failed"),
      });
    }
  }

  return { ok: true, warnings };
}
