/**
 * POST /api/google/save-connection — compte cible = session Supabase vérifiée (SEC-1).
 * Logique : src/lib/server/routes/googleSaveConnectionRoute.ts
 */
import { getToken } from "next-auth/jwt";
import { defaultAuthDeps } from "@/lib/server/apiAuth";
import {
  handleGoogleSaveConnection,
  type GoogleSessionTokens,
} from "@/lib/server/routes/googleSaveConnectionRoute";
import { getServiceSupabase } from "@/lib/supabaseAdmin";

function serviceOrNull() {
  try {
    return getServiceSupabase();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  return handleGoogleSaveConnection(req, {
    auth: defaultAuthDeps(),
    getGoogleToken: async (r) =>
      (await getToken({ req: r as never, secret: process.env.NEXTAUTH_SECRET })) as GoogleSessionTokens,
    getService: serviceOrNull,
  });
}
