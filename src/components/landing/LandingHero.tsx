/**
 * Hero landing — nuit / Archi / CTA.
 */

import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_ASSETS, PAIPERS_RADIUS } from "@/lib/paipersTheme";

export default function LandingHero() {
  return (
    <section
      className="relative px-5 md:px-8 pt-14 pb-20 md:pt-24 md:pb-28 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse 80% 60% at 70% 20%, rgba(172,228,255,0.18), transparent 55%),
            radial-gradient(ellipse 50% 40% at 10% 80%, rgba(247,196,232,0.12), transparent 50%),
            linear-gradient(165deg, ${DESKTOP_SURFACES.night} 0%, #121a2b 45%, ${DESKTOP_SURFACES.marine} 100%)`,
      }}
    >
      <div
        className="mx-auto grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center"
        style={{ maxWidth: 1120 }}
      >
        <div className="paipers-fade-in">
          <p
            className="text-[13px] font-bold tracking-[0.08em] uppercase mb-4"
            style={{ color: DESKTOP_SURFACES.accentLine }}
          >
            Paipers
          </p>
          <h1
            className="text-[2.5rem] md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.06] tracking-tight"
            style={{ color: DESKTOP_SURFACES.onDark }}
          >
            Le copilote administratif intelligent arrive bientôt.
          </h1>
          <p
            className="mt-5 text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: DESKTOP_SURFACES.onDarkMuted }}
          >
            Rejoins la liste d’attente et sois informé(e) en priorité de
            l’ouverture de Paipers.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3">
            <a
              href="#waitlist"
              className="paipers-button text-center"
              style={{ minWidth: 200, textDecoration: "none" }}
            >
              Rejoindre la liste d’attente
            </a>
            <a
              href="#fonctionnalites"
              className="inline-flex items-center justify-center font-bold px-6 py-3.5 paipers-hover-lift"
              style={{
                borderRadius: PAIPERS_RADIUS.button,
                border: "1px solid rgba(255,255,255,0.22)",
                background: "rgba(255,255,255,0.06)",
                color: DESKTOP_SURFACES.onDark,
                textDecoration: "none",
                minWidth: 200,
              }}
            >
              Découvrir Paipers
            </a>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg space-y-4">
            <div className="relative mx-auto w-fit">
              {/* Halo multi-stops : fondu long, sans bord circulaire net */}
              <div
                className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2"
                style={{
                  width: "140%",
                  height: "140%",
                  background: `radial-gradient(ellipse 52% 48% at 50% 50%,
                      rgba(172,228,255,0.28) 0%,
                      rgba(172,228,255,0.16) 22%,
                      rgba(172,228,255,0.08) 42%,
                      rgba(172,228,255,0.03) 62%,
                      transparent 78%
                    )`,
                }}
                aria-hidden
              />
              <img
                src={PAIPERS_ASSETS.mascot}
                alt="Archi, l’assistant Paipers"
                className="relative mx-auto w-56 md:w-72 h-auto"
                width={288}
                height={288}
                decoding="async"
                fetchPriority="high"
              />
            </div>
            <p className="text-center text-lg font-extrabold" style={{ color: DESKTOP_SURFACES.onDark }}>
              Archi t’accompagne
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { t: "Documents", d: "Classement" },
                { t: "Mails", d: "Import" },
                { t: "Générer", d: "PDF" },
              ].map((c) => (
                <div key={c.t} className="paipers-card-marine px-3 py-3 paipers-hover-lift">
                  <p className="text-[12px] font-bold" style={{ color: DESKTOP_SURFACES.onDark, margin: 0 }}>
                    {c.t}
                  </p>
                  <p className="text-[11px] mt-1" style={{ color: DESKTOP_SURFACES.onDarkMuted, margin: 0 }}>
                    {c.d}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
