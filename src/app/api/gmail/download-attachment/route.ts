/**
 * POST /api/gmail/download-attachment — session obligatoire + propriété du document (SEC-1).
 * Logique : src/lib/server/routes/gmailDownloadAttachmentRoute.ts
 */
import { defaultAuthDeps } from "@/lib/server/apiAuth";
import { googleCredentialsFromEnv } from "@/lib/server/routes/googleTokens";
import { handleGmailDownloadAttachment } from "@/lib/server/routes/gmailDownloadAttachmentRoute";
import { resolveEmailRefreshToken } from "@/lib/resolveEmailConnection";
import { getServiceSupabase } from "@/lib/supabaseAdmin";

function serviceOrNull() {
  try {
    return getServiceSupabase();
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  return handleGmailDownloadAttachment(req, {
    auth: defaultAuthDeps(),
    getService: serviceOrNull,
    resolveRefreshToken: (supabase, userId, accountEmail) =>
      resolveEmailRefreshToken(supabase, userId, "gmail", { accountEmail }),
    googleCredentials: googleCredentialsFromEnv,
    fetch: (input, init) => fetch(input, init),
  });
}
