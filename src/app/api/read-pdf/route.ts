import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return NextResponse.json(
        { error: "Missing fileUrl" },
        { status: 400 }
      );
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    const prompt = `
      Voici un document PDF.
      Extrais tout le texte utile de façon brute, sans résumé.
    `;

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt } as any,
            {
              type: "input_resource",
              resource: { file_url: fileUrl },
            } as any,
          ],
        },
      ],
    });

    const extracted =
      (completion.choices?.[0]?.message?.content?.[0] as any)?.text || "";

    return NextResponse.json({ extractedText: extracted });

  } catch (e: any) {
    console.error("❌ OCR ERROR", e);
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}
