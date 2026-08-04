/**
 * Accès admin waitlist — allowlist d’emails (env), sans toucher Auth/RLS métier.
 * WAITLIST_ADMIN_EMAILS=a@x.com,b@y.com
 */

import {
  isWaitlistAdminEmailFromEnv,
  normalizeEmail,
} from "@/lib/authRoutePolicy";

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
  return isWaitlistAdminEmailFromEnv(email);
}
