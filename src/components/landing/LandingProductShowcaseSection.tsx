"use client";

/**
 * Showcase produit — captures réelles de l’app mobile Paipers.
 * Navigation par onglets + précédent / suivant. Animations CSS légères.
 */

import Image from "next/image";
import { useCallback, useEffect, useId, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import LandingSection from "@/components/landing/LandingSection";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

const SCREENSHOT_W = 462;
const SCREENSHOT_H = 1000;

type Slide = {
  id: string;
  src: string;
  tab: string;
  caption: string;
  alt: string;
};

/** Ordre : Accueil → rangement automatique → Archi → budget → Générer → Pro (captures du 18/10/2026). */
const SLIDES: Slide[] = [
  {
    id: "accueil",
    src: "/screenshots/v2-accueil.png",
    tab: "Accueil",
    caption: "Archi te dit ce qu’il y a à faire",
    alt: "Écran Accueil Paipers : Archi, score administratif et cartes À faire, À surveiller, Fait par Archi.",
  },
  {
    id: "rangement",
    src: "/screenshots/v2-rangement.png",
    tab: "Rangement",
    caption: "Tes documents rangés tout seuls",
    alt: "Import d’un document dans Paipers : « Ton document est enregistré ! Rangé dans Personnel → Logement ».",
  },
  {
    id: "archi",
    src: "/screenshots/v2-archi.png",
    tab: "Archi",
    caption: "Demande à Archi, il retrouve tout",
    alt: "Conversation avec Archi : il retrouve la facture d’électricité demandée.",
  },
  {
    id: "budget",
    src: "/screenshots/v2-budget.png",
    tab: "Budget",
    caption: "Ton budget, calculé pour toi",
    alt: "Écran Mon budget Paipers : entrées, sorties et mouvements du mois.",
  },
  {
    id: "generer",
    src: "/screenshots/v2-generer.png",
    tab: "Générer",
    caption: "Rédige, complète et signe tes documents",
    alt: "Écran Générer Paipers : rédiger, compléter, signer et fusionner des PDF.",
  },
  {
    id: "pro",
    src: "/screenshots/v2-pro.png",
    tab: "Pro",
    caption: "Un espace Pro pour ton activité",
    alt: "Espace Professionnel Paipers : import, scanner, nouvelle facture et nouveau devis.",
  },
];

export default function LandingProductShowcaseSection() {
  const baseId = useId();
  const [index, setIndex] = useState(0);
  const [entering, setEntering] = useState(false);
  const slide = SLIDES[index]!;

  const goTo = useCallback((next: number) => {
    setEntering(true);
    setIndex((next + SLIDES.length) % SLIDES.length);
    // Laisse le navigateur peindre la classe d’entrée puis retire-la.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntering(false));
    });
  }, []);

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  return (
    <LandingSection id="produit" tone="white">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        Paipers, concrètement.
      </h2>
      <p className="mt-3 text-center paipers-text-muted max-w-2xl mx-auto leading-relaxed">
        Découvre comment Paipers centralise tes documents, fait remonter les
        informations importantes et t’aide à garder le contrôle.
      </p>

      {/* Onglets — wrap sur mobile, pas de scroll horizontal forcé */}
      <div
        className="mt-8 flex flex-wrap justify-center gap-2"
        role="tablist"
        aria-label="Écrans Paipers"
      >
        {SLIDES.map((s, i) => {
          const selected = i === index;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${s.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => goTo(i)}
              className="px-3.5 py-2 text-[13px] font-extrabold transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                borderRadius: 999,
                border: selected
                  ? `1px solid ${PAIPERS_COLORS.navy}`
                  : `1px solid ${PAIPERS_COLORS.border}`,
                background: selected ? PAIPERS_COLORS.navy : "#FFFFFF",
                color: selected ? "#FFFFFF" : PAIPERS_COLORS.textPrimary,
                cursor: "pointer",
                outlineColor: PAIPERS_COLORS.navy,
              }}
            >
              {s.tab}
            </button>
          );
        })}
      </div>

      <div
        className="mt-8 mx-auto flex flex-col items-center gap-5"
        style={{ maxWidth: 420 }}
      >
        <div
          className="relative w-full flex items-center justify-center gap-2 sm:gap-4"
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${slide.id}`}
        >
          <button
            type="button"
            onClick={prev}
            aria-label="Écran précédent"
            className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-full paipers-hover-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: "#FFFFFF",
              border: `1px solid ${PAIPERS_COLORS.border}`,
              color: PAIPERS_COLORS.navy,
              cursor: "pointer",
              outlineColor: PAIPERS_COLORS.navy,
            }}
          >
            <ChevronLeft size={22} strokeWidth={2.25} aria-hidden />
          </button>

          {/* Cadre type iPhone autour de la capture */}
          <div
            className={`paipers-showcase-frame relative w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px] ${
              entering ? "paipers-showcase-frame-enter" : ""
            }`}
            style={{
              padding: "11px 10px 12px",
              borderRadius: 42,
              background:
                "linear-gradient(165deg, #3a3a3f 0%, #1a1a1d 42%, #0d0d0f 100%)",
              boxShadow:
                "0 22px 56px rgba(15, 23, 42, 0.22), inset 0 1px 0 rgba(255,255,255,0.14)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Bouton latéral volume (décoratif) */}
            <span
              className="pointer-events-none absolute -left-[2px] top-[96px] w-[3px] h-8 rounded-l-sm"
              style={{ background: "#2c2c30" }}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -left-[2px] top-[136px] w-[3px] h-12 rounded-l-sm"
              style={{ background: "#2c2c30" }}
              aria-hidden
            />
            <span
              className="pointer-events-none absolute -right-[2px] top-[120px] w-[3px] h-14 rounded-r-sm"
              style={{ background: "#2c2c30" }}
              aria-hidden
            />

            <div
              className="relative overflow-hidden"
              style={{
                borderRadius: 32,
                background: "#000",
              }}
            >
              {/* Dynamic Island */}
              <div
                className="pointer-events-none absolute z-10 left-1/2 -translate-x-1/2"
                style={{
                  top: 10,
                  width: 86,
                  height: 22,
                  borderRadius: 999,
                  background: "#0a0a0a",
                  boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06)",
                }}
                aria-hidden
              />
              <Image
                key={slide.src}
                src={slide.src}
                alt={slide.alt}
                width={SCREENSHOT_W}
                height={SCREENSHOT_H}
                className="h-auto w-full block"
                sizes="(max-width: 640px) 260px, (max-width: 768px) 280px, 300px"
                loading="lazy"
                quality={85}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={next}
            aria-label="Écran suivant"
            className="shrink-0 inline-flex h-11 w-11 items-center justify-center rounded-full paipers-hover-lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background: "#FFFFFF",
              border: `1px solid ${PAIPERS_COLORS.border}`,
              color: PAIPERS_COLORS.navy,
              cursor: "pointer",
              outlineColor: PAIPERS_COLORS.navy,
            }}
          >
            <ChevronRight size={22} strokeWidth={2.25} aria-hidden />
          </button>
        </div>

        <p
          className="text-center text-base md:text-lg font-extrabold px-2"
          style={{ color: PAIPERS_COLORS.textPrimary, margin: 0 }}
        >
          {slide.caption}
        </p>

        {/* Points — mobile & desktop */}
        <div className="flex items-center justify-center gap-2" role="presentation">
          {SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Afficher ${s.tab}`}
              onClick={() => goTo(i)}
              className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                width: i === index ? 22 : 8,
                height: 8,
                borderRadius: 999,
                border: "none",
                padding: 0,
                background: i === index ? PAIPERS_COLORS.navy : PAIPERS_COLORS.border,
                cursor: "pointer",
                transition: "width 200ms ease, background 200ms ease",
                outlineColor: PAIPERS_COLORS.navy,
              }}
            />
          ))}
        </div>
      </div>
    </LandingSection>
  );
}
