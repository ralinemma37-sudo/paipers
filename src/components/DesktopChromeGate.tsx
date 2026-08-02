"use client";

/**
 * Chrome desktop connecté : sidebar fixe pleine hauteur + contenu décalé.
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
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/waitlist")
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
    <div
      className="w-full md:min-h-[100dvh]"
      style={{ background: DESKTOP_SURFACES.canvas }}
    >
      <DesktopSidebar />
      <div
        className="flex flex-col flex-1 min-w-0 w-full md:min-h-[100dvh] md:ml-[232px] md:w-[calc(100%-232px)]"
      >
        <DesktopAppHeader />
        <div className="flex-1 min-w-0 w-full relative">{children}</div>
      </div>
    </div>
  );
}
