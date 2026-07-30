"use client";

import { usePathname } from "next/navigation";
import DesktopTopNav from "@/components/DesktopTopNav";
import { useNavSpace } from "@/components/NavSpaceProvider";
import {
  PAIPERS_COLORS,
  PAIPERS_GRADIENTS,
  gradientCss,
} from "@/lib/paipersTheme";

/**
 * Top nav desktop + fond soft — masquée sur pages publiques / auth.
 */
export default function DesktopTopNavGate() {
  const pathname = usePathname();
  const { showProTabs, loaded } = useNavSpace();

  const hide =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/design-system") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/legal") ||
    pathname.startsWith("/onboarding");

  if (hide) return null;

  const bgImage = loaded
    ? gradientCss(
        showProTabs
          ? PAIPERS_GRADIENTS.professionalSoft
          : PAIPERS_GRADIENTS.personalSoft,
        200,
      )
    : gradientCss(PAIPERS_GRADIENTS.personalSoft, 200);

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
      <DesktopTopNav />
    </>
  );
}
