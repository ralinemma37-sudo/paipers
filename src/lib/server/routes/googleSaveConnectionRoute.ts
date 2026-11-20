/**
 * SEC-1 — POST /api/google/save-connection (cœur testable).
 *
 * Avant : le compte cible était le `user_id` fourni dans le corps de la requête : n'importe qui,
 * connecté à son propre compte Google, pouvait rattacher ses jetons Gmail au compte de son choix.
 * Après : le compte cible est UNIQUEMENT l'utilisateur de la session Supabase vérifiée ;
 * un `user_id` différent dans le corps → 403 sans aucune écriture. La session Google (NextAuth) reste exigée.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  authenticateRequest,
  jsonError,
  readJsonObject,
  type AuthDeps,
} from "@/lib/server/apiAuth";

export type GoogleSessionTokens = {
  googleEmail?: string;
  accessToken?: string;
  refreshToken?: string;
} | null;

export type GoogleSaveConnectionDeps = {
  auth: AuthDeps;
  /** Jetons Google de la session NextAuth de l'appelant. */
  getGoogleToken: (req: Request) => Promise<GoogleSessionTokens>;
  /** null si la configuration serveur (URL / clé serveur) est absente. */
  getService: () => SupabaseClient | null;
};

export async function handleGoogleSaveConnection(req: Request, deps: GoogleSaveConnectionDeps): Promise<Response> {
  const user = await authenticateRequest(req, deps.auth);
  if (!user) return Response.json({ success: false, error: "Connexion requise.", code: "unauthorized" }, { status: 401 });

  const body = await readJsonObject(req, 16 * 1024);
  if (!body.ok) return body.response;

  // Un identifiant fourni par le client n'est jamais une preuve : s'il diffère de la session, refus.
  const claimed = body.value.user_id;
  if (claimed !== undefined && claimed !== null && claimed !== user.userId) {
    return Response.json({ success: false, error: "Action non autorisée.", code: "forbidden" }, { status: 403 });
  }

  let token: GoogleSessionTokens;
  try {
    token = await deps.getGoogleToken(req);
  } catch {
    token = null;
  }
  const email = typeof token?.googleEmail === "string" ? token.googleEmail.trim() : "";
  if (!email) {
    return Response.json(
      { success: false, error: "Session Google absente.", code: "unauthorized" },
      { status: 401 },
    );
  }

  const supabaseAdmin = deps.getService();
  if (!supabaseAdmin) return jsonError(503, "unavailable");

  const payload: Record<string, string> = { email, user_id: user.userId };
  if (typeof token?.accessToken === "string" && token.accessToken) payload.access_token = token.accessToken;
  if (typeof token?.refreshToken === "string" && token.refreshToken) payload.refresh_token = token.refreshToken;

  const fail = () =>
    Response.json({ success: false, error: "Une erreur est survenue. Réessaie plus tard.", code: "internal_error" }, { status: 500 });

  try {
    const { data: existing, error: findErr } = await supabaseAdmin
      .from("gmail_connections")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    if (findErr) return fail();

    const existingId = (existing as { id?: unknown } | null)?.id;
    if (existingId) {
      const { error: updateErr } = await supabaseAdmin.from("gmail_connections").update(payload).eq("id", existingId);
      if (updateErr) return fail();
      return Response.json({ success: true, mode: "updated" });
    }

    const { error: insertErr } = await supabaseAdmin.from("gmail_connections").insert(payload);
    if (insertErr) return fail();
    return Response.json({ success: true, mode: "inserted" });
  } catch {
    return fail();
  }
}
