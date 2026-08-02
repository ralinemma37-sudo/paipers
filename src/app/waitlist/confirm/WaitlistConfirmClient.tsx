"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PublicSiteHeader from "@/components/landing/PublicSiteHeader";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function WaitlistConfirmClient() {
  const search = useSearchParams();
  const token = search.get("token") || "";
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setState("error");
      setMessage("Lien de confirmation manquant.");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(
          `/api/waitlist/confirm?token=${encodeURIComponent(token)}`,
        );
        const json = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          alreadyConfirmed?: boolean;
        };
        if (cancelled) return;
        if (!res.ok || !json.ok) {
          setState("error");
          setMessage(json.error || "Confirmation impossible.");
          return;
        }
        setState("ok");
        setMessage(
          json.alreadyConfirmed
            ? "Ton inscription était déjà confirmée. Merci !"
            : "Ton inscription est confirmée. Tu seras parmi les premiers informés du lancement.",
        );
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Confirmation impossible.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen" style={{ background: DESKTOP_SURFACES.night }}>
      <PublicSiteHeader />
      <div
        className="mx-auto px-5 py-20"
        style={{ maxWidth: 560 }}
      >
        <div className="paipers-card-white p-8 text-center">
          {state === "loading" ? (
            <p className="paipers-text-muted" style={{ margin: 0 }}>
              Confirmation en cours…
            </p>
          ) : null}
          {state === "ok" ? (
            <>
              <p
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 800,
                  color: PAIPERS_COLORS.navy,
                }}
              >
                Merci !
              </p>
              <p
                className="paipers-text-muted"
                style={{ marginTop: 12, fontSize: 16, lineHeight: 1.55 }}
              >
                {message}
              </p>
            </>
          ) : null}
          {state === "error" ? (
            <>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#991B1B" }}>
                Lien invalide
              </p>
              <p className="paipers-text-muted" style={{ marginTop: 12 }}>
                {message}
              </p>
            </>
          ) : null}
          <Link
            href="/#waitlist"
            className="paipers-button"
            style={{ display: "inline-block", marginTop: 24, textDecoration: "none" }}
          >
            Retour à Paipers
          </Link>
        </div>
      </div>
    </div>
  );
}
