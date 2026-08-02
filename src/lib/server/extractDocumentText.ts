/**
 * Extraction texte légère (TXT + PDF texte) — réf. process-new-document.
 */

export async function extractTextIfPossible(
  mime: string,
  filename: string,
  ab: ArrayBuffer,
): Promise<string> {
  const m = (mime || "").toLowerCase();
  const f = (filename || "").toLowerCase();

  if (m.startsWith("text/") || f.endsWith(".txt")) {
    return Buffer.from(ab).toString("utf-8").slice(0, 12000);
  }

  if (m.includes("pdf") || f.endsWith(".pdf")) {
    try {
      const pdfjsLib = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as {
        getDocument: (opts: { data: Uint8Array }) => { promise: Promise<{
          numPages: number;
          getPage: (n: number) => Promise<{
            getTextContent: () => Promise<{ items: Array<{ str?: string }> }>;
          }>;
        }> };
      };
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(Buffer.from(ab)) });
      const pdf = await loadingTask.promise;
      const maxPages = Math.min(pdf.numPages, 3);
      const out: string[] = [];

      for (let i = 1; i <= maxPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = (content.items || [])
          .map((it) => (typeof it.str === "string" ? it.str : ""))
          .filter(Boolean);
        out.push(strings.join(" "));
      }

      return out.join("\n").slice(0, 12000);
    } catch {
      return "";
    }
  }

  return "";
}
