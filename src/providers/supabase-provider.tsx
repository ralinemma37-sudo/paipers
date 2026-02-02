"use client";

import React, { createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";

type SupabaseContextType = typeof supabase;

const SupabaseContext = createContext<SupabaseContextType | null>(null);

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) {
    throw new Error("useSupabase must be used inside <SupabaseProvider />");
  }
  return ctx;
}

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export default SupabaseProvider;
