import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { fileName, extractedText } = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const prompt = `
    Tu es une IA experte en documents administratifs français.

    Voici le nom du fichier :
    "${fileName}"

    Voici le texte du document :
    "${extractedText || "Aucun texte fourni"}"

    Classe ce document dans UNE seule catégorie parmi :

    - travail
    - facture
    - banque
    - administratif
    - assurance
    - impots
    - contrat
    - autres

    Règles :
    - Bulletin de salaire = travail  
    - Certificat de travail = travail  
    - Solde de tout compte = travail  
    - Reçu employeur = travail  
    - Paie, salaire, employeur = travail  
    - PDF contenant “net à payer”, “Siret” + “salaire” = travail  

    Réponds uniquement par la catégorie, sans phrase.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    let category =
      completion.choices[0].message?.content
        ?.trim()
        ?.toLowerCase() || "autres";

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

    if (!allowed.includes(category)) {
      category = "autres";
    }

    return NextResponse.json({ category });

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur IA classification" },
      { status: 500 }
    );
  }
}
