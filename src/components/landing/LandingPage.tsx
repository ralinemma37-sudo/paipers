"use client";

/**
 * Landing publique Paipers — site marketing web.
 * Pas de fausses stats / témoignages / certifications.
 * Checkout non simulé : CTA → /signup | /login.
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
import {
  PAIPERS_ASSETS,
  PAIPERS_COLORS,
  PAIPERS_GRADIENTS,
  PAIPERS_RADIUS,
  gradientCss,
} from "@/lib/paipersTheme";

function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`px-5 md:px-8 py-16 md:py-24 ${className}`}
    >
      <div className="mx-auto w-full" style={{ maxWidth: 1120 }}>
        {children}
      </div>
    </section>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white overflow-x-hidden">
      <PublicSiteHeader />

      {/* 1. Hero */}
      <section
        className="px-5 md:px-8 pt-10 pb-16 md:pt-16 md:pb-24"
        style={{
          backgroundImage: gradientCss(PAIPERS_GRADIENTS.personalSoft, 180),
          backgroundColor: "#fff",
        }}
      >
        <div
          className="mx-auto grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center"
          style={{ maxWidth: 1120 }}
        >
          <div>
            <p
              className="text-sm font-extrabold tracking-wide uppercase mb-4"
              style={{ color: PAIPERS_COLORS.navy }}
            >
              Paipers
            </p>
            <h1
              className="text-4xl md:text-5xl lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight"
              style={{ color: PAIPERS_COLORS.textPrimary }}
            >
              Ton administratif, enfin sous contrôle.
            </h1>
            <p
              className="mt-5 text-base md:text-lg leading-relaxed max-w-xl"
              style={{ color: "rgba(0,0,0,0.62)" }}
            >
              Paipers centralise tes documents, surveille tes échéances, analyse
              tes emails et t’aide à agir au bon moment.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="paipers-button text-center"
                style={{ minWidth: 200 }}
              >
                Essayer gratuitement
              </Link>
              <a
                href="#fonctionnalites"
                className="inline-flex items-center justify-center font-extrabold px-6 py-3.5"
                style={{
                  borderRadius: PAIPERS_RADIUS.button,
                  border: `1px solid ${PAIPERS_COLORS.border}`,
                  background: "#fff",
                  color: PAIPERS_COLORS.textPrimary,
                  textDecoration: "none",
                  minWidth: 200,
                }}
              >
                Découvrir Paipers
              </a>
            </div>
            <p className="mt-4 text-xs font-semibold" style={{ color: PAIPERS_COLORS.neutral }}>
              Essai sans engagement · Pas de faux checkout sur le web
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div
              className="paipers-elevated-card relative overflow-hidden w-full max-w-md"
              style={{
                padding: 28,
                backgroundImage: gradientCss(PAIPERS_GRADIENTS.personal, 135),
              }}
            >
              <img
                src={PAIPERS_ASSETS.mascot}
                alt="Pupo, l’assistant Paipers"
                className="mx-auto w-44 h-auto drop-shadow-md"
              />
              <p
                className="mt-5 text-center text-lg font-extrabold"
                style={{ color: PAIPERS_COLORS.navy }}
              >
                Pupo t’accompagne au quotidien
              </p>
              <p
                className="mt-2 text-center text-sm leading-relaxed"
                style={{ color: "rgba(26,43,74,0.78)" }}
              >
                Pose une question, joins un document, et avance sur ton admin
                sans te perdre dans les dossiers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problème */}
      <Section>
        <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
          L’administratif s’accumule. Personne n’a le temps.
        </h2>
        <p
          className="mt-4 text-center mx-auto max-w-2xl leading-relaxed"
          style={{ color: "rgba(0,0,0,0.62)" }}
        >
          Factures, contrats, mails, échéances : tout est dispersé. Paipers
          regroupe l’essentiel pour que tu saches quoi faire, et quand.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              t: "Documents éparpillés",
              d: "PDF, photos, pièces jointes… difficiles à retrouver au bon moment.",
            },
            {
              t: "Échéances oubliées",
              d: "Renouvellements et dates importantes passent souvent inaperçus.",
            },
            {
              t: "Trop de friction",
              d: "Rédiger, classer, relancer : autant de tâches chronophages.",
            },
          ].map((c) => (
            <div key={c.t} className="paipers-elevated-card">
              <p className="font-extrabold text-base" style={{ color: PAIPERS_COLORS.textPrimary }}>
                {c.t}
              </p>
              <p className="mt-2 text-sm leading-relaxed paipers-text-muted">{c.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 3. Fonctionnalités */}
      <Section id="fonctionnalites" className="bg-[color:var(--paipers-muted)]">
        <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
          Ce que Paipers fait aujourd’hui
        </h2>
        <p className="mt-3 text-center paipers-text-muted max-w-2xl mx-auto">
          Des fonctions réellement disponibles sur le web, alignées sur l’app mobile.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              Icon: FolderOpen,
              t: "Coffre-fort documents",
              d: "Importe, classe et consulte tes documents administratifs.",
            },
            {
              Icon: Mail,
              t: "Emails connectés",
              d: "Branche Gmail ou Outlook pour importer des pièces jointes.",
            },
            {
              Icon: Bot,
              t: "Assistant Pupo",
              d: "Pose des questions sur ton admin et avance étape par étape.",
            },
            {
              Icon: Sparkles,
              t: "Générer des documents",
              d: "Rédige des courriers et prépare des PDF à partir de tes besoins.",
            },
            {
              Icon: Calendar,
              t: "Échéances",
              d: "Garde un œil sur les dates importantes liées à ton espace.",
            },
            {
              Icon: FileText,
              t: "Espace Professionnel",
              d: "Navigation Factures et coque Pro : la facturation complète reste sur mobile pour l’instant.",
            },
          ].map(({ Icon, t, d }) => (
            <div key={t} className="paipers-elevated-card flex gap-4 items-start">
              <span
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: "hsl(202 100% 94%)" }}
              >
                <Icon size={22} color={PAIPERS_COLORS.navy} />
              </span>
              <div>
                <p className="font-extrabold">{t}</p>
                <p className="mt-1.5 text-sm leading-relaxed paipers-text-muted">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 4. Pupo */}
      <Section id="pupo">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="order-2 lg:order-1">
            <h2 className="paipers-screen-title" style={{ fontSize: 32 }}>
              Pupo, ton assistant administratif
            </h2>
            <p className="mt-4 leading-relaxed paipers-text-muted">
              Pupo t’aide à comprendre un document, à préparer une démarche et à
              rester dans le périmètre administratif. Ce n’est pas un chatbot
              généraliste : il reste centré sur ton admin Paipers.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Réponses guidées sur tes documents",
                "Actions vers Documents, Générer ou Profil",
                "Pas de fausses suggestions inventées",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2.5 text-sm font-semibold">
                  <Check size={18} color={PAIPERS_COLORS.success} className="mt-0.5 shrink-0" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2 flex justify-center">
            <img
              src={PAIPERS_ASSETS.mascot}
              alt="Pupo"
              className="w-56 md:w-64 h-auto"
            />
          </div>
        </div>
      </Section>

      {/* 5. Personnel */}
      <Section id="particuliers" className="bg-[color:var(--paipers-muted)]">
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
              className="px-4 py-2 text-sm font-extrabold"
              style={{
                borderRadius: 999,
                background: "#fff",
                border: `1px solid ${PAIPERS_COLORS.border}`,
              }}
            >
              {t}
            </span>
          ))}
        </div>
      </Section>

      {/* 6. Pro */}
      <Section id="professionnels">
        <h2 className="paipers-screen-title" style={{ fontSize: 32 }}>
          Pour les professionnels
        </h2>
        <p className="mt-3 max-w-2xl leading-relaxed paipers-text-muted">
          L’espace Professionnel reprend la navigation mobile (Factures, Documents
          Pro, Profil entreprise). Sur le web, certaines fonctions de facturation
          sont encore en préparation : pas de faux clients, pas de chiffre
          d’affaires inventé, pas de checkout trompeur.
        </p>
        <div
          className="mt-8 paipers-elevated-card"
          style={{
            backgroundImage: gradientCss(PAIPERS_GRADIENTS.professionalSoft),
          }}
        >
          <p className="font-extrabold" style={{ color: PAIPERS_COLORS.navy }}>
            Transparent sur le périmètre
          </p>
          <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(26,43,74,0.8)" }}>
            La création complète de factures / devis, la synchro entreprise et la
            facturation électronique opérationnelle restent portées prioritairement
            sur l’app mobile. Le web affiche l’espace et les états réels disponibles.
          </p>
        </div>
      </Section>

      {/* 7. 3 étapes */}
      <Section className="bg-[color:var(--paipers-muted)]">
        <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
          En 3 étapes
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { n: "1", t: "Crée ton compte", d: "Inscription rapide, puis un onboarding guidé." },
            { n: "2", t: "Importe tes documents", d: "Fichiers, emails connectés, classement assisté." },
            { n: "3", t: "Agis avec Pupo", d: "Questions, génération, suivi de ton admin." },
          ].map((s) => (
            <div key={s.n} className="paipers-elevated-card">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold text-white"
                style={{ background: PAIPERS_COLORS.navy }}
              >
                {s.n}
              </span>
              <p className="mt-4 font-extrabold text-lg">{s.t}</p>
              <p className="mt-2 text-sm paipers-text-muted leading-relaxed">{s.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 8. Sécurité */}
      <Section>
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div
            className="paipers-elevated-card flex items-center gap-4"
            style={{ backgroundImage: gradientCss(PAIPERS_GRADIENTS.personalSoft) }}
          >
            <Shield size={40} color={PAIPERS_COLORS.navy} />
            <div>
              <p className="font-extrabold text-lg">Sécurité & validation humaine</p>
              <p className="mt-1 text-sm paipers-text-muted">
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

      {/* 9. Tarifs */}
      <Section id="tarifs" className="bg-[color:var(--paipers-muted)]">
        <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
          Tarifs simples
        </h2>
        <p className="mt-3 text-center paipers-text-muted">
          Les essais et formules suivent l’offre Paipers. Le paiement web n’est pas
          encore branché : l’inscription reste gratuite côté web.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-2 max-w-3xl mx-auto">
          <div className="paipers-elevated-card">
            <p className="text-sm font-extrabold" style={{ color: PAIPERS_COLORS.navy }}>
              Personnel
            </p>
            <p className="mt-2 text-3xl font-extrabold">6,99 € <span className="text-base font-bold paipers-text-muted">/ mois</span></p>
            <p className="mt-2 text-sm font-semibold">7 jours d’essai</p>
            <Link href="/signup" className="paipers-button mt-6 w-full text-center" style={{ display: "block" }}>
              Essayer gratuitement
            </Link>
          </div>
          <div
            className="paipers-elevated-card"
            style={{ borderColor: PAIPERS_COLORS.navy, borderWidth: 2 }}
          >
            <p className="text-sm font-extrabold" style={{ color: PAIPERS_COLORS.navy }}>
              Offre Professionnelle
            </p>
            <p className="mt-2 text-2xl font-extrabold">Tarif bientôt disponible</p>
            <p className="mt-2 text-sm font-semibold">14 jours d’essai au lancement</p>
            <Link href="/signup" className="paipers-button mt-6 w-full text-center" style={{ display: "block" }}>
              Essayer Paipers
            </Link>
            <p className="mt-3 text-xs paipers-text-muted leading-relaxed">
              Aucun abonnement Pro n’est activé automatiquement sur le web. Le checkout n’est
              pas encore disponible.
            </p>
          </div>
        </div>
      </Section>

      {/* 10. FAQ */}
      <Section id="faq">
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
              a: "Les connexions Gmail et Outlook passent par OAuth. Tu peux déconnecter un compte à tout moment depuis le Profil.",
            },
            {
              q: "Puis-je utiliser Paipers gratuitement ?",
              a: "Tu peux créer un compte et explorer l’espace. Les essais et formules payantes suivent l’offre Paipers ; le checkout web n’est pas encore disponible.",
            },
            {
              q: "Qu’est-ce que Pupo ?",
              a: "Pupo est l’assistant Paipers. Il t’aide sur ton administratif, sans promettre des actions hors périmètre.",
            },
          ].map((item) => (
            <details key={item.q} className="paipers-elevated-card group">
              <summary className="font-extrabold cursor-pointer list-none flex justify-between gap-3">
                {item.q}
                <span className="paipers-text-muted font-bold">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed paipers-text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Section>

      {/* 11. CTA final */}
      <Section
        className="text-center"
        id="essayer"
      >
        <div
          className="paipers-elevated-card py-12 px-6"
          style={{ backgroundImage: gradientCss(PAIPERS_GRADIENTS.personalSoft) }}
        >
          <h2 className="paipers-screen-title" style={{ fontSize: 32 }}>
            Prêt à reprendre le contrôle ?
          </h2>
          <p className="mt-3 mx-auto max-w-xl paipers-text-muted">
            Crée ton compte et commence avec tes documents, tes mails et Pupo.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup" className="paipers-button" style={{ minWidth: 200, textAlign: "center" }}>
              Essayer gratuitement
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center font-extrabold px-6 py-3.5"
              style={{
                borderRadius: PAIPERS_RADIUS.button,
                background: "#fff",
                border: `1px solid ${PAIPERS_COLORS.border}`,
                color: PAIPERS_COLORS.textPrimary,
                textDecoration: "none",
                minWidth: 200,
              }}
            >
              Se connecter
            </Link>
          </div>
        </div>
      </Section>

      {/* 12. Footer */}
      <footer
        className="border-t px-5 md:px-8 py-10"
        style={{ borderColor: PAIPERS_COLORS.border, background: "#fff" }}
      >
        <div
          className="mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-8"
          style={{ maxWidth: 1120 }}
        >
          <div>
            <img src={PAIPERS_ASSETS.logoSplashLight} alt="Paipers" className="h-8 w-auto" />
            <p className="mt-3 text-sm paipers-text-muted max-w-xs">
              Ton administratif, enfin sous contrôle.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div className="flex flex-col gap-2">
              <p className="font-extrabold">Produit</p>
              <a href="#fonctionnalites" style={{ color: PAIPERS_COLORS.neutral, textDecoration: "none" }}>
                Fonctionnalités
              </a>
              <a href="#tarifs" style={{ color: PAIPERS_COLORS.neutral, textDecoration: "none" }}>
                Tarifs
              </a>
              <Link href="/signup" style={{ color: PAIPERS_COLORS.neutral, textDecoration: "none" }}>
                Essayer
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-extrabold">Légal</p>
              <Link href="/legal/cgu" style={{ color: PAIPERS_COLORS.neutral, textDecoration: "none" }}>
                CGU
              </Link>
              <Link
                href="/legal/politique-confidentialite"
                style={{ color: PAIPERS_COLORS.neutral, textDecoration: "none" }}
              >
                Confidentialité
              </Link>
              <Link href="/login" style={{ color: PAIPERS_COLORS.neutral, textDecoration: "none" }}>
                Connexion
              </Link>
            </div>
          </div>
        </div>
        <p
          className="mx-auto mt-10 text-xs paipers-text-muted"
          style={{ maxWidth: 1120 }}
        >
          © {new Date().getFullYear()} Paipers. Mentions éditeur en cours de
          finalisation — voir les pages légales.
        </p>
      </footer>
    </div>
  );
}
