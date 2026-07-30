"use client";

/**
 * Sélecteur d’espace — miroir simplifié de PaipersAccountSwitcher.
 * Réf. : paipers-mobile/src/components/PaipersAccountSwitcher.tsx
 * Labels : workspaceTypeLabel → Personnel / Professionnel
 * Icônes Lucide : Home (personnel), Briefcase (professionnel) — mêmes que le mobile.
 */

import { useState } from "react";
import { Briefcase, Check, ChevronDown, Home } from "lucide-react";
import { useNavSpace } from "@/components/NavSpaceProvider";
import { NAV_SPACE_LABELS, type NavSpace } from "@/lib/navConfig";
import {
  PAIPERS_COLORS,
  PAIPERS_GRADIENTS,
  PAIPERS_PALETTES,
  gradientCss,
} from "@/lib/paipersTheme";

type Props = {
  /** sidebar = colonne desktop ; bar = bandeau mobile */
  variant?: "sidebar" | "bar";
};

export default function SpaceSwitcher({ variant = "sidebar" }: Props) {
  const { space, spaceLabel, setSpace, loaded } = useNavSpace();
  const [open, setOpen] = useState(false);

  if (!loaded) return null;

  const ActiveIcon = space === "pro" ? Briefcase : Home;
  const isBar = variant === "bar";

  return (
    <div className="relative" style={{ zIndex: 40 }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Changer d’espace"
        aria-expanded={open}
        className="w-full flex items-center gap-2 text-left"
        style={{
          padding: isBar ? "8px 16px" : "10px 14px",
          borderBottom: isBar
            ? `1px solid ${PAIPERS_COLORS.border}`
            : undefined,
          background: PAIPERS_PALETTES.light.card,
          borderRadius: isBar ? 0 : 16,
          border: isBar ? undefined : `1px solid ${PAIPERS_COLORS.border}`,
        }}
      >
        <ActiveIcon size={18} color={PAIPERS_COLORS.textPrimary} />
        <span
          className="flex-1 truncate"
          style={{
            fontWeight: 800,
            fontSize: 15,
            color: PAIPERS_COLORS.textPrimary,
          }}
        >
          {spaceLabel}
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: PAIPERS_PALETTES.light.textMuted,
          }}
        >
          Changer
        </span>
        <ChevronDown size={18} color={PAIPERS_PALETTES.light.textMuted} />
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Fermer"
            className="fixed inset-0 z-40 cursor-default"
            style={{ background: "rgba(0,0,0,0.4)" }}
            onClick={() => setOpen(false)}
          />
          <div
            className="absolute left-0 right-0 z-50 mt-2 overflow-hidden"
            style={{
              borderRadius: 24,
              background: PAIPERS_PALETTES.light.card,
              border: `1px solid ${PAIPERS_COLORS.border}`,
              boxShadow: "var(--paipers-shadow-card)",
              ...(isBar ? { left: 12, right: 12 } : {}),
            }}
          >
            {(Object.keys(NAV_SPACE_LABELS) as NavSpace[]).map((key) => {
              const Icon = key === "pro" ? Briefcase : Home;
              const active = space === key;
              const accent =
                key === "pro"
                  ? PAIPERS_COLORS.navy
                  : PAIPERS_COLORS.personalGradientStart;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSpace(key);
                    setOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  style={{
                    background: active
                      ? key === "pro"
                        ? PAIPERS_COLORS.navyMuted
                        : undefined
                      : undefined,
                    backgroundImage:
                      active && key === "personal"
                        ? gradientCss(PAIPERS_GRADIENTS.personalSoft)
                        : undefined,
                    borderBottom: `1px solid ${PAIPERS_COLORS.border}`,
                  }}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background:
                        key === "pro"
                          ? PAIPERS_COLORS.navySoft
                          : PAIPERS_COLORS.personalGradientSoftStart,
                      color: accent,
                    }}
                  >
                    <Icon size={18} />
                  </span>
                  <span
                    className="flex-1"
                    style={{
                      fontWeight: 800,
                      fontSize: 15,
                      color: PAIPERS_COLORS.textPrimary,
                    }}
                  >
                    {NAV_SPACE_LABELS[key]}
                  </span>
                  {active ? (
                    <Check size={18} color={PAIPERS_COLORS.navy} />
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
