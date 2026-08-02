/**
 * Capture page 1 d’un PDF en data-URL (vignettes Documents).
 * Cache mémoire + file d’attente limitée pour éviter de saturer le navigateur.
 */

const thumbCache = new Map<string, string>();
const inflight = new Map<string, Promise<string | null>>();

let active = 0;
const MAX_PARALLEL = 2;
const waitQueue: Array<() => void> = [];

async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_PARALLEL) {
    await new Promise<void>((resolve) => waitQueue.push(resolve));
  }
  active += 1;
  try {
    return await fn();
  } finally {
    active -= 1;
    const next = waitQueue.shift();
    if (next) next();
  }
}

async function renderPdfFirstPage(signedUrl: string): Promise<string | null> {
  const pdfjsLib = (await import("pdfjs-dist/legacy/build/pdf.mjs")) as {
    GlobalWorkerOptions: { workerSrc: string };
    getDocument: (opts: { data: ArrayBuffer }) => {
      promise: Promise<{
        getPage: (n: number) => Promise<{
          getViewport: (opts: { scale: number }) => { width: number; height: number };
          render: (opts: {
            canvasContext: CanvasRenderingContext2D;
            viewport: { width: number; height: number };
          }) => { promise: Promise<void> };
        }>;
      }>;
    };
  };

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/legacy/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const ab = await fetch(signedUrl).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.arrayBuffer();
  });

  const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
  const page = await pdf.getPage(1);
  const viewport0 = page.getViewport({ scale: 1 });
  const targetW = 280;
  const scale = targetW / viewport0.width;
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function getCachedPdfThumbnail(cacheKey: string): string | undefined {
  return thumbCache.get(cacheKey);
}

export async function renderPdfThumbnail(
  cacheKey: string,
  signedUrl: string,
): Promise<string | null> {
  const hit = thumbCache.get(cacheKey);
  if (hit) return hit;

  const pending = inflight.get(cacheKey);
  if (pending) return pending;

  const task = withSlot(async () => {
    try {
      const dataUrl = await renderPdfFirstPage(signedUrl);
      if (dataUrl) thumbCache.set(cacheKey, dataUrl);
      return dataUrl;
    } catch {
      return null;
    } finally {
      inflight.delete(cacheKey);
    }
  });

  inflight.set(cacheKey, task);
  return task;
}
