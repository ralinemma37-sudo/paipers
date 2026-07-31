"use client";

/**
 * Sélecteur d’espace compact pour header desktop.
 * Même logique NavSpace — affichage « Personnel ▾ » / « Professionnel ▾ ».
 */

import { useCallback, useState } from "react";
import { Briefcase, Check, ChevronDown, Home } from "lucide-react";
import { useNavSpace } from "@/components/NavSpaceProvider";
import { useEscapeToClose } from "@/hooks/useEscapeToClose";
import { NAV_SPACE_LABELS, type NavSpace } from "@/lib/navConfig";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type Props = {
  variant?: "sidebar" | "bar" | "compact";
};

export default function SpaceSwitcher({ variant = "sidebar" }: Props) {
  const { space, spaceLabel, setSpace, loaded } = useNavSpace();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useEscapeToClose(open, close);

  if (!loaded) return null;

  const isBar = variant === "bar";
  const isCompact = variant === "compact";

  if (isCompact) {
    return (
      <div className="relative" style={{ zIndex: 50 }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Changer d’espace"
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 border-0 bg-transparent cursor-pointer whitespace-nowrap"
          style={{
            padding: "6px 8px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 700,
            color: PAIPERS_COLORS.textPrimary,
          }}
        >
          <span>{spaceLabel}</span>
          <ChevronDown size={14} color={PAIPERS_PALETTES.light.textMuted} />
        </button>

        {open ? (
          <>
            <button
              type="button"
              aria-label="Fermer"
              className="fixed inset-0 z-40 cursor-default border-0"
              style={{ background: "transparent" }}
              onClick={() => setOpen(false)}
            />
            <div
              className="absolute right-0 z-50 mt-1.5 overflow-hidden min-w-[200px]"
              style={{
                borderRadius: 12,
                background: "#fff",
                border: `1px solid ${PAIPERS_COLORS.border}`,
                boxShadow: "0 8px 24px rgba(15,23,42,0.1)",
              }}
            >
              {(Object.keys(NAV_SPACE_LABELS) as NavSpace[]).map((key) => {
                const Icon = key === "pro" ? Briefcase : Home;
                const active = space === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setSpace(key);
                      setOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left border-0 cursor-pointer"
                    style={{
                      background: active ? PAIPERS_COLORS.navyMuted : "#fff",
                      fontSize: 13,
                      fontWeight: active ? 800 : 600,
                      color: PAIPERS_COLORS.textPrimary,
                    }}
                  >
                    <Icon size={16} color={PAIPERS_COLORS.navy} />
                    <span className="flex-1">{NAV_SPACE_LABELS[key]}</span>
                    {active ? <Check size={16} color={PAIPERS_COLORS.navy} /> : null}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  const ActiveIcon = space === "pro" ? Briefcase : Home;

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
          borderBottom: isBar ? `1px solid ${PAIPERS_COLORS.border}` : undefined,
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
              borderRadius: 16,
              background: PAIPERS_PALETTES.light.card,
              border: `1px solid ${PAIPERS_COLORS.border}`,
              boxShadow: "0 8px 24px rgba(15,23,42,0.1)",
              ...(isBar ? { left: 12, right: 12 } : {}),
            }}
          >
            {(Object.keys(NAV_SPACE_LABELS) as NavSpace[]).map((key) => {
              const Icon = key === "pro" ? Briefcase : Home;
              const active = space === key;
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
                    background: active ? PAIPERS_COLORS.navyMuted : undefined,
                    borderBottom: `1px solid ${PAIPERS_COLORS.border}`,
                  }}
                >
                  <Icon size={18} color={PAIPERS_COLORS.navy} />
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
                  {active ? <Check size={18} color={PAIPERS_COLORS.navy} /> : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
