import { createClient } from "@supabase/supabase-js";

// ⚠️ IMPORTANT
// On NE throw PAS d'erreur au build (sinon Vercel plante)
// On se contente de warn + fallback

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Supabase env vars manquantes : NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

// On crée le client même si undefined → évite le crash au build
export const supabase = createClient(
  supabaseUrl ?? "",
  supabaseAnonKey ?? ""
);
