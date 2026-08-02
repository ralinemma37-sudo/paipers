/**
 * Preuve sociale waitlist — textes honnêtes basés sur confirmed=true uniquement.
 * Fonctions pures (testables sans réseau).
 */

export type SocialProofContext = "landing" | "confirm";

export type SocialProofResult =
  | { visible: false; text: null }
  | { visible: true; text: string; flooredAt?: number };

/**
 * Arrondi vers le bas pour affichage public (≥ 200).
 * - 200–499 → paliers de 50
 * - ≥ 500 → paliers de 100
 * Jamais supérieur au count réel.
 */
export function floorConfirmedForDisplay(count: number): number {
  const n = Math.max(0, Math.floor(count));
  if (n < 200) return n;
  if (n < 500) return Math.floor(n / 50) * 50;
  return Math.floor(n / 100) * 100;
}

export function socialProofForLanding(confirmedCount: number): SocialProofResult {
  const n = Math.max(0, Math.floor(confirmedCount));
  if (n < 10) return { visible: false, text: null };
  if (n < 50) {
    return {
      visible: true,
      text: "Rejoins les premières personnes inscrites à Paipers.",
    };
  }
  if (n < 100) {
    return {
      visible: true,
      text: "Déjà plus de 50 personnes attendent Paipers.",
      flooredAt: 50,
    };
  }
  if (n < 200) {
    return {
      visible: true,
      text: "Déjà plus de 100 personnes attendent Paipers.",
      flooredAt: 100,
    };
  }
  const floored = floorConfirmedForDisplay(n);
  return {
    visible: true,
    text: `Déjà plus de ${floored} personnes attendent Paipers.`,
    flooredAt: floored,
  };
}

export function socialProofForConfirm(confirmedCount: number): SocialProofResult {
  const n = Math.max(0, Math.floor(confirmedCount));
  if (n < 10) {
    return {
      visible: true,
      text: "Tu fais partie des toutes premières personnes à rejoindre Paipers.",
    };
  }
  if (n < 50) {
    return {
      visible: true,
      text: "Tu rejoins les premières personnes inscrites à Paipers.",
    };
  }
  if (n < 100) {
    return {
      visible: true,
      text: "Tu rejoins déjà plus de 50 personnes intéressées par Paipers.",
      flooredAt: 50,
    };
  }
  if (n < 200) {
    return {
      visible: true,
      text: "Tu rejoins déjà plus de 100 personnes intéressées par Paipers.",
      flooredAt: 100,
    };
  }
  const floored = floorConfirmedForDisplay(n);
  return {
    visible: true,
    text: `Tu rejoins déjà plus de ${floored} personnes intéressées par Paipers.`,
    flooredAt: floored,
  };
}

export function socialProofText(
  confirmedCount: number,
  context: SocialProofContext,
): SocialProofResult {
  return context === "landing"
    ? socialProofForLanding(confirmedCount)
    : socialProofForConfirm(confirmedCount);
}
