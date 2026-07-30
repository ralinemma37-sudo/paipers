"use client";

import { usePathname } from "next/navigation";
import BottomNavClient from "@/components/BottomNavClient";

export default function BottomNavGate() {
  const pathname = usePathname();

  const hide =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/design-system") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/onboarding");

  if (hide) return null;

  return <BottomNavClient />;
}
