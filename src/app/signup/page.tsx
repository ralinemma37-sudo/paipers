"use client";

/**
 * Page inscription — miroir paipers-mobile/app/(auth)/signup.tsx
 * Phases : plan → account → (pro) info activation → /onboarding
 * Pas de faux checkout / pas d’activation Pro sans abonnement web.
 */

import { FormEvent, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthFormCard from "@/components/auth/AuthFormCard";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import SignupPlanPicker from "@/components/auth/SignupPlanPicker";
import { authErrorMessageFr } from "@/lib/authErrorMessageFr";
import { passwordMeetsSignupRequirements } from "@/lib/passwordStrength";
import { NAV_SCOPE_STORAGE_KEY } from "@/lib/navConfig";
import {
  SIGNUP_SPACE_CARDS,
  accountTypeForSpace,
  signupOfferSummary,
  signupSpaceAccent,
  spaceRequiresPayment,
  subscriptionPlanForSpace,
  type OnboardingSpaceChoice,
} from "@/lib/signup/signupSpaceContent";
import {
  PAIPERS_COLORS,
  PAIPERS_PALETTES,
  PAIPERS_RADIUS,
} from "@/lib/paipersTheme";
import { supabase } from "@/lib/supabase";

type SignupPhase = "plan" | "account" | "payment";

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

export default function SignupPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<SignupPhase>("plan");
  const [spaceChoice, setSpaceChoice] =
    useState<OnboardingSpaceChoice>("personal");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const offerSummary = useMemo(
    () => signupOfferSummary(spaceChoice),
    [spaceChoice],
  );
  const offerAccent = useMemo(
    () => signupSpaceAccent(spaceChoice),
    [spaceChoice],
  );
  const card = SIGNUP_SPACE_CARDS[spaceChoice];

  const passwordsMatch =
    password === passwordConfirm && passwordConfirm.length > 0;
  const passwordOk = passwordMeetsSignupRequirements(password);
  const canSubmit =
    email.trim().length > 0 &&
    passwordOk &&
    passwordsMatch &&
    acceptPrivacy &&
    acceptTerms &&
    !loading;

  const title =
    phase === "plan"
      ? "Bienvenue sur Paipers"
      : phase === "account"
        ? "Créez votre espace Paipers"
        : undefined;

  const subtitle =
    phase === "plan"
      ? "Choisissez votre espace. Vous pourrez en ajouter d'autres plus tard."
      : undefined;

  /** Nav UI : Personnel tant que le checkout Pro web n’existe pas. */
  const persistNavSpacePersonal = () => {
    try {
      localStorage.setItem(NAV_SCOPE_STORAGE_KEY, "personal");
    } catch {
      // ignore
    }
  };

  const goToOnboarding = () => {
    persistNavSpacePersonal();
    router.replace("/onboarding");
  };

  const handleSignup = async (e?: FormEvent) => {
    e?.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!email.trim()) {
      setErrorMsg("Indique une adresse email.");
      return;
    }
    if (!passwordOk) {
      setErrorMsg(
        "Choisis un mot de passe plus solide (toutes les cases doivent être cochées).",
      );
      return;
    }
    if (!passwordsMatch) {
      setErrorMsg("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (!acceptTerms) {
      setErrorMsg(
        "Tu dois accepter les conditions générales d'utilisation pour créer un compte.",
      );
      return;
    }
    if (!acceptPrivacy) {
      setErrorMsg(
        "Tu dois accepter la politique de confidentialité pour créer un compte.",
      );
      return;
    }

    setLoading(true);

    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    /**
     * Metadata : conserve le choix d’espace (comme le mobile).
     * Profil : n’active pas un abonnement Pro payant tant que le checkout web
     * n’existe pas — on enregistre free / personal (pas de faux Pro).
     */
    const intendedAccountType = accountTypeForSpace(spaceChoice);
    const intendedPlan = subscriptionPlanForSpace(spaceChoice);
    const profileAccountType = spaceRequiresPayment(spaceChoice)
      ? "personal"
      : intendedAccountType;
    const profilePlan = spaceRequiresPayment(spaceChoice) ? "free" : intendedPlan;

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${origin}/login`,
        data: {
          account_type: intendedAccountType,
          space_choice: spaceChoice,
          subscription_plan: intendedPlan,
          // Indicateur web : Pro choisi mais pas encore activé via checkout
          pro_activation_pending: spaceRequiresPayment(spaceChoice) || undefined,
        },
      },
    });

    setLoading(false);

    if (error) {
      setErrorMsg(authErrorMessageFr(error));
      return;
    }

    if (data.user?.id && data.session) {
      const { error: profileErr } = await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          email: email.trim(),
          account_type: profileAccountType,
          subscription_plan: profilePlan,
        },
        { onConflict: "id" },
      );
      if (profileErr) {
        console.warn("signup profile upsert:", profileErr.message);
      }

      if (spaceRequiresPayment(spaceChoice)) {
        setPhase("payment");
        setSuccessMsg("Compte créé.");
        return;
      }

      goToOnboarding();
      return;
    }

    if (data.user?.id && !data.session) {
      setSuccessMsg(
        "Compte créé. Ouvrez le lien de confirmation reçu par email, puis connectez-vous pour lancer le tutoriel.",
      );
    }
  };

  return (
    <AuthFormCard title={title} subtitle={subtitle}>
      {phase === "plan" ? (
        <>
          <SignupPlanPicker value={spaceChoice} onChange={setSpaceChoice} />
          <button
            type="button"
            className="paipers-button w-full"
            onClick={() => {
              setErrorMsg("");
              setSuccessMsg("");
              setPhase("account");
            }}
          >
            Continuer
          </button>
          <p
            style={{
              fontSize: 12,
              lineHeight: "18px",
              color: PAIPERS_PALETTES.light.textMuted,
              textAlign: "center",
              margin: 0,
            }}
          >
            Sans engagement.
          </p>
        </>
      ) : null}

      {phase === "payment" ? (
        <div className="flex flex-col" style={{ gap: 16 }}>
          <button
            type="button"
            onClick={() => {
              setSuccessMsg("");
              setPhase("account");
            }}
            style={{
              alignSelf: "flex-start",
              fontWeight: 700,
              color: PAIPERS_PALETTES.light.textMuted,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            ← Retour
          </button>

          <div>
            <p
              style={{
                fontSize: 22,
                fontWeight: 900,
                color: PAIPERS_COLORS.textPrimary,
                margin: 0,
              }}
            >
              {card.title}
            </p>
            <p
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: PAIPERS_COLORS.textPrimary,
                margin: "6px 0 0",
              }}
            >
              {card.badge}
            </p>
            {card.trialLine ? (
              <p
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: PAIPERS_PALETTES.light.textMuted,
                  margin: "6px 0 0",
                }}
              >
                {card.trialLine}
              </p>
            ) : null}
          </div>

          <p
            style={{
              fontSize: 15,
              lineHeight: "22px",
              color: PAIPERS_PALETTES.light.textMuted,
              margin: 0,
            }}
          >
            {`${card.priceLine} — sans engagement.`}
          </p>

          <div
            style={{
              padding: 16,
              borderRadius: PAIPERS_RADIUS.card,
              background: PAIPERS_PALETTES.light.muted,
              border: `1px solid ${PAIPERS_COLORS.border}`,
            }}
          >
            <p
              style={{
                fontSize: 14,
                lineHeight: "20px",
                color: PAIPERS_PALETTES.light.textMuted,
                margin: 0,
              }}
            >
              {card.description}
            </p>
          </div>

          {successMsg ? (
            <p style={{ color: "#15803D", fontSize: 14, fontWeight: 600, margin: 0 }}>
              {successMsg}
            </p>
          ) : null}

          <div
            className="paipers-elevated-card"
            style={{ borderColor: PAIPERS_COLORS.warning }}
            role="status"
          >
            <p style={{ fontWeight: 800, margin: "0 0 6px", color: PAIPERS_COLORS.textPrimary }}>
              Activation Professionnel en attente
            </p>
            <p className="paipers-text-muted" style={{ fontSize: 14, margin: 0, lineHeight: "20px" }}>
              L’offre Professionnel a bien été sélectionnée. L’activation
              définitive (essai / abonnement) interviendra lors de la mise en
              place du parcours d’abonnement sur le web. Aucun paiement n’est
              demandé pour le moment.
            </p>
          </div>

          <button
            type="button"
            className="paipers-button w-full"
            onClick={goToOnboarding}
          >
            Continuer
          </button>

          <p
            style={{
              fontSize: 12,
              lineHeight: "18px",
              color: PAIPERS_PALETTES.light.textMuted,
              textAlign: "center",
              margin: 0,
            }}
          >
            Sans engagement.
          </p>
        </div>
      ) : null}

      {phase === "account" ? (
        <form
          onSubmit={(e) => void handleSignup(e)}
          className="flex flex-col"
          style={{ gap: 12 }}
        >
          <button
            type="button"
            onClick={() => setPhase("plan")}
            style={{
              alignSelf: "flex-start",
              fontWeight: 700,
              color: PAIPERS_PALETTES.light.textMuted,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              marginBottom: 8,
            }}
          >
            ← Modifier l&apos;offre
          </button>

          <div
            style={{
              padding: 14,
              borderRadius: PAIPERS_RADIUS.card,
              background: offerAccent.badgeBg,
              border: `2px solid ${offerAccent.border}`,
              marginBottom: 4,
            }}
          >
            <p
              style={{
                fontSize: 13,
                color: PAIPERS_PALETTES.light.textMuted,
                margin: 0,
              }}
            >
              Offre sélectionnée :{" "}
              <span style={{ fontWeight: 800, color: offerAccent.badgeText }}>
                {offerSummary.label}
              </span>
            </p>
            <p
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: offerAccent.badgeText,
                margin: "4px 0 0",
              }}
            >
              {offerSummary.price}
            </p>
          </div>

          <div>
            <label htmlFor="signup-email" className="sr-only">
              Adresse email
            </label>
            <input
              id="signup-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="sr-only">
              Mot de passe
            </label>
            <input
              id="signup-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label htmlFor="signup-password-confirm" className="sr-only">
              Confirmer le mot de passe
            </label>
            <input
              id="signup-password-confirm"
              type="password"
              name="passwordConfirm"
              autoComplete="new-password"
              placeholder="Confirmer le mot de passe"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              style={inputStyle}
              required
            />
          </div>

          {password.length > 0 ? (
            <PasswordStrengthMeter password={password} />
          ) : null}

          {passwordConfirm.length > 0 && !passwordsMatch ? (
            <p style={{ color: "#B91C1C", fontSize: 13, margin: 0 }}>
              Les mots de passe ne sont pas identiques.
            </p>
          ) : null}

          <label
            className="flex items-start"
            style={{ gap: 12, marginTop: 6, cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="sr-only"
            />
            <span
              aria-hidden
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                border: `2px solid ${acceptTerms ? PAIPERS_PALETTES.light.primary : PAIPERS_COLORS.border}`,
                background: acceptTerms
                  ? PAIPERS_PALETTES.light.primary
                  : PAIPERS_PALETTES.light.background,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 13,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {acceptTerms ? "✓" : ""}
            </span>
            <span
              style={{
                fontSize: 14,
                lineHeight: "21px",
                color: PAIPERS_PALETTES.light.textMuted,
              }}
            >
              J&apos;accepte les{" "}
              <Link
                href="/legal/cgu"
                style={{
                  fontWeight: 800,
                  color: PAIPERS_COLORS.textPrimary,
                  textDecoration: "underline",
                }}
              >
                conditions générales d&apos;utilisation
              </Link>
              .
            </span>
          </label>

          <label
            className="flex items-start"
            style={{ gap: 12, marginTop: 10, cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={acceptPrivacy}
              onChange={(e) => setAcceptPrivacy(e.target.checked)}
              className="sr-only"
            />
            <span
              aria-hidden
              style={{
                width: 24,
                height: 24,
                borderRadius: 8,
                border: `2px solid ${acceptPrivacy ? PAIPERS_PALETTES.light.primary : PAIPERS_COLORS.border}`,
                background: acceptPrivacy
                  ? PAIPERS_PALETTES.light.primary
                  : PAIPERS_PALETTES.light.background,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: 13,
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {acceptPrivacy ? "✓" : ""}
            </span>
            <span
              style={{
                fontSize: 14,
                lineHeight: "21px",
                color: PAIPERS_PALETTES.light.textMuted,
              }}
            >
              J&apos;accepte la{" "}
              <Link
                href="/legal/politique-confidentialite"
                style={{
                  fontWeight: 800,
                  color: PAIPERS_COLORS.textPrimary,
                  textDecoration: "underline",
                }}
              >
                politique de confidentialité
              </Link>
              .
            </span>
          </label>

          <p
            style={{
              fontSize: 13,
              lineHeight: "19px",
              color: PAIPERS_PALETTES.light.textMuted,
              margin: 0,
            }}
          >
            Vos données restent privées. Paipers ne lit vos documents que pour
            vous aider à les classer et les retrouver.
          </p>

          {errorMsg ? (
            <p role="alert" style={{ color: "#B91C1C", fontSize: 14, margin: 0 }}>
              {errorMsg}
            </p>
          ) : null}
          {successMsg ? (
            <p
              role="status"
              style={{ color: "#15803D", fontSize: 14, fontWeight: 600, margin: 0 }}
            >
              {successMsg}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            className="paipers-button w-full"
            style={{
              marginTop: 4,
              opacity: loading || !canSubmit ? 0.45 : 1,
            }}
          >
            {loading ? "Création…" : "Créer mon compte"}
          </button>
        </form>
      ) : null}

      {phase !== "payment" ? (
        <p
          style={{
            textAlign: "center",
            color: PAIPERS_PALETTES.light.textMuted,
            fontSize: 15,
            margin: "8px 0 0",
          }}
        >
          Déjà un compte ?{" "}
          <Link
            href="/login"
            style={{
              fontWeight: 800,
              color: PAIPERS_COLORS.textPrimary,
              textDecoration: "none",
            }}
          >
            Se connecter
          </Link>
        </p>
      ) : null}
    </AuthFormCard>
  );
}
