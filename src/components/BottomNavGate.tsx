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
    pathname.startsWith("/auth");

  if (hide) return null;

  return <BottomNavClient />;
}
