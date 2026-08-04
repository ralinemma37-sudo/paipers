/**
 * Helpers auth edge / middleware — pas de secrets service role.
 */

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Allowlist admin waitlist (Edge-compatible). Fail-closed si vide. */
export function isWaitlistAdminEmailFromEnv(
  email: string | null | undefined,
): boolean {
  if (!email) return false;
  const raw =
    process.env.WAITLIST_ADMIN_EMAILS ||
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    "";
  const admins = raw
    .split(",")
    .map((e) => normalizeEmail(e))
    .filter(Boolean);
  if (admins.length === 0) return false;
  return admins.includes(normalizeEmail(email));
}

/**
 * Préfixes / chemins privés (pages app) — hors marketing & auth publique.
 */
export const PRIVATE_PATH_PREFIXES = [
  "/dashboard",
  "/documents",
  "/assistant",
  "/profil",
  "/admin",
  "/agenda",
  "/factures",
  "/generer",
  "/demarches",
  "/onboarding",
] as const;

export function isPrivateAppPath(pathname: string): boolean {
  return PRIVATE_PATH_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

export function isAdminWaitlistPath(pathname: string): boolean {
  return pathname === "/admin/waitlist" || pathname.startsWith("/admin/waitlist/");
}
