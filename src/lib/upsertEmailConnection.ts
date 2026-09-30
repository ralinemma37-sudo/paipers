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
  /** Écrit uniquement pour REMETTRE À ZÉRO la reprise quand la boîte change. */
  mailbox_synced_through?: string | null;
};

function normalizeAccountEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Reconnexion OAuth sur la clé (user, provider, account_scope).
 * Même boîte (ou boîte indéterminée) → le point de reprise est conservé :
 * renouveler des scopes ne doit pas déclencher un backfill complet.
 * Boîte différente → le curseur de l’ancien compte est effacé, jamais réutilisé.
 */
export function shouldKeepMailboxCursorOnReconnect(input: {
  previousAccountEmail: unknown;
  nextAccountEmail: unknown;
}): boolean {
  const previous = normalizeAccountEmail(input.previousAccountEmail);
  const next = normalizeAccountEmail(input.nextAccountEmail);
  if (!previous || !next) return true;
  return previous === next;
}

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
type UntypedSupabase = SupabaseClient<any, "public", any>;

/**
 * L’upsert n’écrit jamais `mailbox_synced_through` : une reconnexion du même compte
 * conserve donc la valeur en base. Le champ n’est ajouté (à null) que pour effacer
 * la reprise quand l’adresse de la boîte a changé sur cette clé.
 */
async function withMailboxCursorPolicy(
  supabase: UntypedSupabase,
  row: EmailConnectionUpsertRow
): Promise<EmailConnectionUpsertRow> {
  const { data, error } = await supabase
    .from("external_connections")
    .select("account_email")
    .eq("user_id", row.user_id)
    .eq("provider", row.provider)
    .eq("account_scope", row.account_scope)
    .maybeSingle();

  if (error || !data) return row;
  if (shouldKeepMailboxCursorOnReconnect({
    previousAccountEmail: (data as { account_email?: unknown }).account_email,
    nextAccountEmail: row.account_email,
  })) {
    return row;
  }
  return { ...row, mailbox_synced_through: null };
}

export async function upsertEmailConnection(
  supabase: UntypedSupabase,
  rowIn: EmailConnectionUpsertRow
): Promise<{ error: string | null; userMessage: string | null }> {
  const row = await withMailboxCursorPolicy(supabase, rowIn);
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
