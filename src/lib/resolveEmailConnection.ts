/**
 * Réf. : paipers-mobile/supabase/functions/_shared/resolveEmailConnection.ts
 * Trouve un refresh_token Gmail/Outlook (external_connections + legacy gmail_connections).
 */

import type { AccountScope } from "@/lib/accountScope";
import type { EmailProvider } from "@/lib/externalConnections";
import type { SupabaseClient } from "@supabase/supabase-js";

type ConnRow = { refresh_token: string | null; account_email?: string | null };

function scopeOrder(preferred?: AccountScope): AccountScope[] {
  const base: AccountScope[] = ["personal", "pro", "family"];
  if (!preferred) return base;
  return [preferred, ...base.filter((s) => s !== preferred)];
}

export async function resolveEmailRefreshToken(
  supabase: SupabaseClient,
  userId: string,
  provider: EmailProvider,
  opts?: { preferredScope?: AccountScope; accountEmail?: string | null },
): Promise<string | null> {
  const emailHint = opts?.accountEmail?.trim().toLowerCase() || "";

  if (emailHint) {
    const { data: byEmail } = await supabase
      .from("external_connections")
      .select("refresh_token, account_email")
      .eq("user_id", userId)
      .eq("provider", provider)
      .ilike("account_email", emailHint)
      .not("refresh_token", "is", null)
      .limit(1);
    const hit = (byEmail as ConnRow[] | null)?.[0];
    if (hit?.refresh_token) return hit.refresh_token;
  }

  for (const scope of scopeOrder(opts?.preferredScope)) {
    const { data } = await supabase
      .from("external_connections")
      .select("refresh_token")
      .eq("user_id", userId)
      .eq("provider", provider)
      .eq("account_scope", scope)
      .maybeSingle();
    if ((data as ConnRow | null)?.refresh_token) {
      return (data as ConnRow).refresh_token!;
    }
  }

  const { data: anyScoped } = await supabase
    .from("external_connections")
    .select("refresh_token")
    .eq("user_id", userId)
    .eq("provider", provider)
    .not("refresh_token", "is", null)
    .limit(1);
  const fallback = (anyScoped as ConnRow[] | null)?.[0];
  if (fallback?.refresh_token) return fallback.refresh_token;

  if (provider === "gmail") {
    if (emailHint) {
      const { data: legacyEmail } = await supabase
        .from("gmail_connections")
        .select("refresh_token")
        .ilike("email", emailHint)
        .maybeSingle();
      if ((legacyEmail as ConnRow | null)?.refresh_token) {
        return (legacyEmail as ConnRow).refresh_token!;
      }
    }
    const { data: legacyUser } = await supabase
      .from("gmail_connections")
      .select("refresh_token")
      .eq("user_id", userId)
      .maybeSingle();
    if ((legacyUser as ConnRow | null)?.refresh_token) {
      return (legacyUser as ConnRow).refresh_token!;
    }
  }

  return null;
}
