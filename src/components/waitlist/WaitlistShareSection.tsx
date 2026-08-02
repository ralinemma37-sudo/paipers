"use client";

/**
 * Partage organique Paipers — page confirmation waitlist.
 * Aucune donnée personnelle dans les URLs.
 */

import { useEffect, useState, type CSSProperties } from "react";
import { Check, Copy, Linkedin, Mail, Share2 } from "lucide-react";
import {
  WAITLIST_SHARE_URL,
  canUseNativeShare,
  copyTextToClipboard,
  emailShareHref,
  linkedInShareUrl,
  nativeSharePaipers,
  whatsappShareUrl,
} from "@/lib/waitlist/share";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function WaitlistShareSection() {
  const [native, setNative] = useState(false);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    setNative(canUseNativeShare());
  }, []);

  useEffect(() => {
    if (!copied) return;
    const t = window.setTimeout(() => setCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [copied]);

  const onCopy = async () => {
    const ok = await copyTextToClipboard(WAITLIST_SHARE_URL);
    if (ok) {
      setCopied(true);
      setStatus("Lien copié");
    } else {
      setStatus("Impossible de copier le lien");
    }
  };

  const onNativeShare = async () => {
    const result = await nativeSharePaipers();
    if (result === "cancelled") {
      setStatus("");
      return;
    }
    if (result === "shared") setStatus("Merci pour le partage");
    if (result === "error") setStatus("Partage impossible pour le moment");
  };

  const btnBase: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minHeight: 44,
    padding: "10px 14px",
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 700,
    textDecoration: "none",
    border: `1px solid ${PAIPERS_COLORS.border}`,
    background: "#fff",
    color: PAIPERS_COLORS.navy,
    cursor: "pointer",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <section
      style={{
        marginTop: 22,
        padding: "18px 16px",
        borderRadius: 18,
        background: "linear-gradient(180deg, #F8FBFF 0%, #F3F6FB 100%)",
        border: `1px solid ${PAIPERS_COLORS.border}`,
        textAlign: "left",
      }}
    >
      <h2
        style={{
          margin: 0,
          fontSize: 17,
          fontWeight: 800,
          color: PAIPERS_COLORS.navy,
          letterSpacing: -0.2,
        }}
      >
        Aide-nous à faire connaître Paipers
      </h2>
      <p
        style={{
          margin: "8px 0 0",
          fontSize: 14,
          lineHeight: 1.5,
          color: "rgba(0,0,0,0.62)",
        }}
      >
        Tu connais quelqu’un qui aimerait enfin simplifier son administratif ?
        Partage-lui Paipers.
      </p>

      <div className="mt-3.5 grid grid-cols-2 gap-2">
        {native ? (
          <button
            type="button"
            onClick={() => void onNativeShare()}
            className="col-span-2"
            style={{
              ...btnBase,
              background: PAIPERS_COLORS.navy,
              color: "#fff",
              border: "none",
              fontWeight: 800,
            }}
          >
            <Share2 size={16} aria-hidden />
            Partager Paipers
          </button>
        ) : null}

        <button type="button" onClick={() => void onCopy()} style={btnBase}>
          {copied ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />}
          {copied ? "Lien copié" : "Copier le lien"}
        </button>

        <a
          href={whatsappShareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          style={btnBase}
        >
          WhatsApp
        </a>

        <a
          href={linkedInShareUrl()}
          target="_blank"
          rel="noopener noreferrer"
          style={btnBase}
        >
          <Linkedin size={16} aria-hidden />
          LinkedIn
        </a>

        <a href={emailShareHref()} style={btnBase}>
          <Mail size={16} aria-hidden />
          Email
        </a>
      </div>

      <p
        role="status"
        aria-live="polite"
        style={{
          margin: status ? "10px 0 0" : 0,
          fontSize: 13,
          fontWeight: 700,
          color: PAIPERS_COLORS.navy,
        }}
      >
        {status}
      </p>
    </section>
  );
}
