import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { filename, storage_path } = await req.json();

    if (!filename || !storage_path) {
      return NextResponse.json(
        { error: "Missing filename or storage_path" },
        { status: 400 }
      );
    }

    // 1. Télécharger le PDF depuis Supabase
    const { data: fileData, error } = await supabase.storage
      .from("documents")
      .download(storage_path);

    if (error || !fileData) {
      console.error("SUPABASE DOWNLOAD ERROR:", error);
      return NextResponse.json({ error: "File download failed" }, { status: 500 });
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const base64PDF = buffer.toString("base64");

    // 2. Appel OpenAI EN BASE64 (100% compatible SDK)
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert administratif. Analyse un document PDF donné en base64. " +
            "Retourne STRICTEMENT un JSON avec: title, file_type, category, extracted_text, metadata."
        },
        {
          role: "user",
          content:
            "Voici un document PDF encodé en base64. Analyse-le et répond STRICTEMENT en JSON.\n\n" +
            base64PDF
        }
      ],
      temperature: 0,
    });

    let raw = completion.choices[0].message.content?.trim() || "{}";

    // 3. Nettoyage du JSON (GPT ajoute parfois des ```json)
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
        metadata: {}
      };
    }

    return NextResponse.json(json);
  } catch (e: any) {
    console.error("AI ERROR:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

