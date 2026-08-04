/**
 * Client Supabase navigateur (cookies via @supabase/ssr).
 * Compatible proxy Next.js 16 / protection serveur.
 *
 * Note : les sessions anciennement en localStorage nécessitent une
 * reconnexion après bascule cookies — comportement attendu.
 */

import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!url) {
  throw new Error(
    "Configuration Supabase manquante : NEXT_PUBLIC_SUPABASE_URL.",
  );
}
if (!anon) {
  throw new Error(
    "Configuration Supabase manquante : NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

export const supabase = createBrowserClient(url, anon);
