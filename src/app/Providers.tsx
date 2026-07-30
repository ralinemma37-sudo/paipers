"use client";

import type { ReactNode } from "react";
import { NavSpaceProvider } from "@/components/NavSpaceProvider";

export default function AppProviders({ children }: { children: ReactNode }) {
  return <NavSpaceProvider>{children}</NavSpaceProvider>;
}
