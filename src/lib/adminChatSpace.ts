/**
 * Assistant web → admin-chat : espace actif (lot Archi « espace actif », même règles que l'appli mobile,
 * commits paipers-mobile 28344650 / 9642cf65 / a6d4925).
 *
 * - L'espace vient de NavSpaceProvider, SEULEMENT s'il a été confirmé (valeur mémorisée « personal » / « pro »,
 *   ou choix fait par la personne). Le Perso affiché par défaut n'est jamais transmis.
 * - « pro » → « professional », « personal » → « personal ». « family » → non pris en charge.
 * - Espace en chargement, inconnu ou non pris en charge : pièce jointe, recherche documentaire et parcours
 *   incertain bloqués ICI (aucune requête) ; seuls les usages sans document confirmés partent, sans espace.
 * - Références (liens vers les pièces) affichées seulement si le serveur confirme l'espace envoyé.
 *
 * Pur (sans I/O) : testé par src/lib/adminChatSpace.verify.ts.
 */
// Copie exacte de supabase/functions/admin-chat/intentRouter.ts (dépôt paipers-mobile) — empreinte vérifiée par le test.
import { classifyAssistantIntent, detectDocumentSearchIntent } from "./adminChatIntentRouterMirror";

export type AdminChatSpace = "personal" | "professional";

export type WebAdminChatSpaceState =
  | { status: "ready"; space: AdminChatSpace }
  | { status: "loading" }
  | { status: "unknown" }
  | { status: "unsupported" };

/** `confirmedScope` : valeur mémorisée valide ou choix explicite ; null = rien de confirmé (premier passage…). */
export function webAdminChatSpaceState(input: {
  loaded: boolean;
  confirmedScope: string | null | undefined;
}): WebAdminChatSpaceState {
  if (!input.loaded) return { status: "loading" };
  if (input.confirmedScope === "personal") return { status: "ready", space: "personal" };
  if (input.confirmedScope === "pro") return { status: "ready", space: "professional" };
  if (input.confirmedScope === "family") return { status: "unsupported" };
  return { status: "unknown" };
}

/** Intentions serveur dont la branche d'admin-chat répond sans lire de document (v37 et nouveau serveur). */
export const ADMIN_CHAT_NO_DOCUMENT_INTENTS = [
  "action_request",
  "unknown_fallback",
  "unknown_or_chat",
  "administrative_knowledge",
  "general_admin_help",
  "paipers_knowledge",
  "paipers_feature_help",
  "document_generation",
] as const;
const NO_DOCUMENT_INTENTS: ReadonlySet<string> = new Set(ADMIN_CHAT_NO_DOCUMENT_INTENTS);

