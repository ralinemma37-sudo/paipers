"use client";

/**
 * Page connexion — miroir paipers-mobile/app/(auth)/login.tsx
 * Supabase signInWithPassword + resetPasswordForEmail conservés.
 * Biométrie non portée (écart web).
 */

import { FormEvent, useEffect, useState, type CSSProperties, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthFormCard from "@/components/auth/AuthFormCard";
import { authErrorMessageFr } from "@/lib/authErrorMessageFr";
import { PAIPERS_ASSETS, PAIPERS_COLORS, PAIPERS_PALETTES } from "@/lib/paipersTheme";
import { supabase } from "@/lib/supabase";

const inputStyle: CSSProperties = {
  width: "100%",
  background: PAIPERS_PALETTES.light.muted,
  border: `1px solid ${PAIPERS_COLORS.border}`,
  borderRadius: 14,
  padding: 14,
  fontSize: 16,
  color: PAIPERS_COLORS.textPrimary,
  outline: "none",
};

function safeInternalRedirect(raw: string | null): string {
  if (!raw) return "/assistant";
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/assistant";
  if (t === "/") return "/assistant";
  return t;
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session) {
        router.replace(safeInternalRedirect(next));
      }
    })();
    return () => {
      mounted = false;
    };
  }, [router, next]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMsg(authErrorMessageFr(error));
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const uid = userData.user?.id;
    try {
      const done = uid ? localStorage.getItem("paipers-onboarding-done") : null;
      if (uid && done !== uid) {
        router.replace("/onboarding");
        return;
      }
    } catch {
      // ignore
    }

    router.replace(safeInternalRedirect(next));
  };

  const handleForgotPassword = async () => {
    setErrorMsg("");
    setInfoMsg("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg(
        "Indique ton adresse e-mail pour recevoir le lien de réinitialisation.",
      );
      return;
    }

    setResettingPassword(true);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
      redirectTo: `${origin}/login`,
    });
    setResettingPassword(false);

    if (error) {
      setErrorMsg(authErrorMessageFr(error));
      return;
    }

    setInfoMsg(
      "Un e-mail de réinitialisation vient de t’être envoyé. Pense à vérifier tes courriers indésirables.",
    );
  };

  return (
    <AuthFormCard
      brand={
        <img
          src={PAIPERS_ASSETS.logoSplashLight}
          alt="Logo Paipers"
          width={88}
          height={88}
          style={{ width: 88, height: 88, objectFit: "contain" }}
        />
      }
    >
      <form onSubmit={handleLogin} className="flex flex-col" style={{ gap: 12 }}>
        <div>
          <label htmlFor="login-email" className="sr-only">
            Adresse email
          </label>
          <input
            id="login-email"
            type="email"
            name="email"
            autoComplete="email"
            autoCapitalize="none"
            placeholder="Adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label htmlFor="login-password" className="sr-only">
            Mot de passe
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div className="flex justify-end" style={{ marginTop: -4 }}>
          <button
            type="button"
            onClick={() => void handleForgotPassword()}
            disabled={resettingPassword}
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: PAIPERS_PALETTES.light.textMuted,
              background: "none",
              border: "none",
              cursor: resettingPassword ? "wait" : "pointer",
              padding: "4px 0",
            }}
          >
            {resettingPassword ? "Envoi en cours…" : "Mot de passe oublié ?"}
          </button>
        </div>

        {errorMsg ? (
          <p
            role="alert"
            style={{
              color: "#B91C1C",
              fontSize: 14,
              textAlign: "center",
              margin: 0,
            }}
          >
            {errorMsg}
          </p>
        ) : null}

        {infoMsg ? (
          <p
            role="status"
            style={{
              color: "#15803d",
              fontSize: 14,
              textAlign: "center",
              lineHeight: "20px",
              margin: 0,
            }}
          >
            {infoMsg}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="paipers-button w-full"
          style={{ marginTop: 4, opacity: loading ? 0.45 : 1 }}
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>

      <p
        style={{
          textAlign: "center",
          color: PAIPERS_PALETTES.light.textMuted,
          fontSize: 15,
          margin: "8px 0 0",
        }}
      >
        Pas de compte ?{" "}
        <Link
          href="/signup"
          style={{
            fontWeight: 800,
            color: PAIPERS_COLORS.textPrimary,
            textDecoration: "none",
          }}
        >
          S’inscrire
        </Link>
      </p>
    </AuthFormCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ color: PAIPERS_PALETTES.light.textMuted }}
        >
          Chargement…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
