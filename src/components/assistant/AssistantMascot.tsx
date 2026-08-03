"use client";

/**
 * Réf. : paipers-mobile/src/components/assistant/AssistantMascot.tsx
 * Asset unique : public/brand/assistant-mascot.png
 */

import { PAIPERS_ASSETS } from "@/lib/paipersTheme";

type Props = {
  size?: number;
  /** avatar = crop tête pour bulles chat */
  variant?: "full" | "avatar";
};

export default function AssistantMascot({ size = 230, variant = "full" }: Props) {
  if (variant === "avatar") {
    return (
      <span
        className="inline-flex overflow-hidden shrink-0"
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          background: "#EAF3FF",
        }}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PAIPERS_ASSETS.mascot}
          alt=""
          width={size}
          height={size}
          style={{
            width: size,
            height: size,
            objectFit: "cover",
            objectPosition: "center 18%",
          }}
        />
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={PAIPERS_ASSETS.mascot}
      alt="Archi"
      width={size}
      height={size}
      style={{
        width: size,
        height: "auto",
        maxWidth: "100%",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}
