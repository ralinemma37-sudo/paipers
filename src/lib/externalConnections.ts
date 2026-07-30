/**
 * Connexions email — réf. paipers-mobile/src/lib/externalConnections.ts
 */

import type { AccountScope } from "@/lib/accountScope";
import { supabase } from "@/lib/supabase";

export type EmailProvider = "gmail" | "outlook";

export type ExternalConnectionRow = {
  id?: string;
  account_email: string | null;
  account_scope?: AccountScope | null;
  updated_at?: string | null;
};

function isMissingScopeColumn(error: { message?: string; code?: string } | null): boolean {
  if (!error) return false;
  const msg = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
  return msg.includes("account_scope") || msg.includes("column") || error.code === "42703";
}

export async function loadEmailConnection(
  userId: string,
  provider: EmailProvider,
  scope: AccountScope,
): Promise<ExternalConnectionRow | null> {
  const scoped = await supabase
    .from("external_connections")
    .select("id, account_email, account_scope, updated_at")
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("account_scope", scope)
    .maybeSingle();

  if (!scoped.error && scoped.data) {
    return scoped.data as ExternalConnectionRow;
  }

  if (scoped.error && !isMissingScopeColumn(scoped.error)) {
    return null;
  }

  if (scope !== "personal") return null;

  const legacy = await supabase
    .from("external_connections")
    .select("id, account_email, updated_at")
    .eq("user_id", userId)
    .eq("provider", provider)
    .maybeSingle();

  return (legacy.data as ExternalConnectionRow) ?? null;
}

export async function deleteEmailConnection(
  userId: string,
  provider: EmailProvider,
  scope: AccountScope,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("external_connections")
    .delete()
    .eq("user_id", userId)
    .eq("provider", provider)
    .eq("account_scope", scope);

  if (!error || !isMissingScopeColumn(error)) {
    return { error: error?.message ?? null };
  }

  if (scope === "personal") {
    const legacy = await supabase
      .from("external_connections")
      .delete()
      .eq("user_id", userId)
      .eq("provider", provider);
    return { error: legacy.error?.message ?? null };
  }

  return { error: error.message };
}
