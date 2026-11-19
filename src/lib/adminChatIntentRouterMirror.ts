/** Catégories d’intention pour l’assistant Plaidoc (orchestration V3). */

export type AssistantIntent =
  | "paipers_knowledge"
  | "administrative_knowledge"
  | "user_document_search"
  | "document_analysis"
  | "email_search"
  | "global_search"
  | "document_generation"
  | "action_request"
  | "clarification_needed"
  | "unknown_fallback";

/** @deprecated Alias historiques (réponses JSON legacy). */
export type AssistantIntentLegacy =
  | "paipers_feature_help"
  | "general_admin_help"
  | "document_lookup"
  | "unknown_or_chat";

export function intentToLegacy(intent: AssistantIntent): AssistantIntentLegacy {
  switch (intent) {
    case "paipers_knowledge":
      return "paipers_feature_help";
    case "administrative_knowledge":
      return "general_admin_help";
    case "user_document_search":
    case "document_analysis":
    case "email_search":
    case "global_search":
      return "document_lookup";
    case "action_request":
    case "document_generation":
      return "paipers_feature_help";
    default:
      return "unknown_or_chat";
  }
}

function normalize(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function normalizedForAdminIntent(message: string): string {
  return normalize(message)
    .replace(/[''`´]/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ADMIN_GENERAL_NORMALIZED_RE =
  /\b(contravention|amende|stationnement|fourriere|pv|permis|points|impots?|imposition|fiscal|fiscaux|dgfip|tva|taxe|cotisation|urssaf|securite sociale|retraite|caf|cpam|mutuelle|sinistre|degats?|bail|etat des lieux|caution|colocation|prefecture|mairie|sous prefecture|carte grise|changement d adresse|demenagement|declaration|declarer|revenus|avis d imposition|avis de situation|dossier locatif|louer|location|loyer|garant|garantie|visale|justificatif|assurance habitation|assurance|remboursement|contestation|contester|recours gracieux|amiable|titre de sejour|carte identite|cni|passeport|acte de naissance|certificat|hypotheque|notaire|succession|donation|pacs|mariage|divorce|heritage|impayes?|paiement|payer|prelevement|preleve|echeance|echeancier|reduction|exoneration|credit impot|frais|sasu|sarl|micro entreprise|auto entrepreneur)\b/i;

const SEARCH_VERB_RE =
  /\b(retrouve|retrouver|montre|montrer|affiche|afficher|ouvre|ouvrir|trouve|trouver|cherche|chercher|recherche|rechercher|sors|sortir|donne|donner|recupere|recuperer|voir|localise|où est|ou est|où sont|ou sont|liste mes|liste des)\b/i;

const ANALYSIS_VERB_RE = /\b(analyse|analyser|resume|resumer|explique|expliquer|synthese)\b/i;

const EMAIL_NOUN_RE = /\b(mail|mails|email|emails|courriel|gmail|outlook|boite mail|messagerie)\b/i;

const GLOBAL_TOPIC_RE =
  /\b(abonnement|abonnements|assurance|contrat de travail|dossier administratif)\b/i;

export function matchesGeneralAdminIntent(message: string): boolean {
  const n = normalizedForAdminIntent(message);
  if (n.length < 3) return false;
  return ADMIN_GENERAL_NORMALIZED_RE.test(n);
}

export function detectDocumentCreationIntent(message: string): boolean {
  const m = message.trim();
  if (m.length < 10) return false;
  if (detectDocumentSearchIntent(m)) return false;
  const q = normalize(m);
  const createVerb = /\b(faire|rediger|creer|generer|ecrire|produire|preparer|composer)\b/.test(q);
  const docKind = /\b(lettre|courrier|contrat|devis)\b/.test(q);
  if (createVerb && docKind) return true;
  if (/\b(nouvelle|nouveau)\b/.test(q) && docKind) return true;
  if (/\blettre\s+de\s+motivation\b/.test(q)) {
    if (/\b(mon|ma|mes)\s+(lettre|pdf|document|courrier)\b/.test(q)) return false;
    if (/\b(trouve|cherche|recherche|ouvre|montre|affiche|recupere|existant|retrouve)\b/.test(q)) return false;
    if (createVerb || /\b(pour|candidat|poste|emploi|travail|stage|entreprise)\b/.test(q)) return true;
    if (/\b(je\s+veux|j\s*aimerais|j\s*aimerai|besoin\s+d)\b/.test(q)) return true;
  }
  return false;
}

export function detectDocumentSearchIntent(message: string): boolean {
  const m = message.trim();
  if (m.length < 3) return false;
  if (
    /\b(quel|quelle|quels|quelles)\s+(est|sont)\s+(mon|ma|mes)\b/i.test(m) &&
    /\b(bail|contrat|facture|assurance|courrier|document|pdf|rib|attestation|quittance|avis)\b/i.test(m)
  ) {
    return true;
  }
  return (
    SEARCH_VERB_RE.test(m) ||
    /^(je cherche|je veux|j'aimerais|j aimerais|tu peux|peux-tu|peux tu|montre-moi|montre moi|sors-moi|sors moi)/i.test(
      m
    )
  );
}

function hasConcreteDocumentTarget(message: string): boolean {
  return /\b(mon|ma|mes|ton|ta|tes|sa|ses|une facture|un contrat|un document|le document|les documents|mon pdf|l'avis|mon rib|ce pdf|ce document|mon bail|ma facture|mon assurance)\b/i.test(
    message
  );
}

function isPaipersHowTo(message: string): boolean {
  return /\b(comment|pourquoi|a quoi sert|qu est ce que|explique|fonctionne)\b/i.test(message);
}

/** Mots qui désignent l'appli elle-même (jamais une démarche administrative). */
const APP_SCREEN_NOUN_RE =
  /\b(pass\w* en (pro|perso|personnel)|(mode|version|compte|espace|cote|partie) (pro|perso|personnel|professionnel)|(pass\w*|all\w*|reven\w*|retourn\w*|bascul\w*|activ\w*) (en |sur |dans |a |au |le |la |l )*(mon |ma |le |la )?(pro|perso|personnel|professionnel)|supprim\w* mon compte|deconnect\w*|(fais|faire|creer|cree) (une facture|un devis)|espace pro|espace perso|espace personnel|passer en pro|passer en perso|passer en personnel|changer d espace|mon budget|tresorerie|mes abonnements|favoris?|corbeille|bouton|ecran|onglet|appli|application|mascotte|bulle|parametres?|mode sombre|sous categorie|categories?|collaborateurs?|deconnecter|deconnexion|supprimer mon compte|mes signatures|ma signature|fusionner|fusion|scanner|importer|mes rappels|rappel a archi|ce qu archi|kbis|produits et services|mon entreprise|mon offre|nouveau devis|nouvelle facture|creer un devis|creer une facture|faire un devis|faire une facture|un avoir|relancer)\b/;

/** Tournures « comment faire » au sens large. */
const APP_HOWTO_RE =
  /\b(comment|je veux|je voudrais|j aimerais|ou est|ou sont|ou se trouve|ou trouver|c est ou|je n arrive pas|j arrive pas|je ne trouve pas|je trouve pas|est ce que je peux|est ce qu on peut|on peut|je peux|possible de|a quoi sert|ca sert a quoi|explique)\b/;

export function isAppHowToQuestion(message: string): boolean {
  const n = normalizedForAdminIntent(message);
  if (!APP_HOWTO_RE.test(n)) return false;
  if (APP_SCREEN_NOUN_RE.test(n)) return true;
  // « signature », « rappel » : l'appli, sauf si la phrase parle d'une démarche (« signature électronique pour les impôts »).
  return /\b(signatures?|rappels?)\b/.test(n) && !matchesGeneralAdminIntent(message);
}

function mentionsPaipersProduct(message: string): boolean {
  const n = normalizedForAdminIntent(message);
  return /\b(paipers|plaidoc|gmail|outlook|scanner|scan|importer|import|synchronis|profil|mails?|connecter|lier)\b/.test(n);
}

function isActionImperative(message: string): boolean {
  const n = normalizedForAdminIntent(message);
  if (/^(connecte|connecter|lie|lier|synchronise|synchroniser|scanne|scanner|importe|importer|resilie|resilier|envoie|envoyer)\b/.test(n)) {
    return true;
  }
  return /\b(envoie|envoyer|resilie|resilier|genere|generer|prepare|preparer)\b/.test(n) && !isPaipersHowTo(message);
}

const CLIENT_INTENT_MAP: Record<string, AssistantIntent> = {
  document_search: "user_document_search",
  document_analysis: "document_analysis",
  document_generation: "document_generation",
  admin_action: "administrative_knowledge",
  email_search: "email_search",
  global_search: "global_search",
  paipers_knowledge: "paipers_knowledge",
  action_request: "action_request",
  clarification_needed: "clarification_needed",
  unknown: "unknown_fallback",
};

/** Priorité : analyse → recherche email → recherche doc → globale → admin → génération → Plaidoc → actions. */
export function classifyAssistantIntent(message: string, clientIntent?: string): AssistantIntent {
  // 13/10 (Archi vivant) : « paipers_knowledge » / « unknown » envoyés par l'app ne priment plus —
  // sinon « comment vas-tu ? » ou « SAS vs SASU » tombaient dans l'aide de l'app (« Je ne peux pas répondre »).
  if (
    clientIntent &&
    CLIENT_INTENT_MAP[clientIntent] &&
    clientIntent !== "paipers_knowledge" &&
    clientIntent !== "unknown"
  ) {
    return CLIENT_INTENT_MAP[clientIntent];
  }

  const t = message.trim();
  if (t.length === 0) return "unknown_fallback";

  const docSearch = detectDocumentSearchIntent(t);
  const hasConcrete = hasConcreteDocumentTarget(t);
  const isComment = /\bcomment\b/i.test(t);
  const hasAnalysis = ANALYSIS_VERB_RE.test(t);
  const hasEmail = EMAIL_NOUN_RE.test(normalizedForAdminIntent(t));

  // 21/10 : « je ne trouve pas le bouton… », « où est la corbeille ? » → mode d'emploi, pas une recherche de document.
  if (!hasConcrete && isAppHowToQuestion(t)) {
    return "paipers_knowledge";
  }

  if (hasAnalysis && (hasConcrete || docSearch)) {
    return "document_analysis";
  }

  if (docSearch && hasEmail) {
    return "email_search";
  }

  if (docSearch && (hasConcrete || !isComment)) {
    if (GLOBAL_TOPIC_RE.test(normalizedForAdminIntent(t))) return "global_search";
    return "user_document_search";
  }

  if (detectDocumentCreationIntent(t)) {
    return "document_generation";
  }

  if (
    t.length <= 28 &&
    /^(bonjour|salut|coucou|hello|hi|hey|merci|merci beaucoup|ok|okay|d'accord|dacord|super|génial|genial)\W*$/i.test(
      t
    )
  ) {
    return "unknown_fallback";
  }

  if (/^(aide|help|je suis perdu|je ne sais pas quoi faire)\W*$/i.test(t)) {
    return "unknown_fallback";
  }

  // 13/10 : le seul mot « Plaidoc » ne suffit plus (« une entreprise comme Plaidoc, que me conseilles-tu ? »).
  const paipersProductHow =
    (isComment || isPaipersHowTo(t)) &&
    mentionsPaipersProduct(t) &&
    !docSearch;

  if (paipersProductHow) {
    return "paipers_knowledge";
  }

  const paipersHow =
    (isComment || /\b(où|ou)\b/i.test(t)) &&
    /\b(dossier|documents?|pdf|scanner|importer|fusionner|ranger|classer|deplacer|déplacer|renommer|imprimer|partager|envoyer|mail|email|ordre|gliss|appuy|sous-dossier|sans dossier|timeline|agenda|echeance|échéance|generer|générer|remplir|signer|assistant|onglet|accueil|gmail|outlook|mails?|profil|connecter|lier|paipers|plaidoc|abonnement)\b/i.test(
      t
    );

  if (paipersHow && !docSearch) {
    return "paipers_knowledge";
  }

  // 21/10 : « je n'arrive pas à… », « c'est où… », « passer en Pro »… → mode d'emploi de l'appli.
  if (!docSearch && isAppHowToQuestion(t)) {
    return "paipers_knowledge";
  }

  // 31/10 : le nouveau nom « Plaidoc » est reconnu (l'ancien « Paipers » aussi).
  if (/\b(paipers|plaidoc)\b/i.test(t) && isPaipersHowTo(t) && !docSearch) {
    return "paipers_knowledge";
  }

  const genericHowFindDoc =
    isComment &&
    /\b(retrouver|chercher|trouver)\b/i.test(t) &&
    /\b(un|une|le|les|des|document|pdf|fichier)\b/i.test(t) &&
    !hasConcrete;

  if (genericHowFindDoc) {
    return "paipers_knowledge";
  }

  if (isActionImperative(t) && !isComment) {
    return "action_request";
  }

  if (matchesGeneralAdminIntent(t) && !docSearch && !hasConcrete) {
    return "administrative_knowledge";
  }

  if (docSearch) {
    return "user_document_search";
  }

  if (t.length < 40 && !/\?/.test(t) && !matchesGeneralAdminIntent(t)) {
    return "unknown_fallback";
  }

  if (matchesGeneralAdminIntent(t)) {
    return "administrative_knowledge";
  }

  return "unknown_fallback";
}
