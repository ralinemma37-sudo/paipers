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

const SCREENSHOT_W = 470;
const SCREENSHOT_H = 1024;

type Slide = {
  id: string;
  src: string;
  tab: string;
  caption: string;
  alt: string;
};

/** Ordre : vue d’ensemble → Archi → documents → génération → Pro factures. */
const SLIDES: Slide[] = [
  {
    id: "accueil",
    src: "/screenshots/paipers-accueil.jpg",
    tab: "Accueil",
    caption: "Tout ce qui mérite ton attention",
    alt: "Écran Accueil Paipers : démarches, agenda, abonnements détectés et pièces à importer depuis la messagerie.",
  },
  {
    id: "archi",
    src: "/screenshots/paipers-archi-assistant.jpg",
    tab: "Archi",
    caption: "Archi t’aide à savoir quoi faire",
    alt: "Écran Assistant Archi Paipers : score administratif et suggestions de priorités.",
  },
  {
    id: "documents",
    src: "/screenshots/paipers-documents.jpg",
    tab: "Documents",
    caption: "Tes documents automatiquement organisés",
    alt: "Écran Documents Paipers : recherche, import, scanner et dossiers classés par catégorie.",
  },
  {
    id: "generer",
    src: "/screenshots/paipers-generer.jpg",
    tab: "Générer",
    caption: "Rédige, complète et signe dans Paipers",
    alt: "Écran Générer Paipers : rédiger un document, compléter un PDF et signer.",
  },
  {
    id: "factures",
    src: "/screenshots/paipers-factures-pro.jpg",
    tab: "Factures",
    caption: "Suis tes factures et devis Pro",
    alt: "Écran Factures de l’espace Professionnel Paipers : création, suivi des encaissements et liste des factures.",
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
    <LandingSection id="produit" tone="canvas">
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

          <div
            className={`paipers-showcase-frame relative w-full max-w-[280px] sm:max-w-[300px] md:max-w-[320px] ${
              entering ? "paipers-showcase-frame-enter" : ""
            }`}
            style={{
              borderRadius: 28,
              overflow: "hidden",
              border: `1px solid ${PAIPERS_COLORS.border}`,
              boxShadow: "0 18px 48px rgba(26, 43, 74, 0.16)",
              background: "#0B1220",
            }}
          >
            <Image
              key={slide.src}
              src={slide.src}
              alt={slide.alt}
              width={SCREENSHOT_W}
              height={SCREENSHOT_H}
              className="h-auto w-full"
              sizes="(max-width: 640px) 280px, (max-width: 768px) 300px, 320px"
              loading="lazy"
              quality={85}
            />
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
