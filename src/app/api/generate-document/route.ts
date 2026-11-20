/**
 * POST /api/generate-document — session obligatoire (cookies du site ou jeton) + quota (SEC-1).
 * Logique : src/lib/server/routes/generateDocumentRoute.ts
 */
import { defaultAiRouteDeps } from "@/lib/server/routes/aiRouteDeps";
import { handleGenerateDocument } from "@/lib/server/routes/generateDocumentRoute";

export async function POST(req: Request) {
  return handleGenerateDocument(req, defaultAiRouteDeps());
}
