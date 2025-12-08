import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { type, details } = await req.json();

    if (!type || !details) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const prompt = `
Tu es une IA qui rédige des documents administratifs français très professionnels.

Type de document demandé : ${type}
Contexte fourni par l'utilisateur : ${details}

Rédige le document COMPLET, structuré, poli, prêt à être imprimé.
Ne fais aucun meta-commentaire.
    `;

    const result = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tu es un expert en rédaction administrative française." },
        { role: "user", content: prompt }
      ],
    });

    const text = result.choices[0].message?.content || "";

    return NextResponse.json({ text });

  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Erreur IA" },
      { status: 500 }
    );
  }
}
