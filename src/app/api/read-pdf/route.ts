/**
 * POST /api/read-pdf — session obligatoire + quota (SEC-1).
 * Logique : src/lib/server/routes/readPdfRoute.ts
 */
import { defaultAiRouteDeps } from "@/lib/server/routes/aiRouteDeps";
import { handleReadPdf } from "@/lib/server/routes/readPdfRoute";

export async function POST(req: Request) {
  return handleReadPdf(req, defaultAiRouteDeps());
}
