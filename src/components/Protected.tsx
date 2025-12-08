"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseSession } from "@/providers/supabase-provider";

export default function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { session } = useSupabaseSession();

  useEffect(() => {
    // Si la session n’existe pas → redirection vers login
    if (session === null) {
      router.replace("/login");
    }
  }, [session, router]);

  // Pendant le chargement de la session → on ne montre rien
  if (session === null) return null;

  // Si session OK → contenu protégé
  return <>{children}</>;
}
