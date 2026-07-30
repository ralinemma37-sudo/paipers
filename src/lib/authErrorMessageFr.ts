import type { AuthError } from "@supabase/supabase-js";

const DEFAUT =
  "Une erreur s’est produite. Réessaie dans un instant. Si ça continue, vérifie ta connexion internet.";

type ErrLike = Pick<AuthError, "message"> & { code?: string; status?: number };

/**
 * Transforme les messages techniques Supabase Auth en texte simple en français.
 * Quand on ajoutera d’autres langues, on pourra router ici selon la locale de l’app.
 */
export function authErrorMessageFr(error: ErrLike | null | undefined): string {
  if (!error?.message) return DEFAUT;

  const code = String(error.code ?? "").toLowerCase();
  const m = error.message.toLowerCase();

  if (
    code === "invalid_credentials" ||
    m.includes("invalid login credentials") ||
    m.includes("invalid_credentials")
  ) {
    return "E-mail ou mot de passe incorrect. Vérifie bien tes identifiants, ou crée un compte si tu n’en as pas encore.";
  }

  if (code === "email_not_confirmed" || m.includes("email not confirmed") || m.includes("not confirmed")) {
    return "Tu dois d’abord confirmer ton adresse e-mail. Ouvre le message que nous t’avons envoyé (pense à regarder les courriers indésirables).";
  }

  if (
    code === "user_already_exists" ||
    m.includes("user already registered") ||
    m.includes("already been registered") ||
    m.includes("already exists")
  ) {
    return "Un compte existe déjà avec cette adresse e-mail. Connecte-toi ou utilise « mot de passe oublié » sur l’écran de connexion.";
  }

  if (
    code === "weak_password" ||
    m.includes("password should be") ||
    m.includes("password is too weak") ||
    m.includes("weak password")
  ) {
    return "Ce mot de passe est trop simple. Choisis un mot de passe plus long, avec des lettres et des chiffres (ou symboles).";
  }

  if (
    m.includes("invalid email") ||
    m.includes("unable to validate email") ||
    m.includes("invalid format") ||
    m.includes("email address is invalid")
  ) {
    return "Cette adresse e-mail ne semble pas valide. Vérifie qu’il n’y a pas de faute de frappe.";
  }

  if (m.includes("signup") && (m.includes("not allowed") || m.includes("disabled"))) {
    return "Les inscriptions sont momentanément désactivées. Réessaie plus tard ou contacte le support.";
  }

  if (m.includes("too many requests") || m.includes("rate limit") || m.includes("security purposes")) {
    return "Tu as fait trop de tentatives d’affilée. Attends une minute ou deux, puis réessaie.";
  }

  /** Session Supabase expirée ou stockage local effacé (refresh impossible). */
  if (
    m.includes("refresh token not found") ||
    m.includes("invalid refresh token") ||
    (m.includes("refresh") && m.includes("token") && (m.includes("invalid") || m.includes("not found")))
  ) {
    return "Ta session a expiré ou n’est plus valide. Déconnecte-toi puis reconnecte-toi pour continuer.";
  }

  if (
    m.includes("jwt") ||
    (m.includes("token") && (m.includes("expired") || m.includes("invalid"))) ||
    m.includes("refresh token")
  ) {
    return "Ta session n’est plus valide. Déconnecte-toi, reconnecte-toi, puis réessaie.";
  }

  if (m.includes("network") || m.includes("fetch") || m.includes("failed to fetch")) {
    return "Connexion internet instable ou coupée. Vérifie le réseau et réessaie.";
  }

  if (m.includes("same password") || m.includes("different from the old")) {
    return "Le nouveau mot de passe doit être différent de l’ancien.";
  }

  return DEFAUT;
}
