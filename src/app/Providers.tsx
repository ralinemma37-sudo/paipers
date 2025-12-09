"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { SupabaseProvider } from "../providers/supabase-provider";
import ThemeInit from "../components/ThemeInit";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeInit />
      <SessionProvider>
        <SupabaseProvider>{children}</SupabaseProvider>
      </SessionProvider>
    </>
  );
}
