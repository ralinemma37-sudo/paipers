/**
 * Garde-fous & réponses sociales Assistant.
 * Réf. : paipers-mobile/src/features/assistant/assistantScopeGuard.ts
 * Version web allégée : sans intentOrchestrator / paipersHelpTopics (non portés).
 */

function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[''`´]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ADMIN_TOPIC_RE =
  /\b(facture|contrat|document|pdf|courrier|lettre|echeance|impot|impots|caf|urssaf|bail|resiliation|assurance|loyer|paipers|gmail|outlook|scanner|agenda|rappel|rendez-vous|rdv|notaire|prefecture|mairie|sinistre|remboursement|attestation|bulletin|devis|fiche de paie|bulletin de salaire)\b/i;

const LEISURE_OR_GENERAL_RE =
  /\b(foot|football|rugby|basket|tennis|handball|volley|sport|match|championnat|ligue\s*1|coupe\s+du\s+monde|equipe|but|penalty|joueur|stade|meteo|temps qu il fait|recette|cuisine|film|serie|cinema|acteur|actrice|chanson|musique|concert|capitale de|combien fait|\d\s+fois\s+\d|fois\s+\d|calcul|arithmetique|pokemon|jeu video|fortnite|minecraft|blague|devinette)\b/i;

export function isSimpleAssistantSocialPrompt(promptOrNorm: string): boolean {
  const n = norm(promptOrNorm);
  if (!n) return false;
  if (
    /^(bonjour|salut|coucou|hello|hey|bonsoir|yo)(\s+(paipers|assistant|toi|emma))?\s*[!.?]*$/.test(
      n,
    )
  ) {
    return true;
  }
  if (
    /^(merci|merci beaucoup|thanks|ok|daccord|d accord|oui|non|super|parfait|nickel)\s*[!.?]*$/.test(
      n,
    )
  ) {
    return true;
  }
  if (/^(ca va|comment ca va|tu vas bien)\s*[!.?]*$/.test(n)) return true;
  return false;
}

export function shouldDeclineAssistantPrompt(prompt: string): boolean {
  const t = prompt.trim();
  if (!t || t.length < 3) return false;
  const n = norm(t);
  if (isSimpleAssistantSocialPrompt(n)) return false;
  if (LEISURE_OR_GENERAL_RE.test(n)) return true;
  if (ADMIN_TOPIC_RE.test(t)) return false;
  if (
    /\b(redige|rediger|genere|generer|signe|envoie|envoyer|importe|scanne|trouve mon|cherche mon|classe|classer)\b/i.test(
      prompt,
    )
  ) {
    return false;
  }
  if (
    /\b(tu sais|est ce que tu sais|dis moi|peux tu me dire|je veux savoir)\b/.test(n) &&
    !ADMIN_TOPIC_RE.test(n) &&
    /\?/.test(t)
  ) {
    return true;
  }
  if (/\?/.test(t) && !ADMIN_TOPIC_RE.test(n) && /\b(combien|calcul|fois|joue|jouent|equipe|foot|sport|savoir)\b/.test(n)) {
    return true;
  }
  return false;
}

export function assistantSocialReplyText(prompt: string, firstName?: string): string {
  const n = norm(prompt);
  const name = firstName?.trim();
  const hi = name ? ` ${name}` : "";

  if (/^(merci|merci beaucoup|thanks)/.test(n)) {
    return `Avec plaisir${hi} ! Dis-moi si tu as besoin d’autre chose sur tes documents ou démarches.`;
  }
  if (/^(ok|daccord|d accord|oui|super|parfait|nickel)/.test(n)) {
    return `Parfait. Tu peux me demander par exemple de retrouver une facture, classer un document, ou préparer une résiliation.`;
  }
  if (/^(non)\s*[!.?]*$/.test(n)) {
    return `Pas de souci. Je reste dispo dès que tu as une demande administrative.`;
  }
  if (/^(ca va|comment ca va|tu vas bien)/.test(n)) {
    return `Ça va très bien, merci${hi} ! Je veille sur ton administratif. Que veux-tu que je fasse ?`;
  }
  return `Salut${hi} ! Je suis ton assistant Paipers. Je peux retrouver une facture, analyser tes mails, classer un document ou t’aider pour une résiliation. Que veux-tu faire ?`;
}

export function assistantOutOfScopeReplyText(): string {
  return "Ce sujet ne fait pas partie de ma mission : je t’aide sur ton administratif (documents, courriers, échéances, factures…). Pour ce type d’info, je te conseille de consulter internet ou une appli dédiée.";
}

/** Réf. : paipers-mobile/src/lib/edgeFunctionClientError.ts */
export function userMessageForFunctionsInvokeError(error: unknown): string {
  if (error && typeof error === "object" && "name" in error) {
    const name = (error as { name: string }).name;
    if (name === "FunctionsFetchError") {
      return "Problème de connexion. Vérifie ta connexion internet ou réessaie dans un instant.";
    }
    if (name === "FunctionsHttpError") {
      const status = (error as { context?: { status?: number } }).context?.status;
      if (status === 404) {
        return "Ce service n’est pas disponible pour le moment. Réessaie plus tard ou contacte le support.";
      }
      if (status === 401 || status === 403) {
        return "Session expirée. Reconnecte-toi puis réessaie.";
      }
      if (status === 504 || status === 546) {
        return "L'analyse du document a pris trop de temps. Réessaie dans un instant.";
      }
      if (status != null && status >= 500) {
        return "Le service est temporairement indisponible. Réessaie dans quelques minutes.";
      }
      return "Le service a renvoyé une erreur. Réessaie plus tard.";
    }
  }
  if (error instanceof Error) {
    const m = error.message?.trim() || "";
    if (
      m &&
      !/non-2xx status code/i.test(m) &&
      !/Edge Function returned/i.test(m) &&
      !/FunctionsHttpError/i.test(m)
    ) {
      return m;
    }
  }
  return "Une erreur est survenue. Réessaie plus tard.";
}

export function sanitizeAssistantReply(text: string): string {
  return text
    .replace(/\s*DOCS:\s*[0-9a-f-]{36}\s*/gi, "")
    .replace(/\n-{3,}\s*$/g, "")
    .replace(/^\s*-{3,}\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
