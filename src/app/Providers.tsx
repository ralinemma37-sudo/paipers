"use client";

import type { ReactNode } from "react";
import { NavSpaceProvider } from "@/components/NavSpaceProvider";
import ThemeInit from "@/components/ThemeInit";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <>
      <ThemeInit />
      <NavSpaceProvider>{children}</NavSpaceProvider>
    </>
  );
}
