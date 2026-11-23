/**
 * Rédaction d'un document (secours de la page /generer/rediger-document quand la fonction Supabase échoue).
 * SEC-A2 (E13, 23/11/2026) : session obligatoire (401), entrées bornées avant tout appel OpenAI (413),
 * 503 si la clé est absente, erreurs internes jamais renvoyées. Réponse inchangée : { text }.
 * Voir src/lib/server/aiRoutesLockdown.verify.ts.
 */
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { requireWebUser } from "@/lib/server/requireWebUser";

const GENERATE_TYPE_MAX = 200;
const GENERATE_DETAILS_MAX = 8000;
/** Corps brut maximal (les deux champs + JSON) : refus avant analyse. */
const GENERATE_BODY_MAX = 20000;

export async function POST(req: Request) {
  const auth = await requireWebUser(req);
  if ("response" in auth) return auth.response;

  try {
    const raw = await req.text();
    if (raw.length > GENERATE_BODY_MAX) {
      return NextResponse.json({ error: "Demande trop longue." }, { status: 413 });
    }

    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    const { type, details } = (body ?? {}) as { type?: unknown; details?: unknown };

    if (typeof type !== "string" || typeof details !== "string" || !type.trim() || !details.trim()) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }
    if (type.length > GENERATE_TYPE_MAX || details.length > GENERATE_DETAILS_MAX) {
      return NextResponse.json({ error: "Demande trop longue." }, { status: 413 });
    }

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Génération indisponible : clé OpenAI non configurée sur le serveur web.",
        },
        { status: 503 },
      );
    }

    const client = new OpenAI({ apiKey });

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

  } catch {
    // Jamais de message interne (OpenAI, réseau, clé) dans la réponse.
    return NextResponse.json({ error: "Erreur IA" }, { status: 500 });
  }
}
