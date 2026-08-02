"use client";

/**
 * Formulaire liste d’attente — section premium landing.
 */

import { useMemo, useState } from "react";
import Link from "next/link";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS, PAIPERS_RADIUS } from "@/lib/paipersTheme";
import type { WaitlistProfile } from "@/lib/waitlist/types";

type Status = "idle" | "loading" | "success" | "error";

const PROFILES: { value: WaitlistProfile; label: string }[] = [
  { value: "particulier", label: "Particulier" },
  { value: "professionnel", label: "Professionnel" },
  { value: "les_deux", label: "Les deux" },
];

function readUtm() {
  if (typeof window === "undefined") {
    return { utm_source: "", utm_medium: "", utm_campaign: "" };
  }
  try {
    const q = new URLSearchParams(window.location.search);
    return {
      utm_source: q.get("utm_source") || "",
      utm_medium: q.get("utm_medium") || "",
      utm_campaign: q.get("utm_campaign") || "",
    };
  } catch {
    return { utm_source: "", utm_medium: "", utm_campaign: "" };
  }
}

export default function WaitlistForm({ embedded = false }: { embedded?: boolean }) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [profile, setProfile] = useState<WaitlistProfile | "">("");
  const [challenge, setChallenge] = useState("");
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [devConfirmUrl, setDevConfirmUrl] = useState("");

  const inputStyle = useMemo(
    () =>
      ({
        width: "100%",
        borderRadius: 12,
        border: `1px solid ${PAIPERS_COLORS.border}`,
        padding: "12px 14px",
        fontSize: 15,
        background: "#fff",
        color: PAIPERS_COLORS.textPrimary,
        outline: "none",
      }) as const,
    [],
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    setDevConfirmUrl("");
    try {
      const utm = readUtm();
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          email,
          profile,
          challenge,
          marketingConsent,
          source: "landing",
          ...utm,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
        emailWarning?: string;
        alreadyConfirmed?: boolean;
        devConfirmUrl?: string;
      };
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Inscription impossible.");
      }
      setStatus("success");
      setMessage(
        json.alreadyConfirmed
          ? json.message || "Tu es déjà inscrit(e)."
          : json.emailWarning
            ? `${json.message || "Inscription enregistrée."} ${json.emailWarning}`
            : json.message ||
              "Ton inscription a bien été enregistrée. Vérifie ta boîte mail pour confirmer.",
      );
      if (json.devConfirmUrl) setDevConfirmUrl(json.devConfirmUrl);
    } catch (err: unknown) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Inscription impossible.");
    }
  };

  if (status === "success") {
    return (
      <div
        className={embedded ? "" : "paipers-card-white"}
        style={{
          padding: embedded ? 0 : 28,
          borderRadius: embedded ? 0 : 20,
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 28,
            fontWeight: 800,
            color: PAIPERS_COLORS.navy,
            letterSpacing: -0.4,
          }}
        >
          Merci !
        </p>
        <p
          className="paipers-text-muted"
          style={{ marginTop: 12, fontSize: 16, lineHeight: 1.55 }}
        >
          Ton inscription a bien été enregistrée.
          <br />
          Tu seras parmi les premiers informés du lancement de Paipers.
        </p>
        {message ? (
          <p style={{ marginTop: 14, fontSize: 14, color: PAIPERS_COLORS.navy, fontWeight: 600 }}>
            {message}
          </p>
        ) : null}
        {devConfirmUrl ? (
          <p style={{ marginTop: 12, fontSize: 12, wordBreak: "break-all" }}>
            <a href={devConfirmUrl}>Lien de confirmation (dev)</a>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: PAIPERS_COLORS.textPrimary }}>
            Prénom <span className="paipers-text-muted" style={{ fontWeight: 500 }}>(facultatif)</span>
          </span>
          <input
            type="text"
            name="firstName"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: PAIPERS_COLORS.textPrimary }}>
            Adresse email <span style={{ color: "#B91C1C" }}>*</span>
          </span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>

        <fieldset style={{ border: "none", margin: 0, padding: 0 }}>
          <legend style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
            Profil <span style={{ color: "#B91C1C" }}>*</span>
          </legend>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PROFILES.map((p) => (
              <label
                key={p.value}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <input
                  type="radio"
                  name="profile"
                  value={p.value}
                  checked={profile === p.value}
                  onChange={() => setProfile(p.value)}
                  required
                />
                {p.label}
              </label>
            ))}
          </div>
        </fieldset>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>
            Quelle est aujourd’hui ta principale difficulté administrative ?{" "}
            <span className="paipers-text-muted" style={{ fontWeight: 500 }}>
              (facultatif)
            </span>
          </span>
          <textarea
            name="challenge"
            rows={3}
            value={challenge}
            onChange={(e) => setChallenge(e.target.value)}
            style={{ ...inputStyle, resize: "vertical", minHeight: 88 }}
          />
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            fontSize: 13,
            lineHeight: 1.45,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <span>J’accepte de recevoir les actualités de Paipers.</span>
        </label>

        {status === "error" && message ? (
          <p style={{ margin: 0, color: "#B91C1C", fontWeight: 700, fontSize: 14 }}>
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          className="paipers-button"
          disabled={status === "loading"}
          style={{
            width: "100%",
            opacity: status === "loading" ? 0.7 : 1,
            cursor: status === "loading" ? "wait" : "pointer",
            borderRadius: PAIPERS_RADIUS.button,
          }}
        >
          {status === "loading" ? "Envoi…" : "Rejoindre la liste d’attente"}
        </button>

        <p
          className="paipers-text-muted"
          style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}
        >
          Nous utilisons ton adresse email uniquement afin de gérer ton inscription
          à la liste d’attente. Si tu coches la case prévue à cet effet, tu pourras
          également recevoir les actualités de Paipers. Tu pourras te désinscrire à
          tout moment.{" "}
          <Link
            href="/legal/politique-confidentialite"
            style={{ color: DESKTOP_SURFACES.marine, fontWeight: 700 }}
          >
            Politique de confidentialité
          </Link>
          .
        </p>
      </div>
    </form>
  );
}
