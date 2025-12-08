import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { fileName, extractedText } = await req.json();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const prompt = `
      Tu dois générer un titre clair, professionnel et court
      pour un document administratif français.

      Nom du fichier :
      "${fileName}"

      Texte extrait :
      "${extractedText || "Aucun texte"}"

      Si c'est un bulletin de salaire :
      → Format recommandé :
      "Bulletin de salaire – Mois Année – Nom Prénom"

      Réponds uniquement par le titre, sans extension.
    `;

    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const title = result.choices[0].message?.content?.trim() || fileName;
    return NextResponse.json({ title });

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}
