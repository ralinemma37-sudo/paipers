/**
 * POST /api/rename — session obligatoire + quota (SEC-1).
 * Logique : src/lib/server/routes/renameRoute.ts
 */
import { defaultAiRouteDeps } from "@/lib/server/routes/aiRouteDeps";
import { handleRename } from "@/lib/server/routes/renameRoute";

export async function POST(req: Request) {
  return handleRename(req, defaultAiRouteDeps());
}
