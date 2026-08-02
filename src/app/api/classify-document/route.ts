import { NextResponse } from "next/server";
import { classifyDocumentWithOpenAI } from "@/lib/server/classifyWithOpenAI";

export async function POST(req: Request) {
  try {
    const { fileName, extractedText } = await req.json();
    const result = await classifyDocumentWithOpenAI({
      fileName: fileName || "document",
      extractedText: extractedText || "",
    });
    return NextResponse.json(result);
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Erreur IA classification";
    const status = message === "openai_not_configured" ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
