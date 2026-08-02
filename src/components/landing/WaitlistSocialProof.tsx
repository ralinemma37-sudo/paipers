"use client";

/**
 * Preuve sociale discrète — landing waitlist (confirmed only).
 * Échec réseau = silence (pas d’erreur technique).
 */

import { useEffect, useState } from "react";
import { socialProofForLanding } from "@/lib/waitlist/socialProof";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function WaitlistSocialProof() {
  const [text, setText] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/waitlist/count", { cache: "no-store" });
        if (!res.ok) {
          if (!cancelled) setReady(true);
          return;
        }
        const json = (await res.json().catch(() => ({}))) as { count?: number };
        const count = typeof json.count === "number" ? json.count : 0;
        const proof = socialProofForLanding(count);
        if (!cancelled) {
          setText(proof.visible ? proof.text : null);
          setReady(true);
        }
      } catch {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || !text) return null;

  return (
    <p
      role="status"
      style={{
        margin: "0 0 18px",
        textAlign: "center",
        fontSize: 14,
        fontWeight: 700,
        lineHeight: 1.45,
        color: PAIPERS_COLORS.navy,
      }}
    >
      {text}
    </p>
  );
}
