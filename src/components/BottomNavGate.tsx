"use client";

import { usePathname } from "next/navigation";
import BottomNavClient from "@/components/BottomNavClient";

export default function BottomNavGate() {
  const pathname = usePathname();

  // Pages où on NE veut PAS la barre
  const hide =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup");

  if (hide) return null;

  return <BottomNavClient />;
}
