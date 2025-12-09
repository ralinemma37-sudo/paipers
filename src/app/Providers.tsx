"use client";

import type { ReactNode } from "react";

export default function AppProviders({ children }: { children: ReactNode }) {
  // Version simplifiée temporaire : pas de SessionProvider, pas de SupabaseProvider
  return <>{children}</>;
}
