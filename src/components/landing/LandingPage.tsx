"use client";

/**
 * Landing publique Paipers — site marketing web premium.
 * Contenu inchangé ; bandes contrastées desktop.
 * Pas de fausses stats / témoignages. Checkout non simulé.
 */

import Link from "next/link";
import {
  FileText,
  Mail,
  Sparkles,
  Shield,
  Calendar,
  FolderOpen,
  Bot,
  Check,
} from "lucide-react";
import PublicSiteHeader from "@/components/landing/PublicSiteHeader";
import WaitlistForm from "@/components/landing/WaitlistForm";
import WaitlistSocialProof from "@/components/landing/WaitlistSocialProof";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import {
  PAIPERS_ASSETS,
  PAIPERS_COLORS,
  PAIPERS_RADIUS,
} from "@/lib/paipersTheme";

type Tone = "light" | "canvas" | "alt" | "night" | "marine" | "violet" | "white";

function Section({
  id,
  children,
  className = "",
  tone = "light",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
  tone?: Tone;
}) {
  const bg: Record<Tone, string> = {
    light: "#FFFFFF",
    canvas: DESKTOP_SURFACES.canvas,
    alt: DESKTOP_SURFACES.canvasAlt,
    night: DESKTOP_SURFACES.night,
    marine: DESKTOP_SURFACES.marine,
    violet: DESKTOP_SURFACES.violetDeep,
    white: "#FFFFFF",
  };
  const isDark = tone === "night" || tone === "marine" || tone === "violet";

  return (
    <section
      id={id}
      className={`px-5 md:px-8 py-16 md:py-24 ${className}`}
      style={{ background: bg[tone], color: isDark ? DESKTOP_SURFACES.onDark : undefined }}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 1120 }}>
        {children}
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden" style={{ background: DESKTOP_SURFACES.night }}>
      <PublicSiteHeader />

      {/* Hero nuit */}
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

      <Section tone="canvas">
        <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
          L’administratif s’accumule. Personne n’a le temps.
        </h2>
        <p className="mt-4 text-center mx-auto max-w-2xl leading-relaxed paipers-text-muted">
          Factures, contrats, mails, échéances : tout est dispersé. Paipers
          regroupe l’essentiel pour que tu saches quoi faire, et quand.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Documents éparpillés",
              d: "PDF, photos, pièces jointes… difficiles à retrouver au bon moment.",
              card: "paipers-card-muted",
            },
            {
              t: "Échéances oubliées",
              d: "Renouvellements et dates importantes passent souvent inaperçus.",
              card: "paipers-card-white",
            },
            {
              t: "Trop de friction",
              d: "Rédiger, classer, relancer : autant de tâches chronophages.",
              card: "paipers-card-gradient",
            },
          ].map((c) => (
            <div key={c.t} className={`${c.card} p-[18px] paipers-hover-lift`}>
              <p className="font-extrabold text-base" style={{ color: PAIPERS_COLORS.textPrimary }}>
                {c.t}
              </p>
              <p className="mt-2 text-sm leading-relaxed paipers-text-muted">{c.d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="fonctionnalites" tone="white">
        <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
          Ce que Paipers fait aujourd’hui
        </h2>
        <p className="mt-3 text-center paipers-text-muted max-w-2xl mx-auto">
          Des fonctions réellement disponibles sur le web, alignées sur l’app mobile.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { Icon: FolderOpen, t: "Coffre-fort documents", d: "Importe, classe et consulte tes documents administratifs.", dark: false },
            { Icon: Mail, t: "Emails connectés", d: "Branche Gmail ou Outlook pour importer des pièces jointes.", dark: true },
            { Icon: Bot, t: "Assistant Archi", d: "Pose des questions sur ton admin et avance étape par étape.", dark: false },
            { Icon: Sparkles, t: "Générer des documents", d: "Rédige des courriers et prépare des PDF à partir de tes besoins.", dark: false },
            { Icon: Calendar, t: "Échéances", d: "Garde un œil sur les dates importantes liées à ton espace.", dark: true },
            { Icon: FileText, t: "Espace Professionnel", d: "Navigation Factures et coque Pro : la facturation complète reste sur mobile pour l’instant.", dark: false },
          ].map(({ Icon, t, d, dark }, i) => (
            <div
              key={t}
              className={`flex gap-4 items-start p-[18px] paipers-hover-lift ${
                dark ? "paipers-card-marine" : i % 3 === 2 ? "paipers-card-gradient" : "paipers-card-white"
              }`}
            >
              <span
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: dark ? "rgba(255,255,255,0.1)" : "hsl(202 100% 94%)",
                }}
              >
                <Icon size={20} color={dark ? DESKTOP_SURFACES.onDark : PAIPERS_COLORS.navy} />
              </span>
              <div>
                <p className="font-extrabold" style={{ color: dark ? DESKTOP_SURFACES.onDark : undefined }}>
                  {t}
                </p>
                <p
                  className="mt-1.5 text-sm leading-relaxed"
                  style={{ color: dark ? DESKTOP_SURFACES.onDarkMuted : undefined }}
                >
                  {!dark ? <span className="paipers-text-muted">{d}</span> : d}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="archi" tone="marine">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-[32px] font-extrabold tracking-tight" style={{ color: DESKTOP_SURFACES.onDark }}>
              Archi, ton assistant administratif
            </h2>
            <p className="mt-4 leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
              Archi t’aide à comprendre un document, à préparer une démarche et à
              rester dans le périmètre administratif. Ce n’est pas un chatbot
              généraliste : il reste centré sur ton admin Paipers.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Réponses guidées sur tes documents",
                "Actions vers Documents, Générer ou Profil",
                "Pas de fausses suggestions inventées",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm font-semibold" style={{ color: DESKTOP_SURFACES.onDark }}>
                  <Check size={18} color={DESKTOP_SURFACES.accentLine} className="mt-0.5 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <div className="paipers-card-night p-10 paipers-hover-lift">
              <img src={PAIPERS_ASSETS.mascot} alt="Archi" className="w-52 md:w-60 h-auto mx-auto" />
            </div>
          </div>
        </div>
      </Section>

      <Section id="particuliers" tone="canvas">
        <h2 className="paipers-screen-title" style={{ fontSize: 32 }}>
          Pour les particuliers
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed paipers-text-muted">
          Centralise ton admin perso : documents, emails, assistant et génération
          de courriers. L’espace Personnel est le cœur de Paipers au quotidien.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {["Documents", "Mails", "Assistant", "Générer", "Profil"].map((t) => (
            <span
              key={t}
              className="px-4 py-2 text-sm font-extrabold paipers-card-white"
              style={{ borderRadius: 999, display: "inline-block" }}
            >
              {t}
            </span>
          ))}
        </div>
      </Section>

      <Section id="professionnels" tone="marine">
        <h2 className="text-[32px] font-extrabold tracking-tight" style={{ color: DESKTOP_SURFACES.onDark }}>
          Pour les professionnels
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
          L’espace Professionnel reprend la navigation mobile (Factures, Documents
          Pro, Profil entreprise). Sur le web, certaines fonctions de facturation
          sont encore en préparation : pas de faux clients, pas de chiffre
          d’affaires inventé, pas de checkout trompeur.
        </p>
        <div className="mt-8 paipers-card-night p-[18px]">
          <p className="font-extrabold" style={{ color: DESKTOP_SURFACES.accentLine }}>
            Transparent sur le périmètre
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
            La création complète de factures / devis, la synchro entreprise et la
            facturation électronique opérationnelle restent portées prioritairement
            sur l’app mobile. Le web affiche l’espace et les états réels disponibles.
          </p>
        </div>
      </Section>

      <Section tone="alt">
        <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
          En 3 étapes
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { n: "1", t: "Crée ton compte", d: "Inscription rapide, puis un onboarding guidé.", card: "paipers-card-white" },
            { n: "2", t: "Importe tes documents", d: "Fichiers, emails connectés, classement assisté.", card: "paipers-card-marine" },
            { n: "3", t: "Agis avec Archi", d: "Questions, génération, suivi de ton admin.", card: "paipers-card-gradient" },
          ].map((s) => (
            <div key={s.n} className={`${s.card} p-[18px] paipers-hover-lift`}>
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold"
                style={{
                  background: s.card === "paipers-card-marine" ? "rgba(255,255,255,0.15)" : PAIPERS_COLORS.navy,
                  color: "#fff",
                }}
              >
                {s.n}
              </span>
              <p
                className="mt-4 font-extrabold text-lg"
                style={{ color: s.card === "paipers-card-marine" ? DESKTOP_SURFACES.onDark : undefined }}
              >
                {s.t}
              </p>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{
                  color: s.card === "paipers-card-marine" ? DESKTOP_SURFACES.onDarkMuted : undefined,
                }}
              >
                {s.card !== "paipers-card-marine" ? (
                  <span className="paipers-text-muted">{s.d}</span>
                ) : (
                  s.d
                )}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section tone="white">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="paipers-card-night p-[18px] flex items-center gap-4">
            <Shield size={40} color={DESKTOP_SURFACES.accentLine} />
            <div>
              <p className="font-extrabold text-lg" style={{ color: DESKTOP_SURFACES.onDark }}>
                Sécurité & validation humaine
              </p>
              <p className="mt-1 text-sm" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
                Tu restes maître des actions importantes.
              </p>
            </div>
          </div>
          <div>
            <h2 className="paipers-screen-title" style={{ fontSize: 28 }}>
              L’IA aide. Toi, tu valides.
            </h2>
            <p className="mt-3 leading-relaxed paipers-text-muted">
              Paipers propose des analyses et des aides à l’action. Les imports à
              revoir, les suppressions et les connexions email restent sous ton
              contrôle — pas d’automatisation totale inventée.
            </p>
          </div>
        </div>
      </Section>

      <Section id="tarifs" tone="canvas">
        <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
          Tarifs simples
        </h2>
        <p className="mt-3 text-center paipers-text-muted">
          Les formules suivront l’offre Paipers à l’ouverture. Rejoins la liste
          d’attente pour être informé(e) en priorité.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 max-w-3xl mx-auto">
          <div className="paipers-card-white p-[22px] paipers-hover-lift">
            <p className="text-sm font-extrabold" style={{ color: PAIPERS_COLORS.navy }}>
              Personnel
            </p>
            <p className="mt-2 text-3xl font-extrabold">
              6,99 € <span className="text-base font-bold paipers-text-muted">/ mois</span>
            </p>
            <p className="mt-2 text-sm font-semibold">7 jours d’essai au lancement</p>
            <a href="#waitlist" className="paipers-button mt-6 w-full text-center" style={{ display: "block", textDecoration: "none" }}>
              Rejoindre la liste d’attente
            </a>
          </div>
          <div className="paipers-card-night p-[22px] paipers-hover-lift">
            <p className="text-sm font-extrabold" style={{ color: DESKTOP_SURFACES.accentLine }}>
              Offre Professionnelle
            </p>
            <p className="mt-2 text-3xl font-extrabold" style={{ color: DESKTOP_SURFACES.onDark }}>
              29,99 € <span className="text-base font-bold" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>/ mois</span>
            </p>
            <p className="mt-2 text-sm font-semibold" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
              14 jours d’essai au lancement
            </p>
            <a href="#waitlist" className="paipers-button mt-6 w-full text-center" style={{ display: "block", textDecoration: "none" }}>
              Rejoindre la liste d’attente
            </a>
            <p className="mt-3 text-xs leading-relaxed" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
              Aucun abonnement Pro n’est activé automatiquement sur le web. Le checkout n’est
              pas encore disponible.
            </p>
          </div>
        </div>
      </Section>

      <Section id="waitlist" tone="white">
        <div className="max-w-xl mx-auto">
          <div
            className="paipers-elevated-card paipers-hover-lift"
            style={{
              padding: "28px 24px",
              borderRadius: 22,
              border: `1px solid ${PAIPERS_COLORS.border}`,
              background:
                "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
            }}
          >
            <p
              className="text-[13px] font-bold tracking-[0.06em] uppercase text-center"
              style={{ color: PAIPERS_COLORS.navy, margin: 0 }}
            >
              Liste d’attente
            </p>
            <h2
              className="text-center"
              style={{
                margin: "10px 0 0",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: -0.4,
                color: PAIPERS_COLORS.navy,
              }}
            >
              Rejoins les premiers utilisateurs de Paipers.
            </h2>
            <p
              className="text-center paipers-text-muted"
              style={{ marginTop: 12, marginBottom: 14, lineHeight: 1.55 }}
            >
              Inscris-toi gratuitement. Tu seras averti(e) dès l’ouverture
              officielle et recevras les actualités importantes concernant
              Paipers si tu le souhaites.
            </p>
            <WaitlistSocialProof />
            <WaitlistForm embedded />
          </div>
        </div>
      </Section>

      <Section id="faq" tone="alt">
        <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
          Questions fréquentes
        </h2>
        <div className="mt-8 max-w-3xl mx-auto space-y-3">
          {[
            {
              q: "Paipers remplace-t-il mon logiciel de facturation ?",
              a: "Sur mobile, l’espace Pro inclut la création de factures et devis. Sur le web, l’onglet Factures présente l’espace et les états disponibles, sans inventer une suite comptable complète.",
            },
            {
              q: "Mes emails sont-ils en sécurité ?",
              a: "Les connexions Gmail et Outlook passent par OAuth. Tu pourras déconnecter un compte à tout moment depuis le Profil.",
            },
            {
              q: "Puis-je utiliser Paipers gratuitement aujourd’hui ?",
              a: "Paipers n’est pas encore ouvert au public. Rejoins la liste d’attente pour être informé(e) en priorité à l’ouverture. Un accès privé reste réservé à l’équipe.",
            },
            {
              q: "Qu’est-ce qu’Archi ?",
              a: "Archi est l’assistant Paipers. Il t’aide sur ton administratif, sans promettre des actions hors périmètre.",
            },
          ].map((item) => (
            <details key={item.q} className="paipers-card-white p-[18px] group">
              <summary className="font-extrabold cursor-pointer list-none flex justify-between gap-3">
                {item.q}
                <span className="paipers-text-muted font-bold">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed paipers-text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <Section className="text-center" id="essayer" tone="night">
        <div className="paipers-card-marine py-12 px-6">
          <h2 className="text-[32px] font-extrabold tracking-tight" style={{ color: DESKTOP_SURFACES.onDark }}>
            Sois parmi les premiers.
          </h2>
          <p className="mt-3 mx-auto max-w-xl" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
            Rejoins la liste d’attente et sois informé(e) en priorité de
            l’ouverture de Paipers.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#waitlist" className="paipers-button" style={{ minWidth: 200, textAlign: "center", textDecoration: "none" }}>
              Rejoindre la liste d’attente
            </a>
            <a
              href="#fonctionnalites"
              className="inline-flex items-center justify-center font-extrabold px-6 py-3.5"
              style={{
                borderRadius: PAIPERS_RADIUS.button,
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.2)",
                color: DESKTOP_SURFACES.onDark,
                textDecoration: "none",
                minWidth: 200,
              }}
            >
              Découvrir Paipers
            </a>
          </div>
        </div>
      </Section>

      <footer
        className="border-t px-5 md:px-8 py-10"
        style={{
          borderColor: "rgba(255,255,255,0.08)",
          background: DESKTOP_SURFACES.nightElevated,
          color: DESKTOP_SURFACES.onDark,
        }}
      >
        <div
          className="mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-8"
          style={{ maxWidth: 1120 }}
        >
          <div>
            <img
              src={PAIPERS_ASSETS.logoNight}
              alt="Paipers"
              className="paipers-brand-logo h-11 w-auto"
            />
            <p className="mt-3 text-sm max-w-xs" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
              Le copilote administratif intelligent arrive bientôt.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <p className="font-extrabold">Produit</p>
              <a href="#fonctionnalites" style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
                Fonctionnalités
              </a>
              <a href="#tarifs" style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
                Tarifs
              </a>
              <a href="#waitlist" style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
                Liste d’attente
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-extrabold">Légal</p>
              <Link href="/legal/cgu" style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}>
                CGU
              </Link>
              <Link
                href="/legal/politique-confidentialite"
                style={{ color: DESKTOP_SURFACES.onDarkMuted, textDecoration: "none" }}
              >
                Confidentialité
              </Link>
              <Link
                href="/login"
                style={{
                  color: DESKTOP_SURFACES.onDarkSoft,
                  textDecoration: "none",
                  opacity: 0.7,
                  fontSize: 12,
                }}
              >
                Accès privé
              </Link>
            </div>
          </div>
        </div>
        <p
          className="mx-auto mt-10 text-xs"
          style={{ maxWidth: 1120, color: DESKTOP_SURFACES.onDarkSoft }}
        >
          © {new Date().getFullYear()} Paipers. Mentions éditeur en cours de
          finalisation — voir les pages légales.
        </p>
      </footer>
    </div>
  );
}
