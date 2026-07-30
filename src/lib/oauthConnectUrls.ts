/**
 * URLs OAuth web — réf. paipers-mobile/src/lib/oauthConnectUrls.ts
 * Chemins relatifs (même origine Next) pour platform=web.
 */

import type { AccountScope } from "@/lib/accountScope";

export function gmailConnectUrl(
  userId: string,
  accountScope: AccountScope = "personal",
): string {
  const u = new URL("/auth/gmail", window.location.origin);
  u.searchParams.set("platform", "web");
  u.searchParams.set("user_id", userId);
  u.searchParams.set("account_scope", accountScope);
  return u.toString();
}

export function outlookConnectUrl(
  userId: string,
  accountScope: AccountScope = "personal",
): string {
  const u = new URL("/auth/outlook", window.location.origin);
  u.searchParams.set("platform", "web");
  u.searchParams.set("user_id", userId);
  u.searchParams.set("account_scope", accountScope);
  return u.toString();
}
