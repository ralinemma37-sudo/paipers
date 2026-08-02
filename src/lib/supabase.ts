import { createClient } from "@supabase/supabase-js";

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

export const supabase = createClient(url, anon);
