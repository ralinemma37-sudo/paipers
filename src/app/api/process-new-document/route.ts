/**
 * POST /api/process-new-document — webhook protégé par secret (SEC-1).
 * Logique : src/lib/server/routes/processNewDocumentRoute.ts
 * Prérequis de déploiement : variable PROCESS_NEW_DOCUMENT_WEBHOOK_SECRET + même valeur dans l'en-tête
 * `x-plaidoc-webhook-secret` du webhook appelant. Sans variable, la route refuse tout (503).
 */
import { quotaDepsFromServiceClient } from "@/lib/server/apiAuth";
import { classifyDocumentWithOpenAI } from "@/lib/server/classifyWithOpenAI";
import { extractTextIfPossible } from "@/lib/server/extractDocumentText";
import { handleProcessNewDocument } from "@/lib/server/routes/processNewDocumentRoute";
import { getServiceSupabase } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  return handleProcessNewDocument(req, {
    webhookSecret: () => process.env.PROCESS_NEW_DOCUMENT_WEBHOOK_SECRET,
    getService: getServiceSupabase,
    quota: quotaDepsFromServiceClient(getServiceSupabase),
    extractText: extractTextIfPossible,
    classify: classifyDocumentWithOpenAI,
  });
}
