import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

type WebhookPayload = {
  type: "INSERT" | "UPDATE" | "DELETE";
  table: string;
  schema: string;
  record: any;
  old_record: any;
};

// --- Petite extraction texte (MVP) ---
// - TXT: ok
// - PDF: on essaie d’extraire un peu (si c’est un PDF texte)
// - Image: on ne fait rien (OCR plus tard)
async function extractTextIfPossible(mime: string, filename: string, ab: ArrayBuffer) {
  const m = (mime || "").toLowerCase();
  const f = (filename || "").toLowerCase();

  if (m.startsWith("text/") || f.endsWith(".txt")) {
    return Buffer.from(ab).toString("utf-8").slice(0, 12000);
  }

  if (m.includes("pdf") || f.endsWith(".pdf")) {
    try {
      // pdfjs-dist côté Node (tu l’as déjà installé)
      const pdfjsLib: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(Buffer.from(ab)) });
      const pdf = await loadingTask.promise;

      const maxPages = Math.min(pdf.numPages, 2); // MVP: 1-2 pages suffisent souvent
      let out: string[] = [];

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = (content.items || [])
          .map((it: any) => (typeof it.str === "string" ? it.str : ""))
          .filter(Boolean);
        out.push(strings.join(" "));
      }

      return out.join("\n").slice(0, 12000);
    } catch {
      return ""; // PDF scanné => pas de texte (OCR plus tard)
    }
  }

  return "";
}

export async function POST(req: Request) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const APP_URL = process.env.APP_URL!; // ex: https://paipers.vercel.app

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !APP_URL) {
      return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
    }

    const payload = (await req.json()) as WebhookPayload;

    if (payload.type === "DELETE") return NextResponse.json({ ok: true });

    const docId = payload.record?.id;
    if (!docId) return NextResponse.json({ error: "No doc id" }, { status: 400 });

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // 1) Récupérer le document
    const { data: doc, error: docErr } = await supabase
      .from("documents")
      .select("id, user_id, title, category, file_path, mime_type, original_filename, is_ready")
      .eq("id", docId)
      .single();

    if (docErr || !doc) return NextResponse.json({ error: "Doc not found" }, { status: 404 });

    // 2) Condition: prêt + fichier
    if (!doc.is_ready || !doc.file_path) return NextResponse.json({ ok: true, skipped: "not_ready" });

    // (optionnel) anti-boucle simple: si déjà bien rempli, on skip
    // tu peux enlever si tu veux renommer à chaque fois
    if ((doc.title || "").includes("–") && doc.category && doc.category !== "autres") {
      // garde-fou minimal
      // return NextResponse.json({ ok: true, skipped: "already_named" });
    }

    // 3) Télécharger le fichier depuis Storage
    const { data: file, error: dlErr } = await supabase.storage.from("documents").download(doc.file_path);
    if (dlErr || !file) return NextResponse.json({ error: "Download failed" }, { status: 500 });

    const ab = await file.arrayBuffer();

    // 4) Extraire un peu de texte si possible
    const extractedText = await extractTextIfPossible(doc.mime_type || "", doc.original_filename || "", ab);

    // 5) Appeler TON endpoint IA existant (classify-document)
    const classifyRes = await fetch(`${APP_URL}/api/classify-document`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName: doc.original_filename || doc.title || "document",
        extractedText,
      }),
    });

    if (!classifyRes.ok) {
      const t = await classifyRes.text();
      return NextResponse.json({ error: "Classify failed", details: t }, { status: 500 });
    }

    const { category, title } = await classifyRes.json();

    // 6) Mettre à jour le doc dans Supabase
    const { error: upErr } = await supabase
      .from("documents")
      .update({
        title,
        category,
      })
      .eq("id", doc.id);

    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

    return NextResponse.json({ ok: true, id: doc.id, title, category });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
