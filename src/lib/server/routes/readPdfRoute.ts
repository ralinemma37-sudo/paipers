/**
 * SEC-1 — POST /api/read-pdf (cœur testable).
 * Avant : aucune authentification, URL libre transmise à OpenAI.
 * Après : session vérifiée → URL https bornée → clé configurée → quota → appel IA.
 * Le format de requête envoyé à OpenAI est conservé tel quel (aucune correction fonctionnelle dans SEC-1).
 */

import {
  authenticateRequest,
  boundedString,
  enforceAiQuota,
  jsonError,
  readJsonObject,
} from "@/lib/server/apiAuth";
import type { AiRouteDeps } from "@/lib/server/routes/aiRouteDeps";

export const READ_PDF_MAX_URL = 2048;

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export async function handleReadPdf(req: Request, deps: AiRouteDeps): Promise<Response> {
  const user = await authenticateRequest(req, deps.auth);
  if (!user) return jsonError(401, "unauthorized");

  const body = await readJsonObject(req, 16 * 1024);
  if (!body.ok) return body.response;

  const fileUrl = boundedString(body.value.fileUrl, READ_PDF_MAX_URL);
  if (fileUrl === "too_long") return jsonError(413, "payload_too_large");
  if (fileUrl === undefined || fileUrl === "invalid" || !isHttpsUrl(fileUrl)) {
    return jsonError(400, "bad_request");
  }

  if (!deps.hasOpenAiKey()) return jsonError(503, "unavailable");

  const denied = await enforceAiQuota(deps.quota, user.userId, "web_read_pdf");
  if (denied) return denied;

  const prompt = `
      Voici un document PDF.
      Extrais tout le texte utile de façon brute, sans résumé.
    `;

  try {
    const completion = (await deps.createChatCompletion({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "input_resource", resource: { file_url: fileUrl } },
          ],
        },
      ],
    })) as { choices?: Array<{ message?: { content?: unknown } }> } | null;

    const content = completion?.choices?.[0]?.message?.content;
    const extracted =
      (Array.isArray(content) ? (content[0] as { text?: unknown } | undefined)?.text : undefined) ?? "";
    return Response.json({ extractedText: typeof extracted === "string" ? extracted : "" });
  } catch {
    return jsonError(500, "internal_error");
  }
}
