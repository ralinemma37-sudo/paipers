"use client";

import { usePathname } from "next/navigation";
import DesktopSidebar from "@/components/DesktopSidebar";
import { useNavSpace } from "@/components/NavSpaceProvider";
import {
  PAIPERS_COLORS,
  PAIPERS_GRADIENTS,
  gradientCss,
} from "@/lib/paipersTheme";

/**
 * Sidebar desktop globale — même rôle que les Tabs mobiles.
 * Masquée sur landing / auth / design-system.
 */
export default function DesktopSidebarGate() {
  const pathname = usePathname();
  const { showProTabs, loaded } = useNavSpace();

  const hide =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/design-system") ||
    pathname.startsWith("/auth");

  if (hide) return null;

  const bgImage = loaded
    ? gradientCss(
        showProTabs
          ? PAIPERS_GRADIENTS.professionalSoft
          : PAIPERS_GRADIENTS.personalSoft,
        160,
      )
    : gradientCss(PAIPERS_GRADIENTS.personalSoft, 160);

  return (
    <>
      <div
        className="hidden md:block fixed inset-0 -z-10"
        style={{
          backgroundColor: PAIPERS_COLORS.background,
          backgroundImage: bgImage,
        }}
        aria-hidden
      />
      <DesktopSidebar />
    </>
  );
}
