"use client";

/**
 * Scroll fluide vers les ancres (#waitlist, #fonctionnalites, …).
 * Respecte prefers-reduced-motion.
 */

import { useEffect } from "react";

const HEADER_OFFSET = 72;

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function LandingSmoothAnchorScroll() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      const anchor = (e.target as HTMLElement | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#" || href.length < 2) return;

      const id = decodeURIComponent(href.slice(1));
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const top =
        target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;

      if (reduce) {
        window.scrollTo(0, top);
        history.pushState(null, "", href);
        return;
      }

      const start = window.scrollY;
      const distance = top - start;
      const duration = Math.min(950, Math.max(480, Math.abs(distance) * 0.42));
      let startTime: number | null = null;

      const step = (now: number) => {
        if (startTime === null) startTime = now;
        const progress = Math.min(1, (now - startTime) / duration);
        window.scrollTo(0, start + distance * easeOutCubic(progress));
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          history.pushState(null, "", href);
        }
      };

      requestAnimationFrame(step);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
