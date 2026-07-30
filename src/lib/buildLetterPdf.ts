/**
 * PDF lettre — extrait de l’ancien src/app/generer/page.tsx (jsPDF).
 */

import jsPDF from "jspdf";

export function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replaceAll("’", "")
    .replaceAll("'", "")
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9\-]/g, "");
}

export function buildLetterPdfBytes(title: string, content: string): Uint8Array {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const marginLeft = 18;
  const marginTop = 18;
  const maxWidth = 210 - marginLeft * 2;

  doc.setFont("times", "normal");
  doc.setFontSize(12);
  doc.text(title, marginLeft, marginTop);
  const lines = doc.splitTextToSize(content, maxWidth);
  doc.text(lines, marginLeft, marginTop + 10);

  const arrayBuffer = doc.output("arraybuffer");
  return new Uint8Array(arrayBuffer);
}
