/**
 * POST /api/classify-document — session obligatoire + quota (SEC-1).
 * Logique : src/lib/server/routes/classifyDocumentRoute.ts
 */
import { defaultAuthDeps, quotaDepsFromServiceClient } from "@/lib/server/apiAuth";
import { classifyDocumentWithOpenAI } from "@/lib/server/classifyWithOpenAI";
import { handleClassifyDocument } from "@/lib/server/routes/classifyDocumentRoute";
import { getServiceSupabase } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  return handleClassifyDocument(req, {
    auth: defaultAuthDeps(),
    quota: quotaDepsFromServiceClient(getServiceSupabase),
    classify: classifyDocumentWithOpenAI,
  });
}
