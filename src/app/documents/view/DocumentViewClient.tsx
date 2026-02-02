"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  ChevronLeft,
  FileText,
  Calendar,
  Folder,
  Mail,
  ExternalLink,
  Download,
  Trash2,
  PenLine,
  Eraser,
  CheckCircle2,
  ChevronDown,
  Lock,
  Unlock,
} from "lucide-react";
import { PDFDocument } from "pdf-lib";

type DocRow = {
  id: string;
  title: string | null;
  user_id: string;
  file_path: string | null;
  is_ready: boolean | null;
  mime_type: string | null;
  category: string | null;
  created_at: string;
  source: string | null;
  original_filename: string | null;
};

function labelCat(cat: string | null) {
  const c = (cat || "autres").toLowerCase().trim();
  const map: Record<string, string> = {
    factures: "Factures",
    facture: "Factures",
    contrats: "Contrats",
    contrat: "Contrats",
    travail: "Travail",
    banque: "Banque",
    assurances: "Assurances",
    assurance: "Assurances",
    autres: "Autres",
    "non classé": "Autres",
    "non classe": "Autres",
  };
  return map[c] || c.charAt(0).toUpperCase() + c.slice(1);
}

function labelSource(source: string | null) {
  const s = (source || "").toLowerCase();
  if (s === "gmail") return "Gmail";
  if (s === "upload") return "Import";
  if (s === "ai") return "Généré (IA)";
  return source ? source : "—";
}

function isText(mime: string, path: string) {
  const m = (mime || "").toLowerCase();
  const p = (path || "").toLowerCase();
  return m.startsWith("text/") || p.endsWith(".txt");
}

function isPdf(mime: string, path: string) {
  const m = (mime || "").toLowerCase();
  const p = (path || "").toLowerCase();
  return m.includes("pdf") || p.endsWith(".pdf");
}

function slugify(s: string) {
  return (s || "")
    .toLowerCase()
    .trim()
    .replaceAll("’", "")
    .replaceAll("'", "")
    .replaceAll(" ", "-")
    .replace(/[^a-z0-9\-]/g, "");
}

