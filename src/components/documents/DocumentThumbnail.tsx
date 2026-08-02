"use client";

/**
 * Vignette document — images + 1ʳᵉ page PDF.
 * Réf. : paipers-mobile/src/components/documents/DocumentThumbnail.tsx
 */

import { useEffect, useState, type CSSProperties } from "react";
import { FileSpreadsheet, FileText, FileType, Image as ImageIcon } from "lucide-react";
import { classifyDocumentFileKind } from "@/lib/documentFileKind";
import {
  getCachedPdfThumbnail,
  renderPdfThumbnail,
} from "@/lib/documentPdfThumbnail";
import { resolveDocumentPreviewUrl } from "@/lib/documentPreviewUrl";
import { PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";

type Props = {
  filePath?: string | null;
  storagePath?: string | null;
  mimeType?: string | null;
  selected?: boolean;
};

const previewUrlCache = new Map<string, string>();

function cacheKey(storagePath?: string | null, filePath?: string | null) {
  return (storagePath || filePath || "").trim();
}

export default function DocumentThumbnail({
  filePath,
  storagePath,
  mimeType,
  selected,
}: Props) {
  const key = cacheKey(storagePath, filePath);
  const kind = classifyDocumentFileKind(mimeType, storagePath || filePath);
  const cachedUrl = key ? previewUrlCache.get(key) : undefined;
  const cachedPdf = key ? getCachedPdfThumbnail(key) : undefined;

  const [previewUrl, setPreviewUrl] = useState(cachedUrl ?? "");
  const [thumbUri, setThumbUri] = useState<string | null>(cachedPdf ?? null);
  const [loading, setLoading] = useState(!cachedUrl && !cachedPdf && !!key);
  const [failed, setFailed] = useState(!key);

  useEffect(() => {
    if (!key) {
      setFailed(true);
      setLoading(false);
      return;
    }

    const memPdf = getCachedPdfThumbnail(key);
    if (memPdf) {
      setThumbUri(memPdf);
      setLoading(false);
      setFailed(false);
      return;
    }

    const memUrl = previewUrlCache.get(key);
    if (memUrl) {
      setPreviewUrl(memUrl);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setFailed(false);

    void resolveDocumentPreviewUrl({
      storage_path: storagePath,
      file_path: filePath,
    })
      .then((u) => {
        if (cancelled) return;
        if (!u) {
          setFailed(true);
          return;
        }
        previewUrlCache.set(key, u);
        setPreviewUrl(u);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [key, storagePath, filePath]);

  useEffect(() => {
    if (kind !== "pdf" || !previewUrl || !key || thumbUri || failed) return;

    let cancelled = false;
    setLoading(true);
    void renderPdfThumbnail(key, previewUrl).then((dataUrl) => {
      if (cancelled) return;
      if (dataUrl) {
        setThumbUri(dataUrl);
        setFailed(false);
      } else {
        setFailed(true);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [kind, previewUrl, key, thumbUri, failed]);

  const border = selected
    ? `2px solid ${PAIPERS_COLORS.navy}`
    : `1px solid ${PAIPERS_COLORS.border}`;

  const frameStyle: CSSProperties = {
    aspectRatio: "210 / 297",
    borderRadius: 12,
    background: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border,
    overflow: "hidden",
    position: "relative",
    boxShadow: "0 2px 8px rgba(26, 43, 74, 0.08)",
  };

  if (thumbUri) {
    return (
      <div style={frameStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={thumbUri}
          alt=""
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
          }}
        />
      </div>
    );
  }

  if (kind === "image" && previewUrl && !failed) {
    return (
      <div style={frameStyle}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt=""
          onError={() => setFailed(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "top center",
            display: "block",
          }}
        />
      </div>
    );
  }

  const icon =
    kind === "image" ? (
      <ImageIcon size={28} color={PAIPERS_COLORS.navy} strokeWidth={2} />
    ) : kind === "excel" ? (
      <FileSpreadsheet size={28} color={PAIPERS_COLORS.navy} strokeWidth={2} />
    ) : kind === "word" || kind === "powerpoint" || kind === "text" ? (
      <FileType size={28} color={PAIPERS_COLORS.navy} strokeWidth={2} />
    ) : (
      <FileText size={28} color={PAIPERS_COLORS.navy} strokeWidth={2} />
    );

  return (
    <div
      style={{
        ...frameStyle,
        background: PAIPERS_PALETTES.light.muted,
      }}
    >
      {loading && kind === "pdf" ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(110deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.1) 90%)",
            animation: "paipersFadeIn 900ms ease infinite alternate",
          }}
        />
      ) : null}
      {icon}
    </div>
  );
}
