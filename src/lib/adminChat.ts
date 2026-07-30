/**
 * Appel Edge Function admin-chat (même contrat que le mobile).
 * Réf. : AssistantPage.tsx → supabase.functions.invoke("admin-chat")
 * Ne modifie aucun prompt / modèle (côté Edge Function).
 */

import { supabase } from "@/lib/supabase";
import {
  sanitizeAssistantReply,
  userMessageForFunctionsInvokeError,
} from "@/lib/assistantScopeGuard";

export type AssistantExternalAction = {
  label: string;
  url: string;
  isOfficial?: boolean;
};

export type AssistantSourceLink = {
  url: string;
  title: string | null;
};

export type AssistantHelpAction = {
  href: string;
  label: string;
};

export type AdminChatResult = {
  answer: string;
  documentIds: string[];
  externalActions: AssistantExternalAction[];
  sources: AssistantSourceLink[];
  helpActions: AssistantHelpAction[];
};

function parsePayload(data: Record<string, unknown>) {
  const externalActions: AssistantExternalAction[] = [];
  const rawExt = data.external_actions;
  if (Array.isArray(rawExt)) {
    for (const item of rawExt) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const url = typeof o.url === "string" ? o.url.trim() : "";
      const label = typeof o.label === "string" ? o.label.trim() : "";
      if (!url || !label) continue;
      externalActions.push({
        label,
        url,
        isOfficial: o.is_official === true || o.isOfficial === true,
      });
    }
  }

  const sources: AssistantSourceLink[] = [];
  const rawSrc = data.sources;
  if (Array.isArray(rawSrc)) {
    for (const item of rawSrc) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const url = typeof o.url === "string" ? o.url.trim() : "";
      if (!url) continue;
      sources.push({
        url,
        title: typeof o.title === "string" ? o.title : null,
      });
    }
  }

  const helpActions: AssistantHelpAction[] = [];
  const rawSuggested = data.suggested_actions;
  if (Array.isArray(rawSuggested)) {
    for (const item of rawSuggested) {
      if (!item || typeof item !== "object") continue;
      const o = item as Record<string, unknown>;
      const href = typeof o.href === "string" ? o.href.trim() : "";
      const label = typeof o.label === "string" ? o.label.trim() : "";
      if (href && label) helpActions.push({ href, label });
    }
  }

  const documentIds: string[] = [];
  const rawIds = data.document_ids;
  if (Array.isArray(rawIds)) {
    for (const id of rawIds) {
      if (typeof id === "string" && id.trim()) documentIds.push(id.trim());
    }
  }

  return { externalActions, sources, helpActions, documentIds };
}

export async function invokeAdminChat(input: {
  message: string;
  documentId?: string;
}): Promise<AdminChatResult> {
  const { data, error } = await supabase.functions.invoke("admin-chat", {
    body: {
      message: input.message,
      ...(input.documentId ? { document_id: input.documentId } : {}),
    },
  });

  if (error) {
    throw new Error(userMessageForFunctionsInvokeError(error));
  }

  const payload = (data && typeof data === "object" ? data : {}) as Record<
    string,
    unknown
  >;

  if (!payload.success || typeof payload.answer !== "string" || !payload.answer.trim()) {
    throw new Error(
      typeof payload.error === "string" && payload.error.trim()
        ? payload.error
        : "Je n'ai pas réussi à traiter ta demande. Réessaie dans un instant.",
    );
  }

  const parsed = parsePayload(payload);
  return {
    answer: sanitizeAssistantReply(payload.answer),
    ...parsed,
  };
}