const USER_DOCUMENT_REFERENCE_RE =
  /\b(mon|ma|mes|notre|nos|ce|cet|cette|ces)\s+(?:[\p{L}'’-]+\s+){0,2}?(factures?|contrats?|documents?|pdf|fichiers?|bail|baux|quittances?|avis|attestations?|assurances?|mutuelles?|rib|relev[ée]s?|courriers?|lettres?|devis|bulletins?|fiches? de paie|imp[ôo]ts?|taxes?|abonnements?|[ée]ch[ée]ances?|dossiers?|papiers?|pi[èe]ces? jointes?|justificatifs?|re[çc]us?|pr[ée]l[èe]vements?)\b/iu;
const DEFINITE_DOCUMENT_RE = /\b(le|les|la|l['’])\s*(documents?|pdf|fichiers?|pi[èe]ces? jointes?)\b/iu;

export function mentionsUserDocuments(message: string): boolean {
  const t = String(message || "").trim();
  return USER_DOCUMENT_REFERENCE_RE.test(t) || DEFINITE_DOCUMENT_RE.test(t) || detectDocumentSearchIntent(t);
}

export type BlockReason = "attachment" | "document_route" | "document_reference";

/** Le site n'envoie pas d'intention : le serveur classe le message seul (même routeur ici). */
export function webTransitionDecision(input: { message: string; documentId?: string | null }):
  | { send: true; serverIntent: string }
  | { send: false; reason: BlockReason; serverIntent: string | null } {
  if (String(input.documentId || "").trim()) return { send: false, reason: "attachment", serverIntent: null };
  const message = String(input.message || "").trim();
  const serverIntent = classifyAssistantIntent(message, undefined);
  if (!NO_DOCUMENT_INTENTS.has(serverIntent)) return { send: false, reason: "document_route", serverIntent };
  if (mentionsUserDocuments(message)) return { send: false, reason: "document_reference", serverIntent };
  return { send: true, serverIntent };
}

export const WEB_SCOPE_LOADING_TEXT =
  "Je charge encore ton espace (Perso ou Pro) pour chercher au bon endroit. Réessaie dans un instant.";
export const WEB_SCOPE_UNKNOWN_TEXT =
  "Choisis d’abord ton espace (Perso ou Pro) avec le sélecteur d’espace, puis repose ta question : je chercherai dans les bons documents.";
export const WEB_SCOPE_UNSUPPORTED_TEXT =
  "Je ne peux chercher dans tes documents que dans ton espace Perso ou Pro. Passe dans l’un des deux, puis repose ta question.";

export function webScopeBlockedText(state: WebAdminChatSpaceState): string {
  if (state.status === "loading") return WEB_SCOPE_LOADING_TEXT;
  if (state.status === "unsupported") return WEB_SCOPE_UNSUPPORTED_TEXT;
  return WEB_SCOPE_UNKNOWN_TEXT;
}

export type WebAdminChatBody = { message: string; space?: AdminChatSpace; document_id?: string };

export function buildWebAdminChatBody(input: {
  message: string;
  documentId?: string | null;
  state: WebAdminChatSpaceState;
}): WebAdminChatBody {
  return {
    message: input.message,
    ...(input.state.status === "ready" ? { space: input.state.space } : {}),
    ...(input.documentId ? { document_id: input.documentId } : {}),
  };
}

export type WebAdminChatInvoke = (body: WebAdminChatBody) => Promise<{ data: unknown; error: unknown }>;

export async function sendWebAdminChatGuarded(input: {
  message: string;
  documentId?: string | null;
  state: WebAdminChatSpaceState;
  invoke: WebAdminChatInvoke;
}): Promise<
  | { kind: "blocked"; text: string; reason: BlockReason }
  | { kind: "sent"; data: unknown; error: unknown; sentSpace: AdminChatSpace | null }
> {
  if (input.state.status !== "ready") {
    const d = webTransitionDecision(input);
    if (!d.send) return { kind: "blocked", text: webScopeBlockedText(input.state), reason: d.reason };
  }
  const { data, error } = await input.invoke(buildWebAdminChatBody(input));
  return { kind: "sent", data, error, sentSpace: input.state.status === "ready" ? input.state.space : null };
}

/** Espace confirmé par le serveur (nouveau contrat). Ancien serveur (sans document_scope) → null. */
export function confirmedServerScope(data: Record<string, unknown>, sent: AdminChatSpace | null): AdminChatSpace | null {
  const s = data.document_scope;
  return (s === "personal" || s === "professional") && s === sent ? s : null;
}

/**
 * Texte à afficher à la place de la réponse serveur quand celui-ci a fermé la recherche documentaire
 * (`document_scope_unavailable`, message prévu pour le mobile « mets à jour l'application ») ; null sinon.
 */
export function webScopeClosedText(data: Record<string, unknown>, state: WebAdminChatSpaceState): string | null {
  if (data.intent !== "document_scope_unavailable") return null;
  return state.status === "ready" ? WEB_SCOPE_UNKNOWN_TEXT : webScopeBlockedText(state);
}

/**
 * Traitement de la réponse : message web si la recherche a été fermée, et liens vers les pièces seulement
 * quand le serveur confirme l'espace envoyé (nouveau contrat). Ancien serveur : réponse gardée, sans liens.
 */
export function finalizeWebAdminChatReply(input: {
  payload: Record<string, unknown>;
  state: WebAdminChatSpaceState;
  sentSpace: AdminChatSpace | null;
  serverAnswer: string;
  documentIds: string[];
}): { answer: string; documentIds: string[]; scopeConfirmed: boolean } {
  const closedText = webScopeClosedText(input.payload, input.state);
  const scopeConfirmed = !closedText && confirmedServerScope(input.payload, input.sentSpace) !== null;
  return {
    answer: closedText ?? input.serverAnswer,
    documentIds: scopeConfirmed ? input.documentIds : [],
    scopeConfirmed,
  };
}
