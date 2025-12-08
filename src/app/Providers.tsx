"use client";

import { SessionProvider } from "next-auth/react";
import { SupabaseProvider } from "@/providers/supabase-provider";
import ThemeInit from "@/components/ThemeInit";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ThemeInit />
      <SessionProvider>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </SessionProvider>
    </>
  );
}
