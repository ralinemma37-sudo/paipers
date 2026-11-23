/**
 * SEC-A2 (E13, 23/11/2026) — session obligatoire pour une route API du site.
 * La session est lue dans les cookies de la requête (même origine) et VALIDÉE par le serveur d'authentification
 * (auth.getUser()). Aucun identifiant fourni par le client (corps, paramètre, en-tête libre) n'est accepté comme
 * preuve. Sans configuration Supabase ou sans session valide : refus 401, message générique.
 */
import { createServerClient } from "@supabase/ssr";

export const WEB_USER_UNAUTHORIZED_BODY = { error: "unauthorized" } as const;

function parseCookieHeader(header: string | null): { name: string; value: string }[] {
  if (!header) return [];
  const out: { name: string; value: string }[] = [];
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i <= 0) continue;
    const name = part.slice(0, i).trim();
    const raw = part.slice(i + 1).trim();
    let value = raw;
    try {
      value = decodeURIComponent(raw);
    } catch {
      value = raw;
    }
    if (name) out.push({ name, value });
  }
  return out;
}

export function webUserUnauthorizedResponse(): Response {
  return new Response(JSON.stringify(WEB_USER_UNAUTHORIZED_BODY), {
    status: 401,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });
}

/** Renvoie l'identifiant de l'utilisateur connecté, ou une réponse 401 à renvoyer telle quelle. */
export async function requireWebUser(req: Request): Promise<{ userId: string } | { response: Response }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) return { response: webUserUnauthorizedResponse() };

  const cookies = parseCookieHeader(req.headers.get("cookie"));
  if (cookies.length === 0) return { response: webUserUnauthorizedResponse() };

  try {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll() {
          return cookies;
        },
        setAll() {
          // Lecture seule : le rafraîchissement des cookies est fait par src/proxy.ts.
        },
      },
    });
    const { data, error } = await supabase.auth.getUser();
    const userId = data?.user?.id;
    if (error || !userId) return { response: webUserUnauthorizedResponse() };
    return { userId };
  } catch {
    return { response: webUserUnauthorizedResponse() };
  }
}
