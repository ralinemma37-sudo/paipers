/**
 * Classification OpenAI — catégories alignées documentCategories / mobile.
 */

import OpenAI from "openai";

/** Slugs canoniques stockés dans documents.category */
export const CLASSIFY_CATEGORIES = [
  "travail",
  "factures",
  "banque",
  "assurances",
  "impots",
  "contrats",
  "logement",
  "sante",
  "identite",
  "entreprise",
  "abonnements",
  "vehicule",
  "autres",
] as const;

export type ClassifyCategory = (typeof CLASSIFY_CATEGORIES)[number];

export type ClassifyResult = {
  category: ClassifyCategory;
  title: string;
};

function normalizeCategory(raw: string): ClassifyCategory {
  const c = raw.toLowerCase().trim();
  const map: Record<string, ClassifyCategory> = {
    travail: "travail",
    facture: "factures",
    factures: "factures",
    banque: "banque",
    assurance: "assurances",
    assurances: "assurances",
    impots: "impots",
    impôts: "impots",
    contrat: "contrats",
    contrats: "contrats",
    logement: "logement",
    sante: "sante",
    santé: "sante",
    identite: "identite",
    identité: "identite",
    administratif: "identite",
    entreprise: "entreprise",
    abonnement: "abonnements",
    abonnements: "abonnements",
    vehicule: "vehicule",
    véhicule: "vehicule",
    autres: "autres",
    other: "autres",
  };
  return map[c] || (CLASSIFY_CATEGORIES.includes(c as ClassifyCategory) ? (c as ClassifyCategory) : "autres");
}

export async function classifyDocumentWithOpenAI(params: {
  fileName: string;
  extractedText: string;
}): Promise<ClassifyResult> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("openai_not_configured");
  }

  const client = new OpenAI({ apiKey });

  const prompt = `
Tu es une IA experte en documents administratifs français.

Nom du fichier :
"${params.fileName}"

Texte du document (peut être vide) :
"${params.extractedText || "Aucun texte fourni"}"

Ta mission :
1) Choisir UNE catégorie parmi exactement :
${CLASSIFY_CATEGORIES.join(", ")}

Guide :
- fiche de paie / certificat de travail / solde de tout compte → travail
- facture / devis / quittance → factures
- relevé bancaire / IBAN / RIB → banque
- assurance / mutuelle / sinistre → assurances
- avis d'imposition / impôts / taxe foncière → impots
- contrat de travail / bail / CGV → contrats
- bail / loyer / APL (si logement) → logement
- ameli / ordonnance / mutuelle santé → sante
- carte d'identité / passeport / acte d'état civil → identite
- SIRET / Kbis / URSSAF entreprise → entreprise
- abonnement Netflix / forfait mobile / récurrent → abonnements
- carte grise / permis / contrôle technique → vehicule
- sinon → autres

2) Proposer un titre COURT et clair (max 80 caractères), ex :
- "Fiche de paie – 11/2025"
- "Facture – EDF – 10/2025"
- "Avis d’imposition – 2024"

Réponds uniquement en JSON strict :
{"category":"...","title":"..."}
`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const raw = completion.choices[0].message?.content?.trim() || "{}";
  let parsed: { category?: string; title?: string } = {};
  try {
    parsed = JSON.parse(raw) as { category?: string; title?: string };
  } catch {
    parsed = {};
  }

  let category = normalizeCategory(parsed.category || "autres");
  let title = (parsed.title || "").toString().trim();

  if (!title || title.length < 3) {
    title = (params.fileName || "Document").replace(/\.[a-z0-9]+$/i, "");
  }
  if (title.length > 80) title = title.slice(0, 80);

  return { category, title };
}