export default function DocumentViewPage() {
  const sp = useSearchParams();
  const id = useMemo(() => sp.get("id"), [sp]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [doc, setDoc] = useState<DocRow | null>(null);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  // text preview
  const [textLoading, setTextLoading] = useState(false);
  const [textContent, setTextContent] = useState<string>("");

  // delete
  const [deleting, setDeleting] = useState(false);
  const [uiMsg, setUiMsg] = useState<string>("");

  // signature UX
  const [showSignature, setShowSignature] = useState(false);
  const [sigDataUrl, setSigDataUrl] = useState<string | null>(null);
  const [sigMsg, setSigMsg] = useState("");
  const [signing, setSigning] = useState(false);

  // ✅ selection + lock
  const [overlaySelected, setOverlaySelected] = useState(false);
  const [overlayLocked, setOverlayLocked] = useState(false);

  // draw signature
  const sigCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sigDrawingRef = useRef(false);
  const sigLastRef = useRef<{ x: number; y: number } | null>(null);

  // overlay on top of preview
  const previewWrapRef = useRef<HTMLDivElement | null>(null);

  // ✅ PDF render (only for signing mode)
  const pdfScrollRef = useRef<HTMLDivElement | null>(null);
  const pageWrapRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfDocPages, setPdfDocPages] = useState<
    { pageIndex: number; wPx: number; hPx: number }[]
  >([]);
  const [overlayPageIndex, setOverlayPageIndex] = useState<number>(0);

  // ✅ keep pdfjs instance cached
  const pdfInstanceRef = useRef<any>(null);
  const pdfTargetWRef = useRef<number>(0);

  // ✅ UX: make pages smaller (more “overview”)
  // 0.78 = ~78% of available width. You can tweak (0.7 smaller, 0.85 bigger)
  const PDF_WIDTH_RATIO = 0.78;
  // optional cap so it never becomes huge on tablet/desktop
  const PDF_MAX_WIDTH = 720;

  // overlay placement (pixels within page/wrap)
  const [overlay, setOverlay] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 16,
    y: 16,
    w: 200,
    h: 70,
  });

  const dragRef = useRef<
    | null
    | {
        mode: "move" | "nw" | "ne" | "sw" | "se";
        startX: number;
        startY: number;
        start: { x: number; y: number; w: number; h: number };
      }
  >(null);

  // ✅ robust loading: never stuck on "Chargement..."
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setErrorMsg("");
      setUiMsg("");
      setSigMsg("");
      setSignedUrl(null);
      setDoc(null);
      setTextContent("");
      setSigDataUrl(null);
      setOverlaySelected(false);
      setOverlayLocked(false);
      setPdfDocPages([]);
      setPdfError("");
      pdfInstanceRef.current = null;
      pdfTargetWRef.current = 0;
      dragRef.current = null;

      try {
        if (!id) {
          setErrorMsg("ID manquant");
          return;
        }

        const { data: auth, error: authErr } = await supabase.auth.getUser();
        if (authErr) {
          setErrorMsg(`Erreur auth : ${authErr.message}`);
          return;
        }

        const user = auth?.user;
        if (!user) {
          setErrorMsg("Non connecté");
          return;
        }

        const { data: row, error } = await supabase
          .from("documents")
          .select(
            "id,title,user_id,file_path,is_ready,mime_type,category,created_at,source,original_filename"
          )
          .eq("id", id)
          .single();

        if (error || !row) {
          setErrorMsg(`Document introuvable${error?.message ? ` : ${error.message}` : ""}`);
          return;
        }

        if (row.user_id !== user.id) {
          setErrorMsg("Accès refusé");
          return;
        }

        setDoc(row);

        if (!row.is_ready || !row.file_path) {
          setErrorMsg("Ce document n’est pas encore prêt.");
          return;
        }

        const { data: signed, error: signedErr } = await supabase.storage
          .from("documents")
          .createSignedUrl(row.file_path, 60 * 10);

        if (signedErr || !signed?.signedUrl) {
          setErrorMsg(
            `Impossible de générer le lien du fichier${signedErr?.message ? ` : ${signedErr.message}` : ""}.`
          );
          return;
        }

        setSignedUrl(signed.signedUrl);

        const mt = row.mime_type || "";
        const path = row.file_path || "";

        if (isText(mt, path)) {
          setTextLoading(true);
          try {
            const r = await fetch(signed.signedUrl);
            const t = await r.text();
            setTextContent(t);
          } catch {
            setTextContent("Impossible d’afficher le texte pour le moment.");
          } finally {
            setTextLoading(false);
          }
        }
      } catch (e: any) {
        console.error("Erreur DocumentViewPage:", e);
        setErrorMsg(`Erreur inattendue : ${e?.message ?? "inconnue"}`);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [id]);

  const mimeType = doc?.mime_type || "";
  const filePath = doc?.file_path || "";
  const isTxt = isText(mimeType, filePath);
  const isPDF = isPdf(mimeType, filePath);

  const title = doc?.title || "Document";
  const createdLabel = doc?.created_at ? new Date(doc.created_at).toLocaleDateString() : "—";

  // --- signature canvas init ---
  function initSigCanvas() {
    const c = sigCanvasRef.current;
    if (!c) return;

    const rect = c.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    c.width = Math.floor(rect.width * dpr);
    c.height = Math.floor(rect.height * dpr);

    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111";
  }

  useEffect(() => {
    if (!showSignature) return;
    const t = setTimeout(() => initSigCanvas(), 60);
    return () => clearTimeout(t);
  }, [showSignature]);

  function sigPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = sigCanvasRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function drawSegment(ctx: CanvasRenderingContext2D, a: any, b: any) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const step = 2.5;
    const steps = Math.max(1, Math.floor(dist / step));

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      ctx.lineTo(a.x + dx * t, a.y + dy * t);
    }
    ctx.stroke();
  }

  function onSigDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = sigCanvasRef.current;
    if (!c) return;
    c.setPointerCapture(e.pointerId);
    sigDrawingRef.current = true;
    sigLastRef.current = sigPos(e);
  }

  function onSigMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!sigDrawingRef.current) return;
    const c = sigCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const p = sigPos(e);
    const last = sigLastRef.current;
    if (!last) {
      sigLastRef.current = p;
      return;
    }
    drawSegment(ctx, last, p);
    sigLastRef.current = p;
  }

  function onSigUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const c = sigCanvasRef.current;
    if (!c) return;
    sigDrawingRef.current = false;
    sigLastRef.current = null;
    c.releasePointerCapture(e.pointerId);
  }

  function clearSignature() {
    setSigMsg("");
    setSigDataUrl(null);
    setOverlaySelected(false);
    setOverlayLocked(false);
    dragRef.current = null;

    const c = sigCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
  }

  function signatureIsEmpty() {
    const c = sigCanvasRef.current;
    if (!c) return true;
    const ctx = c.getContext("2d");
    if (!ctx) return true;
    const img = ctx.getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < img.length; i += 4) {
      if (img[i] !== 0) return false;
    }
    return true;
  }

  // ✅ IMPORTANT: crop signature to remove transparent margins
  function exportCroppedSignatureDataUrl(padding = 12) {
    const c = sigCanvasRef.current;
    if (!c) return null;
    const ctx = c.getContext("2d");
    if (!ctx) return null;

    const { width, height } = c;
    const img = ctx.getImageData(0, 0, width, height);
    const data = img.data;

    let minX = width,
      minY = height,
      maxX = -1,
      maxY = -1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const a = data[(y * width + x) * 4 + 3];
        if (a !== 0) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX === -1) return null;

    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width - 1, maxX + padding);
    maxY = Math.min(height - 1, maxY + padding);

    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    const out = document.createElement("canvas");
    out.width = cropW;
    out.height = cropH;

    const outCtx = out.getContext("2d");
    if (!outCtx) return null;

    outCtx.drawImage(c, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
    return out.toDataURL("image/png");
  }

  function validateSignature() {
    setSigMsg("");
    if (signatureIsEmpty()) {
      setSigMsg("Signez dans le cadre avant de valider.");
      return;
    }

    const url = exportCroppedSignatureDataUrl(14);
    if (!url) {
      setSigMsg("Impossible de valider la signature.");
      return;
    }

    setSigDataUrl(url);
    setOverlaySelected(true);
    setOverlayLocked(false);

    if (showSignature && isPDF && pdfDocPages.length > 0) {
      setOverlayPageIndex(Math.max(0, pdfDocPages.length - 1));
    }

    setTimeout(() => {
      const page =
        showSignature && isPDF && pdfDocPages.length > 0
          ? pdfDocPages[Math.max(0, overlayPageIndex)]
          : null;

      const wrap = previewWrapRef.current;
      const w = page?.wPx ?? wrap?.clientWidth ?? 0;
      const h = page?.hPx ?? wrap?.clientHeight ?? 0;
      if (!w || !h) return;

      const sigW = Math.min(320, Math.max(180, Math.floor(w * 0.45)));
      const sigH = Math.floor(sigW * 0.35);
      setOverlay({
        x: Math.max(12, w - sigW - 12),
        y: Math.max(12, h - sigH - 12),
        w: sigW,
        h: sigH,
      });
    }, 50);
  }

  function clampOverlay(next: { x: number; y: number; w: number; h: number }) {
    if (showSignature && isPDF && pdfDocPages.length > 0) {
      const page = pdfDocPages[overlayPageIndex];
      if (!page) return next;

      const maxW = page.wPx;
      const maxH = page.hPx;

      const minW = 80;
      const minH = 30;

      let w = Math.max(minW, next.w);
      let h = Math.max(minH, next.h);

      w = Math.min(w, maxW);
      h = Math.min(h, maxH);

      let x = Math.max(0, Math.min(next.x, maxW - w));
      let y = Math.max(0, Math.min(next.y, maxH - h));

      return { x, y, w, h };
    }

    const wrap = previewWrapRef.current;
    if (!wrap) return next;

    const maxW = wrap.clientWidth;
    const maxH = wrap.clientHeight;

    const minW = 80;
    const minH = 30;

    let w = Math.max(minW, next.w);
    let h = Math.max(minH, next.h);

    w = Math.min(w, maxW);
    h = Math.min(h, maxH);

    let x = Math.max(0, Math.min(next.x, maxW - w));
    let y = Math.max(0, Math.min(next.y, maxH - h));

    return { x, y, w, h };
  }

  function onOverlayPointerDown(
    e: React.PointerEvent<HTMLDivElement>,
    mode: "move" | "nw" | "ne" | "sw" | "se"
  ) {
    e.stopPropagation();

    if (!overlaySelected) setOverlaySelected(true);
    if (overlayLocked) return;

    (e.currentTarget as any).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      start: { ...overlay },
    };
  }

  function onOverlayPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    if (overlayLocked) return;

    const dxRaw = e.clientX - dragRef.current.startX;
    const dyRaw = e.clientY - dragRef.current.startY;

    const RESIZE_GAIN = 2.2;
    const dx = dragRef.current.mode === "move" ? dxRaw : dxRaw * RESIZE_GAIN;
    const dy = dragRef.current.mode === "move" ? dyRaw : dyRaw * RESIZE_GAIN;

    const s = dragRef.current.start;
    const mode = dragRef.current.mode;

    let next = { ...s };

    if (mode === "move") {
      next.x = s.x + dx;
      next.y = s.y + dy;
    } else if (mode === "se") {
      next.w = s.w + dx;
      next.h = s.h + dy;
    } else if (mode === "sw") {
      next.x = s.x + dx;
      next.w = s.w - dx;
      next.h = s.h + dy;
    } else if (mode === "ne") {
      next.y = s.y + dy;
      next.h = s.h - dy;
      next.w = s.w + dx;
    } else if (mode === "nw") {
      next.x = s.x + dx;
      next.y = s.y + dy;
      next.w = s.w - dx;
      next.h = s.h - dy;
    }

    setOverlay(clampOverlay(next));
  }

  function onOverlayPointerUp() {
    dragRef.current = null;
  }

  function toggleLock() {
    setOverlayLocked((v) => !v);
    setOverlaySelected(false);
    dragRef.current = null;
  }

  // ✅ Helper: render all pages
  async function renderAllPdfPages() {
    const pdf = pdfInstanceRef.current;
    const scroller = pdfScrollRef.current;
    if (!pdf || !scroller) return;

    // ✅ reduced width for better overview
    const availableW = Math.max(320, scroller.clientWidth - 24);
    const targetW = Math.min(PDF_MAX_WIDTH, Math.floor(availableW * PDF_WIDTH_RATIO));
    pdfTargetWRef.current = targetW;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const wrapEl = pageWrapRefs.current[i - 1];
      if (!wrapEl) continue;

      const canvas = wrapEl.querySelector("canvas") as HTMLCanvasElement | null;
      if (!canvas) continue;

      const viewport0 = page.getViewport({ scale: 1 });
      const scale = targetW / viewport0.width;
      const viewport = page.getViewport({ scale });

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = `${Math.floor(viewport.width)}px`;
      canvas.style.height = `${Math.floor(viewport.height)}px`;

      const ctx = canvas.getContext("2d");
      if (!ctx) continue;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      await page.render({
        canvasContext: ctx,
        viewport,
      }).promise;
    }
  }

  // ✅ Load PDF once when entering signing mode
  useEffect(() => {
  if (!showSignature || !isPDF || !signedUrl) return;

  const scroller = pdfScrollRef.current;
  if (!scroller) return;

  let cancelled = false;
  setPdfLoading(true);

  const run = async () => {
    try {
      const pdfjsLib: any = await import("pdfjs-dist/legacy/build/pdf.mjs");

      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

      const ab = await fetch(signedUrl).then((r) => r.arrayBuffer());
      const loadingTask = pdfjsLib.getDocument({ data: ab });
      const pdf = await loadingTask.promise;

      if (cancelled) return;

      pdfInstanceRef.current = pdf;

      // ✅ reduced width for better overview
      const availableW = Math.max(320, scroller.clientWidth - 24);
      const targetW = Math.min(PDF_MAX_WIDTH, Math.floor(availableW * PDF_WIDTH_RATIO));
      pdfTargetWRef.current = targetW;

      const dims: { pageIndex: number; wPx: number; hPx: number }[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport0 = page.getViewport({ scale: 1 });
        const scale = targetW / viewport0.width;
        const viewport = page.getViewport({ scale });
        dims.push({
          pageIndex: i - 1,
          wPx: Math.floor(viewport.width),
          hPx: Math.floor(viewport.height),
        });
      }

      setPdfDocPages(dims);

      setTimeout(async () => {
        await renderAllPdfPages();
      }, 0);

      setOverlayPageIndex(Math.max(0, pdf.numPages - 1));
    } catch (e: any) {
      console.error(e);
      setPdfError("Impossible d’afficher le PDF en mode signature.");
      pdfInstanceRef.current = null;
    } finally {
      if (!cancelled) setPdfLoading(false);
    }
  };

  run();

  return () => {
    cancelled = true;
  };
}, [showSignature, isPDF, signedUrl]);


  // ✅ After validating signature, re-render pages (prevents blank)
  useEffect(() => {
    if (!showSignature || !isPDF) return;
    if (!sigDataUrl) return;

    const t = setTimeout(() => {
      renderAllPdfPages();
    }, 0);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sigDataUrl]);

  async function applySignatureToPdf() {
    setUiMsg("");
    setSigMsg("");

    if (!doc || !signedUrl) return;
    if (!isPDF) {
      setSigMsg("Signature disponible uniquement sur les PDF.");
      return;
    }
    if (!sigDataUrl) {
      setSigMsg("Validez d’abord la signature.");
      return;
    }

    setSigning(true);

    try {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        setSigning(false);
        setSigMsg("Non connecté.");
        return;
      }

      const pdfBytes = await fetch(signedUrl).then((r) => r.arrayBuffer());
      const pngBytes = await fetch(sigDataUrl).then((r) => r.arrayBuffer());

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const png = await pdfDoc.embedPng(pngBytes);

      const pages = pdfDoc.getPages();
      const safePageIndex = Math.max(0, Math.min(overlayPageIndex, pages.length - 1));
      const page = pages[safePageIndex];
      const { width, height } = page.getSize();

      if (showSignature && pdfDocPages.length > 0) {
        const pagePx = pdfDocPages[safePageIndex];
        if (!pagePx) {
          setSigning(false);
          setSigMsg("Aperçu PDF non prêt.");
          return;
        }

        const scaleX = width / pagePx.wPx;
        const scaleY = height / pagePx.hPx;

        const xPts = overlay.x * scaleX;
        const wPts = overlay.w * scaleX;
        const hPts = overlay.h * scaleY;
        const yPts = height - overlay.y * scaleY - hPts;

        page.drawImage(png, { x: xPts, y: yPts, width: wPts, height: hPts });
      } else {
        const wrap = previewWrapRef.current;
        if (!wrap) {
          setSigning(false);
          setSigMsg("Aperçu non prêt.");
          return;
        }

        const wrapW = wrap.clientWidth;
        const wrapH = wrap.clientHeight;

        const scaleX = width / wrapW;
        const scaleY = height / wrapH;

        const xPts = overlay.x * scaleX;
        const wPts = overlay.w * scaleX;
        const hPts = overlay.h * scaleY;
        const yPts = height - overlay.y * scaleY - hPts;

        page.drawImage(png, { x: xPts, y: yPts, width: wPts, height: hPts });
      }

      const signedPdfBytes = await pdfDoc.save();

      const baseTitle = doc.title || "Document";
      const safe = slugify(baseTitle) || "document";
      const filename = `${safe}-signe.pdf`;
      const newPath = `${user.id}/signed/${Date.now()}-${filename}`;

      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(newPath, signedPdfBytes, { contentType: "application/pdf", upsert: false });

      if (upErr) {
        setSigning(false);
        setSigMsg(`Erreur upload : ${upErr.message}`);
        return;
      }

      const { data: inserted, error: insErr } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          title: `${baseTitle} (signé)`,
          original_filename: filename,
          category: doc.category || "autres",
          source: doc.source || "upload",
          file_path: newPath,
          mime_type: "application/pdf",
          is_ready: true,
          needs_review: false,
        })
        .select("id")
        .single();

      if (insErr || !inserted?.id) {
        setSigning(false);
        setSigMsg(`Erreur enregistrement : ${insErr?.message || "inconnue"}`);
        return;
      }

      setSigning(false);
      setShowSignature(false);
      setSigDataUrl(null);
      setOverlaySelected(false);
      setOverlayLocked(false);
      dragRef.current = null;

      window.location.href = `/documents/view?id=${inserted.id}`;
    } catch (e: any) {
      setSigning(false);
      setSigMsg(`Erreur : ${e?.message ?? "inconnue"}`);
    }
  }

  const handleDelete = async () => {
    setUiMsg("");
    if (!doc?.id) return;

    const ok = window.confirm("Supprimer ce document ?\n\nCette action est définitive.");
    if (!ok) return;

    setDeleting(true);

    try {
      if (doc.file_path) {
        const { error: rmErr } = await supabase.storage.from("documents").remove([doc.file_path]);
        if (rmErr) {
          setDeleting(false);
          setUiMsg(`Erreur suppression fichier : ${rmErr.message}`);
          return;
        }
      }

      const { error: delErr } = await supabase.from("documents").delete().eq("id", doc.id);
      if (delErr) {
        setDeleting(false);
        setUiMsg(`Erreur suppression document : ${delErr.message}`);
        return;
      }

      window.location.href = "/documents";
    } catch (e: any) {
      setDeleting(false);
      setUiMsg(`Erreur : ${e?.message ?? "inconnue"}`);
    }
  };

  if (loading) return <div className="p-6 text-slate-500">Chargement...</div>;
  if (errorMsg)
    return (
      <div className="p-6">
        <p className="text-slate-700 font-medium">Oups</p>
        <p className="text-slate-500 text-sm mt-1">{errorMsg}</p>
        <a href="/documents" className="mt-4 inline-block text-sm font-medium text-[hsl(var(--primary))]">
          Retour à mes documents →
        </a>
      </div>
    );

  return (
    <div className="px-6 pt-6 pb-24">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-5">
        <a
          href="/documents"
          className="w-10 h-10 rounded-full border border-slate-200 bg-white flex items-center justify-center active:scale-95 transition"
          aria-label="Retour"
        >
          <ChevronLeft className="text-slate-700" />
        </a>

        <div className="min-w-0">
          <p className="text-xs text-slate-500">Aperçu</p>
          <h1 className="text-xl font-bold truncate">{title}</h1>
        </div>
      </div>

      {/* CARD ACTIONS */}
      <div className="card p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <InfoRow icon={<Folder size={18} />} label="Catégorie" value={labelCat(doc?.category || null)} />
          <InfoRow icon={<Calendar size={18} />} label="Ajouté le" value={createdLabel} />
          <InfoRow icon={<Mail size={18} />} label="Source" value={labelSource(doc?.source || null)} />
        </div>

        <div className="mt-4 flex gap-3">
          <a
            href={signedUrl || "#"}
            target="_blank"
            className="flex-1 py-3 rounded-full text-white font-medium text-center
              bg-gradient-to-r from-[hsl(202_100%_82%)] via-[hsl(328_80%_84%)] to-[hsl(39_100%_85%)]
              shadow-md active:scale-95 transition flex items-center justify-center gap-2"
          >
            {isTxt ? (
              <>
                <Download size={18} />
                Télécharger
              </>
            ) : (
              "Ouvrir / Télécharger"
            )}
          </a>

          <a
            href={signedUrl || "#"}
            target="_blank"
            className="w-12 py-3 rounded-full border border-slate-200 bg-white flex items-center justify-center
              shadow-sm active:scale-95 transition"
            aria-label="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink className="text-slate-700" size={18} />
          </a>
        </div>

        {/* SIGN toggle */}
        <button
          onClick={() => {
            setSigMsg("");
            setShowSignature((v) => !v);
          }}
          className="mt-3 w-full py-3 rounded-full border border-slate-200 bg-white text-slate-800 font-semibold
            active:scale-95 transition flex items-center justify-center gap-2"
        >
          <PenLine size={18} />
          {showSignature ? "Fermer la signature" : "Signer"}
          <ChevronDown size={18} className={`ml-1 transition ${showSignature ? "rotate-180" : ""}`} />
        </button>

        {showSignature && (
          <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm font-medium">Dessinez puis validez</p>

            <div className="mt-3 rounded-2xl border border-slate-200 overflow-hidden">
              <canvas
                ref={sigCanvasRef}
                className="w-full h-[140px] touch-none"
                onPointerDown={onSigDown}
                onPointerMove={onSigMove}
                onPointerUp={onSigUp}
                onPointerCancel={onSigUp}
              />
            </div>

            <div className="mt-3 flex gap-3">
              <button
                onClick={clearSignature}
                className="flex-1 py-3 rounded-full border border-slate-200 bg-white font-semibold
                  active:scale-95 transition flex items-center justify-center gap-2"
              >
                <Eraser size={18} />
                Effacer
              </button>

              <button
                onClick={validateSignature}
                className="flex-1 py-3 rounded-full bg-[hsl(var(--primary))] text-white font-semibold
                  active:scale-95 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                Valider
              </button>
            </div>

            <button
              onClick={applySignatureToPdf}
              disabled={signing || !sigDataUrl || !isPDF}
              className="mt-3 w-full py-3 rounded-full text-white font-semibold
                bg-gradient-to-r from-[hsl(202_100%_82%)] via-[hsl(328_80%_84%)] to-[hsl(39_100%_85%)]
                shadow-md active:scale-95 transition disabled:opacity-60
                flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} />
              {signing ? "Enregistrement..." : "Enregistrer le PDF signé"}
            </button>

            {!isPDF && <p className="text-xs text-slate-500 mt-2">La signature est dispo uniquement sur les PDF.</p>}
            {sigMsg && <p className="text-xs text-slate-500 mt-2">{sigMsg}</p>}
          </div>
        )}

        <button
          onClick={handleDelete}
          disabled={deleting}
          className="mt-3 w-full py-3 rounded-full border border-red-200 bg-red-50 text-red-700 font-semibold
            active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          <Trash2 size={18} />
          {deleting ? "Suppression..." : "Supprimer ce document"}
        </button>

        {uiMsg ? <p className="text-sm text-slate-500 mt-3">{uiMsg}</p> : null}
      </div>

      {/* PREVIEW */}
      <div className="card p-3 mt-4">
        <div className="flex items-center gap-2 mb-3 text-slate-600">
          <FileText size={18} />
          <p className="text-sm font-medium">Aperçu</p>
        </div>

        <div
          ref={previewWrapRef}
          className="relative w-full rounded-2xl border border-slate-100 bg-white overflow-hidden"
          onPointerMove={onOverlayPointerMove}
          onPointerUp={onOverlayPointerUp}
          onPointerCancel={onOverlayPointerUp}
          onPointerDown={() => {
            if (overlaySelected) setOverlaySelected(false);
          }}
        >
          {isTxt ? (
            <div className="p-4">
              {textLoading ? (
                <p className="text-slate-500 text-sm">Chargement du texte…</p>
              ) : (
                <pre className="whitespace-pre-wrap text-sm text-slate-800">{textContent}</pre>
              )}
            </div>
          ) : isPDF ? (
            showSignature ? (
              <div
                ref={pdfScrollRef}
                className="w-full h-[75vh] overflow-auto"
                style={{ WebkitOverflowScrolling: "touch" as any }}
              >
                {pdfLoading && <div className="p-4 text-sm text-slate-500">Chargement du PDF…</div>}
                {pdfError && <div className="p-4 text-sm text-slate-500">{pdfError}</div>}

                <div className="px-3 py-3 flex flex-col gap-4">
                  {pdfDocPages.map((p) => (
                    <div
                      key={p.pageIndex}
                      ref={(el) => {
                        pageWrapRefs.current[p.pageIndex] = el;
                      }}
                      className="relative mx-auto rounded-xl border border-slate-200 bg-white overflow-hidden"
                      style={{ width: p.wPx, height: p.hPx }}
                      onPointerDown={() => {
                        setOverlayPageIndex(p.pageIndex);
                      }}
                    >
                      <canvas className="block" />

                      {sigDataUrl && showSignature && isPDF && overlayPageIndex === p.pageIndex && (
                        <div
                          className="absolute z-20"
                          style={{
                            left: overlay.x,
                            top: overlay.y,
                            width: overlay.w,
                            height: overlay.h,
                          }}
                          onPointerDown={(e) => {
                            e.stopPropagation();
                            if (!overlaySelected) setOverlaySelected(true);
                          }}
                        >
                          {(overlaySelected || overlayLocked) && (
                            <button
                              type="button"
                              onPointerDown={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                toggleLock();
                              }}
                              className="absolute -top-10 right-0 px-3 py-2 rounded-full border border-slate-200 bg-white shadow-sm
                                text-slate-800 text-xs font-semibold flex items-center gap-2 active:scale-95 transition"
                            >
                              {overlayLocked ? <Unlock size={14} /> : <Lock size={14} />}
                              {overlayLocked ? "Déverrouiller" : "Verrouiller"}
                            </button>
                          )}

                          <div
                            className={`w-full h-full rounded-lg bg-white/0 ${
                              overlayLocked
                                ? "border-2 border-slate-300"
                                : overlaySelected
                                ? "border-2 border-[hsl(var(--primary))]"
                                : "border border-transparent"
                            }`}
                            onPointerDown={(e) => onOverlayPointerDown(e as any, "move")}
                            style={{ touchAction: "none" }}
                          >
                            <img
                              src={sigDataUrl}
                              alt="Signature"
                              draggable={false}
                              className="w-full h-full object-contain select-none pointer-events-none"
                            />
                          </div>

                          {overlaySelected && !overlayLocked && (
                            <>
                              <Handle x="left" y="top" onDown={(e) => onOverlayPointerDown(e as any, "nw")} />
                              <Handle x="right" y="top" onDown={(e) => onOverlayPointerDown(e as any, "ne")} />
                              <Handle x="left" y="bottom" onDown={(e) => onOverlayPointerDown(e as any, "sw")} />
                              <Handle x="right" y="bottom" onDown={(e) => onOverlayPointerDown(e as any, "se")} />
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <iframe src={signedUrl || ""} className="w-full h-[75vh]" />
            )
          ) : (
            <img src={signedUrl || ""} alt={title} className="w-full" />
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--muted))] flex items-center justify-center text-[hsl(var(--primary))]">
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-sm font-medium text-[hsl(var(--foreground))]">{value}</p>
      </div>
    </div>
  );
}

function Handle({
  x,
  y,
  onDown,
}: {
  x: "left" | "right";
  y: "top" | "bottom";
  onDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}) {
  const style: React.CSSProperties = {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 999,
    border: "2px solid white",
    boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
    background: "hsl(var(--primary))",
    touchAction: "none",
  };

  if (x === "left") style.left = -7;
  if (x === "right") style.right = -7;
  if (y === "top") style.top = -7;
  if (y === "bottom") style.bottom = -7;

  return <div style={style} onPointerDown={onDown} />;
}
