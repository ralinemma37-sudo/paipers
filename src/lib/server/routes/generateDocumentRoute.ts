/**
 * SEC-1 — POST /api/generate-document (cœur testable).
 * Avant : aucune authentification, appel OpenAI pour n'importe qui.
 * Après : session vérifiée (cookies du site ou jeton) → entrées bornées → clé configurée → quota → appel IA.
 * Appelant légitime : src/app/generer/rediger-document/page.tsx (repli, même site : cookies envoyés).
 */

import {
  authenticateRequest,
  boundedString,
  enforceAiQuota,
  jsonError,
  readJsonObject,
} from "@/lib/server/apiAuth";
import { firstMessageText, type AiRouteDeps } from "@/lib/server/routes/aiRouteDeps";

export const GENERATE_MAX_TYPE = 200;
export const GENERATE_MAX_DETAILS = 8000;

export async function handleGenerateDocument(req: Request, deps: AiRouteDeps): Promise<Response> {
  const user = await authenticateRequest(req, deps.auth);
  if (!user) return jsonError(401, "unauthorized");

  const body = await readJsonObject(req, 64 * 1024);
  if (!body.ok) return body.response;

  const type = boundedString(body.value.type, GENERATE_MAX_TYPE);
  const details = boundedString(body.value.details, GENERATE_MAX_DETAILS);
  if (type === "too_long" || details === "too_long") return jsonError(413, "payload_too_large");
  if (!type || !details || type === "invalid" || details === "invalid" || !type.trim() || !details.trim()) {
    return jsonError(400, "bad_request", { message: "Paramètres manquants." });
  }

  if (!deps.hasOpenAiKey()) {
    return jsonError(503, "unavailable", {
      message: "Génération indisponible : clé OpenAI non configurée sur le serveur web.",
    });
  }

  const denied = await enforceAiQuota(deps.quota, user.userId, "web_generate");
  if (denied) return denied;

  const prompt = `
Tu es une IA qui rédige des documents administratifs français très professionnels.

Type de document demandé : ${type}
Contexte fourni par l'utilisateur : ${details}

Rédige le document COMPLET, structuré, poli, prêt à être imprimé.
Ne fais aucun meta-commentaire.
    `;

  try {
    const completion = await deps.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un expert en rédaction administrative française." },
        { role: "user", content: prompt },
      ],
    });
    return Response.json({ text: firstMessageText(completion) });
  } catch {
    return jsonError(500, "internal_error", { message: "Génération impossible pour le moment." });
  }
}
