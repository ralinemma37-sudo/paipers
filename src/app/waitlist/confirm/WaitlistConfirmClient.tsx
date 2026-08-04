"use client";

/**
 * Page confirmation waitlist — UX / éditorial + preuve sociale + partage.
 * La confirmation reste déléguée à GET /api/waitlist/confirm (inchangée).
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check, Sparkles } from "lucide-react";
import PublicSiteHeader from "@/components/landing/PublicSiteHeader";
import WaitlistShareSection from "@/components/waitlist/WaitlistShareSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_ASSETS, PAIPERS_COLORS } from "@/lib/paipersTheme";
import { socialProofForConfirm } from "@/lib/waitlist/socialProof";

type ConfirmState =
  | "loading"
  | "ok"
  | "already"
  | "invalid"
  | "server";

/** Bénéfices liés à la finalité liste d’attente (ouverture). */
const WAITLIST_BENEFITS = [
  "L’annonce de l’ouverture officielle",
  "Les étapes importantes avant le lancement",
  "Les premières informations sur Paipers",
] as const;

function mapErrorToState(status: number, apiError?: string): ConfirmState {
  if (status === 404 || status === 400) return "invalid";
  if (status >= 500) return "server";
  const msg = (apiError || "").toLowerCase();
  if (msg.includes("expiré") || msg.includes("inconnu") || msg.includes("invalide")) {
    return "invalid";
  }
  return "server";
}

export default function WaitlistConfirmClient() {
  const search = useSearchParams();
  const token = search.get("token") || "";
  const [state, setState] = useState<ConfirmState>(() =>
    token ? "loading" : "invalid",
  );
  const [proofText, setProofText] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
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
          setState(mapErrorToState(res.status, json.error));
          return;
        }
        // Retire le token de l’URL (historique navigateur / partage d’écran).
        try {
          window.history.replaceState({}, "", "/waitlist/confirm");
        } catch {
          /* ignore */
        }
        setState(json.alreadyConfirmed ? "already" : "ok");
      } catch {
        if (!cancelled) setState("server");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/waitlist/count", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const json = (await res.json().catch(() => ({}))) as { count?: number };
        const count = typeof json.count === "number" ? json.count : 0;
        const proof = socialProofForConfirm(count);
        if (!cancelled && proof.visible) setProofText(proof.text);
      } catch {
        /* silence */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const title =
    state === "ok" || state === "already"
      ? "Merci !"
      : state === "invalid"
        ? "Ce lien n’est plus valide"
        : state === "server"
          ? "Un problème est survenu"
          : "Confirmation…";

  const body =
    state === "ok"
      ? "Ton inscription à la liste d’attente est confirmée. Tu fais désormais partie des premières personnes qui seront informées de l’ouverture de Paipers."
      : state === "already"
        ? "Ton inscription est déjà confirmée. Tu seras informé(e) en priorité de l’ouverture de Paipers."
        : state === "invalid"
          ? "Ce lien de confirmation n’est plus valide. Tu peux retourner sur Paipers ou t’inscrire à nouveau depuis la page d’accueil."
          : state === "server"
            ? "Nous n’avons pas pu confirmer ton inscription pour le moment. Réessaie dans quelques minutes."
            : "Confirmation en cours…";

  const showSuccess = state === "ok" || state === "already";

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: DESKTOP_SURFACES.night }}
    >
      <PublicSiteHeader />
      <div
        className="flex-1 flex items-center justify-center px-5 py-12 md:py-16"
        style={{ paddingBottom: 64 }}
      >
        <div
          className="w-full paipers-card-white"
          style={{
            maxWidth: 520,
            borderRadius: 24,
            padding: "28px 22px 26px",
            textAlign: "center",
          }}
        >
          <img
            src={PAIPERS_ASSETS.mascot}
            alt=""
            width={112}
            height={112}
            className="mx-auto"
            style={{ width: 112, height: "auto", display: "block" }}
          />

          {showSuccess ? (
            <p
              style={{
                margin: "16px auto 0",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 12px",
                borderRadius: 999,
                background: "hsl(168 45% 92%)",
                color: PAIPERS_COLORS.success,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: "0.02em",
              }}
            >
              <Check size={14} strokeWidth={2.6} aria-hidden />
              Inscription confirmée
            </p>
          ) : null}

          {state === "loading" ? (
            <p
              className="paipers-text-muted"
              style={{ margin: "20px 0 0", fontSize: 15 }}
              role="status"
            >
              Confirmation en cours…
            </p>
          ) : (
            <>
              <h1
                style={{
                  margin: "14px 0 0",
                  fontSize: "clamp(1.6rem, 5vw, 2rem)",
                  fontWeight: 800,
                  letterSpacing: -0.4,
                  color:
                    state === "invalid" || state === "server"
                      ? "#991B1B"
                      : PAIPERS_COLORS.navy,
                  lineHeight: 1.15,
                }}
              >
                {title}
              </h1>
              <p
                style={{
                  margin: "12px 0 0",
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: "rgba(0,0,0,0.62)",
                }}
              >
                {body}
              </p>
              {showSuccess && proofText ? (
                <p
                  role="status"
                  style={{
                    margin: "12px 0 0",
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: 1.45,
                    color: PAIPERS_COLORS.navy,
                  }}
                >
                  {proofText}
                </p>
              ) : null}
            </>
          )}

          {showSuccess ? (
            <ul
              style={{
                listStyle: "none",
                margin: "22px 0 0",
                padding: 0,
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {WAITLIST_BENEFITS.map((line) => (
                <li
                  key={line}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                    padding: "10px 12px",
                    borderRadius: 14,
                    background: "hsl(220 30% 97%)",
                  }}
                >
                  <Sparkles
                    size={16}
                    color={PAIPERS_COLORS.navy}
                    style={{ marginTop: 2, flexShrink: 0 }}
                    aria-hidden
                  />
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: PAIPERS_COLORS.navy,
                      lineHeight: 1.4,
                    }}
                  >
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          ) : null}

          {showSuccess ? (
            <div
              style={{
                marginTop: 18,
                padding: "14px 14px",
                borderRadius: 16,
                background: "#F8FAFC",
                border: `1px solid ${PAIPERS_COLORS.border}`,
                textAlign: "left",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: PAIPERS_COLORS.navy,
                }}
              >
                Notre mission
              </p>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 14,
                  lineHeight: 1.55,
                  color: "rgba(0,0,0,0.62)",
                }}
              >
                Rendre l’administratif plus simple, plus clair et moins chronophage
                grâce à un copilote intelligent qui centralise, explique et
                accompagne.
              </p>
            </div>
          ) : null}

          {showSuccess ? <WaitlistShareSection /> : null}

          <div
            style={{
              marginTop: 26,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              alignItems: "center",
            }}
          >
            {showSuccess ? (
              <>
                <Link
                  href="/#fonctionnalites"
                  className="paipers-button"
                  style={{
                    display: "inline-flex",
                    minWidth: 220,
                    justifyContent: "center",
                    textDecoration: "none",
                    minHeight: 48,
                    alignItems: "center",
                  }}
                >
                  Découvrir Paipers
                </Link>
                <Link
                  href="/"
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: PAIPERS_COLORS.navy,
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                  }}
                >
                  Retour à l’accueil
                </Link>
              </>
            ) : state === "loading" ? null : (
              <Link
                href="/"
                className="paipers-button"
                style={{
                  display: "inline-flex",
                  minWidth: 220,
                  justifyContent: "center",
                  textDecoration: "none",
                  minHeight: 48,
                  alignItems: "center",
                }}
              >
                Retourner sur Paipers
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
