/**
 * SEC-1 — POST /api/classify-document (cœur testable).
 * Avant : aucune authentification, appel OpenAI pour n'importe qui.
 * Après : session vérifiée → entrées bornées → quota → classement.
 */

import {
  authenticateRequest,
  boundedString,
  enforceAiQuota,
  jsonError,
  readJsonObject,
  type AuthDeps,
  type QuotaDeps,
} from "@/lib/server/apiAuth";
import type { ClassifyResult } from "@/lib/server/classifyWithOpenAI";

export const CLASSIFY_MAX_FILENAME = 200;
export const CLASSIFY_MAX_TEXT = 12000;

export type ClassifyRouteDeps = {
  auth: AuthDeps;
  quota: QuotaDeps;
  classify: (params: { fileName: string; extractedText: string }) => Promise<ClassifyResult>;
};

export async function handleClassifyDocument(req: Request, deps: ClassifyRouteDeps): Promise<Response> {
  const user = await authenticateRequest(req, deps.auth);
  if (!user) return jsonError(401, "unauthorized");

  const body = await readJsonObject(req, 64 * 1024);
  if (!body.ok) return body.response;

  const fileName = boundedString(body.value.fileName, CLASSIFY_MAX_FILENAME);
  const extractedText = boundedString(body.value.extractedText, CLASSIFY_MAX_TEXT);
  if (fileName === "invalid" || extractedText === "invalid") return jsonError(400, "bad_request");
  if (fileName === "too_long" || extractedText === "too_long") return jsonError(413, "payload_too_large");

  const denied = await enforceAiQuota(deps.quota, user.userId, "web_classify");
  if (denied) return denied;

  try {
    const result = await deps.classify({
      fileName: fileName || "document",
      extractedText: extractedText || "",
    });
    return Response.json({ category: result.category, title: result.title });
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "openai_not_configured") return jsonError(503, "unavailable");
    return jsonError(500, "internal_error");
  }
}
