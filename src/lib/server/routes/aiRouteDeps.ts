/**
 * SEC-1 — Dépendances communes des routes IA (remplacées par des simulations dans les tests).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  defaultAuthDeps,
  quotaDepsFromServiceClient,
  type AuthDeps,
  type QuotaDeps,
} from "@/lib/server/apiAuth";
import { getServiceSupabase } from "@/lib/supabaseAdmin";

/** Création d'une réponse OpenAI (chat.completions.create) — renvoie l'objet brut. */
export type ChatCompletionFn = (body: Record<string, unknown>) => Promise<unknown>;

export type AiRouteDeps = {
  auth: AuthDeps;
  quota: QuotaDeps;
  /** true si une clé OpenAI est configurée côté serveur. */
  hasOpenAiKey: () => boolean;
  createChatCompletion: ChatCompletionFn;
};

export function defaultAiRouteDeps(): AiRouteDeps {
  return {
    auth: defaultAuthDeps(),
    quota: quotaDepsFromServiceClient((): SupabaseClient => getServiceSupabase()),
    hasOpenAiKey: () => Boolean(process.env.OPENAI_API_KEY?.trim()),
    async createChatCompletion(body) {
      const { default: OpenAI } = await import("openai");
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY?.trim() });
      return client.chat.completions.create(body as never);
    },
  };
}

/** Texte de la première réponse (chaîne) d'un objet chat.completions, ou "". */
export function firstMessageText(completion: unknown): string {
  const c = completion as { choices?: Array<{ message?: { content?: unknown } }> } | null;
  const content = c?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}
