"use client";

import { usePathname } from "next/navigation";
import SpaceSwitcher from "@/components/SpaceSwitcher";

/**
 * Bandeau haut mobile — miroir PaipersAccountSwitcher.
 * Réf. : app/(tabs)/_layout.tsx (au-dessus des Tabs)
 */
export default function SpaceSwitcherGate() {
  const pathname = usePathname();

  const hide =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/design-system") ||
    pathname.startsWith("/auth");

  if (hide) return null;

  return (
    <div className="md:hidden sticky top-0 z-40">
      <SpaceSwitcher variant="bar" />
    </div>
  );
}
