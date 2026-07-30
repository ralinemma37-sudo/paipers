/**
 * Contenu cartes inscription — miroir signupSpaceContent.ts + prix plansConfig.
 * Réf. mobile :
 * - src/lib/signup/signupSpaceContent.ts
 * - src/features/onboarding/onboardingPricing.ts
 * - src/config/plansConfig.ts (free 20 docs, premium 7.99, pro 29.99, trial 14j)
 */

import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export type OnboardingSpaceChoice = "personal" | "professional";

export type SignupSpaceAccent = {
  border: string;
  badgeBg: string;
  badgeText: string;
  ctaBorder: string;
  ctaText: string;
};

export function signupSpaceAccent(space: OnboardingSpaceChoice): SignupSpaceAccent {
  if (space === "personal") {
    return {
      border: PAIPERS_COLORS.personalGradientStart,
      badgeBg: PAIPERS_COLORS.personalGradientSoftStart,
      badgeText: "#1A6FA8",
      ctaBorder: PAIPERS_COLORS.personalGradientStart,
      ctaText: "#1A6FA8",
    };
  }
  const navy = PAIPERS_COLORS.navy;
  return {
    border: navy,
    badgeBg: "#E8EDF5",
    badgeText: navy,
    ctaBorder: navy,
    ctaText: navy,
  };
}

export type SignupSpaceCard = {
  title: string;
  badge: string;
  description: string;
  benefits: string[];
  priceLine: string;
  trialLine: string | null;
  cta: string;
};

export const SIGNUP_SPACE_CARDS: Record<OnboardingSpaceChoice, SignupSpaceCard> = {
  personal: {
    title: "Personnel",
    badge: "Gratuit",
    description:
      "Pour centraliser vos papiers, démarches, contrats, abonnements et échéances.",
    benefits: [
      "Documents classés automatiquement",
      "Recherche intelligente",
      "Alertes avant les échéances",
    ],
    priceLine: "Gratuit jusqu'à 20 documents · Puis 7,99 €/mois",
    trialLine: null,
    cta: "Choisir Personnel",
  },
  professional: {
    title: "Professionnel",
    badge: "29,99 €/mois",
    description:
      "Pour gérer votre administratif, vos factures, vos fournisseurs et votre trésorerie.",
    benefits: [
      "Factures clients et fournisseurs",
      "Trésorerie et relances",
      "Pré-comptabilité et assistant IA",
    ],
    priceLine: "29,99 €/mois · essai 14 jours",
    trialLine: "14 jours d'essai gratuit",
    cta: "Choisir Professionnel",
  },
};

export function signupOfferSummary(space: OnboardingSpaceChoice): {
  label: string;
  price: string;
} {
  const card = SIGNUP_SPACE_CARDS[space];
  const rawPrice =
    space === "personal" ? card.priceLine : card.badge;
  return { label: card.title, price: rawPrice.replace(/ €\//g, "\u00A0€/") };
}

export function spaceRequiresPayment(space: OnboardingSpaceChoice): boolean {
  return space === "professional";
}

export function accountTypeForSpace(space: OnboardingSpaceChoice): "personal" | "pro" {
  return space === "professional" ? "pro" : "personal";
}

export function subscriptionPlanForSpace(space: OnboardingSpaceChoice): "free" | "pro" {
  return space === "professional" ? "pro" : "free";
}
