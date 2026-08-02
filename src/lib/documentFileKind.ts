/**
 * Réf. : paipers-mobile/src/lib/documentFileKind.ts
 */

export type DocumentFileKind =
  | "pdf"
  | "image"
  | "word"
  | "excel"
  | "powerpoint"
  | "text"
  | "other";

function extensionOf(pathOrName?: string | null): string {
  if (!pathOrName) return "";
  const clean = pathOrName.split("?")[0].split("#")[0];
  const dot = clean.lastIndexOf(".");
  if (dot < 0) return "";
  return clean.slice(dot + 1).toLowerCase();
}

export function classifyDocumentFileKind(
  mimeType?: string | null,
  pathHint?: string | null,
): DocumentFileKind {
  const mime = (mimeType ?? "").toLowerCase();

  if (mime.startsWith("image/")) return "image";
  if (mime === "application/pdf") return "pdf";
  if (mime.includes("wordprocessing") || mime === "application/msword") return "word";
  if (mime.includes("spreadsheet") || mime === "application/vnd.ms-excel") return "excel";
  if (mime.includes("presentation") || mime === "application/vnd.ms-powerpoint") {
    return "powerpoint";
  }
  if (mime.startsWith("text/")) return "text";

  const ext = extensionOf(pathHint);
  switch (ext) {
    case "pdf":
      return "pdf";
    case "png":
    case "jpg":
    case "jpeg":
    case "gif":
    case "webp":
    case "heic":
    case "heif":
    case "bmp":
    case "tiff":
      return "image";
    case "doc":
    case "docx":
    case "odt":
      return "word";
    case "xls":
    case "xlsx":
    case "csv":
    case "ods":
      return "excel";
    case "ppt":
    case "pptx":
    case "odp":
      return "powerpoint";
    case "txt":
    case "rtf":
    case "md":
      return "text";
    default:
      return mime === "" && ext === "" ? "pdf" : "other";
  }
}
