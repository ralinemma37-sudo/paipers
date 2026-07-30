"use client";

/**
 * Avatar onglet Assistant — miroir AssistantMascotAvatar + styles tab _layout.tsx
 * Asset : public/brand/assistant-mascot.png ← assets/images/assistant-mascot.png
 */

import { ASSISTANT_TAB_STYLE, NAV_ASSETS } from "@/lib/navConfig";

type Props = {
  focused: boolean;
  /** sidebar = plus compact horizontal */
  size?: "tab" | "sidebar";
};

export default function AssistantNavIcon({ focused, size = "tab" }: Props) {
  const isTab = size === "tab";
  const box = focused
    ? isTab
      ? ASSISTANT_TAB_STYLE.focusedSize
      : 44
    : isTab
      ? ASSISTANT_TAB_STYLE.unfocusedSize
      : 40;
  const avatar = focused
    ? isTab
      ? ASSISTANT_TAB_STYLE.avatarFocused
      : 36
    : isTab
      ? ASSISTANT_TAB_STYLE.avatarUnfocused
      : 32;

  return (
    <span
      className="inline-flex items-center justify-center overflow-hidden shrink-0"
      style={{
        width: box,
        height: box,
        borderRadius: box / 2,
        background: focused
          ? ASSISTANT_TAB_STYLE.focusedBg
          : ASSISTANT_TAB_STYLE.unfocusedBg,
        boxShadow: focused
          ? "0 4px 10px rgba(172, 228, 255, 0.28)"
          : "0 2px 4px rgba(0,0,0,0.06)",
        marginTop: isTab ? (focused ? -10 : -6) : 0,
      }}
    >
      <img
        src={NAV_ASSETS.mascot}
        alt=""
        width={avatar}
        height={avatar}
        style={{
          width: avatar,
          height: avatar,
          objectFit: "cover",
          objectPosition: "center 20%",
        }}
      />
    </span>
  );
}
