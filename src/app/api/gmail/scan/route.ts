/**
 * POST /api/gmail/scan — compte cible = session vérifiée (SEC-1).
 * Logique : src/lib/server/routes/gmailScanRoute.ts
 */
import { defaultAuthDeps } from "@/lib/server/apiAuth";
import { googleCredentialsFromEnv } from "@/lib/server/routes/googleTokens";
import { handleGmailScan } from "@/lib/server/routes/gmailScanRoute";
import { getServiceSupabase } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function serviceOrNull() {
  try {
    return getServiceSupabase();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  return handleGmailScan(req, {
    auth: defaultAuthDeps(),
    getService: serviceOrNull,
    googleCredentials: googleCredentialsFromEnv,
    fetch: (input, init) => fetch(input, init),
    now: () => new Date(),
  });
}
