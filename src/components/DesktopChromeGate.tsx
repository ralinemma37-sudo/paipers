"use client";

/**
 * Chrome desktop connecté : sidebar nuit + header discret.
 * Masqué sur pages publiques / auth (même liste que l’ancienne top nav).
 */

import { usePathname } from "next/navigation";
import DesktopSidebar from "@/components/DesktopSidebar";
import DesktopAppHeader from "@/components/DesktopAppHeader";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";

function isPublicPath(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/design-system") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/onboarding")
  );
}

export default function DesktopChromeGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const publicPage = isPublicPath(pathname);

  if (publicPage) {
    return <>{children}</>;
  }

  return (
    <div className="md:flex md:min-h-screen w-full">
      <DesktopSidebar />
      <div
        className="flex-1 min-w-0 flex flex-col md:min-h-screen"
        style={{ background: DESKTOP_SURFACES.canvas }}
      >
        <DesktopAppHeader />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
