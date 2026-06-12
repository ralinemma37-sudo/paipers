import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccountScope } from "./accountScope";

type EmailProvider = "gmail" | "outlook";

export type EmailConnectionUpsertRow = {
  user_id: string;
  provider: EmailProvider;
  account_scope: AccountScope;
  account_email: string | null;
  provider_account_id?: string | null;
  refresh_token: string;
  access_token?: string | null;
  expires_at?: string | null;
  scopes: string[];
  metadata: Record<string, unknown>;
  updated_at: string;
};

function isOnConflictConstraintError(message: string): boolean {
  return /no unique or exclusion constraint matching the on conflict specification/i.test(message);
}

function isMissingAccountScopeColumn(message: string): boolean {
  const m = message.toLowerCase();
  return m.includes("account_scope") && (m.includes("schema cache") || m.includes("column"));
}

/**
 * Upsert `external_connections` aligné sur UNIQUE(user_id, provider, account_scope).
 * Repli legacy UNIQUE(user_id, provider) si la migration scope n’est pas encore appliquée.
 */
export async function upsertEmailConnection(
  supabase: SupabaseClient,
  row: EmailConnectionUpsertRow
): Promise<{ error: string | null; userMessage: string | null }> {
  const scoped = await supabase.from("external_connections").upsert(row, {
    onConflict: "user_id,provider,account_scope",
  });

  if (!scoped.error) return { error: null, userMessage: null };

  if (isMissingAccountScopeColumn(scoped.error.message)) {
    const { account_scope: _scope, ...legacyRow } = row;
    const legacy = await supabase.from("external_connections").upsert(legacyRow, {
      onConflict: "user_id,provider",
    });
    if (!legacy.error) return { error: null, userMessage: null };
    return {
      error: legacy.error.message,
      userMessage: userFacingEmailConnectionDbError(legacy.error.message),
    };
  }

  if (isOnConflictConstraintError(scoped.error.message)) {
    return {
      error: scoped.error.message,
      userMessage:
        "La connexion Gmail n’a pas pu être enregistrée (configuration serveur incomplète). Réessaie dans quelques minutes ou contacte le support.",
    };
  }

  return {
    error: scoped.error.message,
    userMessage: userFacingEmailConnectionDbError(scoped.error.message),
  };
}

export function userFacingEmailConnectionDbError(message: string): string {
  const m = message.trim();
  if (!m) return "Impossible d’enregistrer la connexion Gmail. Réessaie.";
  if (isOnConflictConstraintError(m)) {
    return "La connexion Gmail n’a pas pu être enregistrée (configuration serveur incomplète). Réessaie dans quelques minutes ou contacte le support.";
  }
  if (/duplicate key value violates unique constraint/i.test(m)) {
    return "Ce compte Gmail est déjà connecté à Paipers.";
  }
  if (/violates foreign key constraint/i.test(m)) {
    return "Compte utilisateur introuvable. Reconnecte-toi à Paipers puis réessaie.";
  }
  return "Impossible d’enregistrer la connexion Gmail. Réessaie dans un instant.";
}
