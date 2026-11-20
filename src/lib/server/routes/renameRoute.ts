/**
 * SEC-1 — POST /api/rename (cœur testable).
 * Avant : aucune authentification, appel OpenAI pour n'importe qui.
 * Après : session vérifiée → entrées bornées → clé configurée → quota → appel IA.
 */

import {
  authenticateRequest,
  boundedString,
  enforceAiQuota,
  jsonError,
  readJsonObject,
} from "@/lib/server/apiAuth";
import { firstMessageText, type AiRouteDeps } from "@/lib/server/routes/aiRouteDeps";

export const RENAME_MAX_FILENAME = 200;
export const RENAME_MAX_TEXT = 12000;

export async function handleRename(req: Request, deps: AiRouteDeps): Promise<Response> {
  const user = await authenticateRequest(req, deps.auth);
  if (!user) return jsonError(401, "unauthorized");

  const body = await readJsonObject(req, 64 * 1024);
  if (!body.ok) return body.response;

  const fileName = boundedString(body.value.fileName, RENAME_MAX_FILENAME);
  const extractedText = boundedString(body.value.extractedText, RENAME_MAX_TEXT);
  if (fileName === "invalid" || extractedText === "invalid") return jsonError(400, "bad_request");
  if (fileName === "too_long" || extractedText === "too_long") return jsonError(413, "payload_too_large");

  if (!deps.hasOpenAiKey()) return jsonError(503, "unavailable");

  const denied = await enforceAiQuota(deps.quota, user.userId, "web_rename");
  if (denied) return denied;

  const prompt = `
      Tu dois générer un titre clair, professionnel et court
      pour un document administratif français.

      Nom du fichier :
      "${fileName ?? ""}"

      Texte extrait :
      "${extractedText || "Aucun texte"}"

      Si c'est un bulletin de salaire :
      → Format recommandé :
      "Bulletin de salaire – Mois Année – Nom Prénom"

      Réponds uniquement par le titre, sans extension.
    `;

  try {
    const completion = await deps.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    const title = firstMessageText(completion).trim() || fileName || "";
    return Response.json({ title });
  } catch {
    return jsonError(500, "internal_error");
  }
}
