export type PasswordStrengthLevel = "vide" | "trop_court" | "faible" | "moyen" | "fort";

export type PasswordChecks = {
  minLength: boolean;
  lower: boolean;
  upper: boolean;
  digit: boolean;
  special: boolean;
};

const MIN_LEN = 8;
const SPECIAL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

export function analyzePassword(password: string): {
  level: PasswordStrengthLevel;
  score: number;
  checks: PasswordChecks;
  label: string;
} {
  const checks: PasswordChecks = {
    minLength: password.length >= MIN_LEN,
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    digit: /\d/.test(password),
    special: SPECIAL_RE.test(password),
  };

  const variety = [
    checks.lower,
    checks.upper,
    checks.digit,
    checks.special,
  ].filter(Boolean).length;

  if (password.length === 0) {
    return { level: "vide", score: 0, checks, label: "" };
  }

  if (password.length < MIN_LEN) {
    return {
      level: "trop_court",
      score: 1,
      checks,
      label: `Au moins ${MIN_LEN} caractères`,
    };
  }

  if (variety <= 1) {
    return {
      level: "faible",
      score: 2,
      checks,
      label: "Faible — mélange lettres, chiffres et symboles",
    };
  }

  if (variety === 2 || variety === 3) {
    return {
      level: "moyen",
      score: 3,
      checks,
      label: "Moyen — ajoute d’autres types de caractères",
    };
  }

  return {
    level: "fort",
    score: 4,
    checks,
    label: "Mot de passe solide",
  };
}

export function passwordMeetsSignupRequirements(password: string): boolean {
  const { level } = analyzePassword(password);
  return level === "fort";
}
