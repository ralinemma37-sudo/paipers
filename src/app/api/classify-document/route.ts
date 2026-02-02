import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { fileName, extractedText } = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // ✅ On demande un JSON strict: { category, title }
    const prompt = `
Tu es une IA experte en documents administratifs français.

Nom du fichier :
"${fileName}"

Texte du document (peut être vide) :
"${extractedText || "Aucun texte fourni"}"

Ta mission :
1) Choisir UNE catégorie parmi :
- travail
- facture
- banque
- administratif
- assurance
- impots
- contrat
- autres

2) Proposer un titre COURT et clair (max 80 caractères), ex :
- "Fiche de paie – 11/2025"
- "Facture – EDF – 10/2025"
- "Contrat de location"
- "Avis d’imposition – 2024"

Règles importantes :
- Bulletin de salaire / fiche de paie / salaire / net à payer => travail
- Certificat de travail => travail
- Solde de tout compte => travail
- Reçu employeur => travail
- "net à payer" + "siret" + "salaire" => travail

Réponds uniquement en JSON strict :
{"category":"...", "title":"..."}
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      // ✅ force un JSON parsable
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const raw = completion.choices[0].message?.content?.trim() || "{}";

    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    let category = (parsed.category || "autres").toString().trim().toLowerCase();
    let title = (parsed.title || "").toString().trim();

    const allowed = [
      "travail",
      "facture",
      "banque",
      "administratif",
      "assurance",
      "impots",
      "contrat",
      "autres",
    ];

    if (!allowed.includes(category)) category = "autres";

    // fallback titre si vide
    if (!title || title.length < 3) {
      title = (fileName || "Document").replace(/\.[a-z0-9]+$/i, "");
    }

    if (title.length > 80) title = title.slice(0, 80);

    return NextResponse.json({ category, title });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur IA classification" },
      { status: 500 }
    );
  }
}
