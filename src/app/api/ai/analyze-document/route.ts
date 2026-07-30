import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

/**
 * Client OpenAI créé à la requête (pas au chargement du module) pour que
 * `next build` réussisse sans OPENAI_API_KEY en environnement CI.
 * Comportement IA inchangé lorsque la clé est présente.
 */
function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function POST(req: NextRequest) {
  try {
    const openai = getOpenAIClient();
    if (!openai) {
      return NextResponse.json(
        {
          error: "openai_not_configured",
          userMessage:
            "Analyse document indisponible : la clé OpenAI n’est pas configurée sur le serveur.",
        },
        { status: 503 },
      );
    }

    const { filename, storage_path } = await req.json();

    if (!filename || !storage_path) {
      return NextResponse.json(
        { error: "Missing filename or storage_path" },
        { status: 400 },
      );
    }

    const { data: fileData, error } = await supabase.storage
      .from("documents")
      .download(storage_path);

    if (error || !fileData) {
      console.error("SUPABASE DOWNLOAD ERROR:", error);
      return NextResponse.json({ error: "File download failed" }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const base64PDF = buffer.toString("base64");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert administratif. Analyse un document PDF donné en base64. " +
            "Retourne STRICTEMENT un JSON avec: title, file_type, category, extracted_text, metadata.",
        },
        {
          role: "user",
          content:
            "Voici un document PDF encodé en base64. Analyse-le et répond STRICTEMENT en JSON.\n\n" +
            base64PDF,
        },
      ],
      temperature: 0,
    });

    let raw = completion.choices[0].message.content?.trim() || "{}";
    raw = raw.replace(/```json/g, "").replace(/```/g, "");

    let json;
    try {
      json = JSON.parse(raw);
    } catch {
      json = {
        title: filename,
        file_type: "unknown",
        category: "other",
        extracted_text: raw,
        metadata: {},
      };
    }

    return NextResponse.json(json);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "AI error";
    console.error("AI ERROR:", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
