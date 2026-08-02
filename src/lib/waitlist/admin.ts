/**
 * Accès admin waitlist — allowlist d’emails (env), sans toucher Auth/RLS métier.
 * WAITLIST_ADMIN_EMAILS=a@x.com,b@y.com
 */

import { normalizeEmail } from "@/lib/waitlist/types";

export function getWaitlistAdminEmails(): string[] {
  const raw =
    process.env.WAITLIST_ADMIN_EMAILS ||
    process.env.ADMIN_EMAILS ||
    process.env.ADMIN_EMAIL ||
    "";
  return raw
    .split(",")
    .map((e) => normalizeEmail(e))
    .filter(Boolean);
}

export function isWaitlistAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const admins = getWaitlistAdminEmails();
  if (admins.length === 0) return false;
  return admins.includes(normalizeEmail(email));
}
