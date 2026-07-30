"use client";

/**
 * Onboarding web — structure minimale fidèle au mobile.
 * Réf. : paipers-mobile/app/onboarding.tsx
 *        paipers-mobile/src/features/onboarding/OnboardingNavigator.tsx
 * Étapes : 1 SpaceInfo → 2 ConnectSources → 3 Notifications → 4 Ready
 *
 * Parties non encore fonctionnelles (signalées dans l’UI) :
 * - OAuth mail depuis l’onboarding (renvoi vers /profil/emails)
 * - Notifications push natives (API navigateur optionnelle uniquement)
 * - applyOnboardingFromDraft / workspaces Pro complets
 */

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2 } from "lucide-react";
import AuthFormCard from "@/components/auth/AuthFormCard";
import type { OnboardingSpaceChoice } from "@/lib/signup/signupSpaceContent";
import {
  PAIPERS_COLORS,
  PAIPERS_PALETTES,
  PAIPERS_RADIUS,
} from "@/lib/paipersTheme";
import { supabase } from "@/lib/supabase";

const TOTAL_STEPS = 4;
const ONBOARDING_DONE_KEY = "paipers-onboarding-done";

type Draft = {
  spaceChoice: OnboardingSpaceChoice;
  firstName: string;
  lastName: string;
  personalAddress: string;
  email: string;
  phone: string;
  birthdate: string;
  companyName: string;
  siret: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  notificationsChoice?: "enabled" | "later";
  skippedSources?: boolean;
};

function readyContent(space: OnboardingSpaceChoice) {
  if (space === "professional") {
    return {
      title: "Votre espace est prêt",
      lead: "Votre espace professionnel est prêt.",
      bullets: [
        "Créer une facture",
        "Importer des factures fournisseurs",
        "Suivre votre trésorerie",
        "Préparer votre comptabilité",
        "Utiliser l'assistant IA",
      ],
      pendingNote:
        "L’activation définitive de l’offre Professionnel interviendra avec le parcours d’abonnement web.",
    };
  }
  return {
    title: "Votre espace est prêt",
    lead: "Votre espace personnel est prêt.",
    bullets: [
      "Retrouver un document",
      "Recevoir des alertes",
      "Importer des documents",
      "Générer un courrier",
    ],
    pendingNote: null as string | null,
  };
}

function canContinueSpaceInfo(space: OnboardingSpaceChoice, d: Draft): boolean {
  if (space === "personal") {
    return Boolean(d.firstName.trim() && d.lastName.trim() && d.email.trim());
  }
  return Boolean(d.companyName.trim() && d.companyEmail.trim());
}

const fieldStyle: CSSProperties = {
  width: "100%",
  background: PAIPERS_PALETTES.light.muted,
  border: `1px solid ${PAIPERS_COLORS.border}`,
  borderRadius: 14,
  padding: 14,
  fontSize: 16,
  color: PAIPERS_COLORS.textPrimary,
  outline: "none",
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState("");
  const [proPending, setProPending] = useState(false);
  const [draft, setDraft] = useState<Draft>({
    spaceChoice: "personal",
    firstName: "",
    lastName: "",
    personalAddress: "",
    email: "",
    phone: "",
    birthdate: "",
    companyName: "",
    siret: "",
    companyAddress: "",
    companyEmail: "",
    companyPhone: "",
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (!session?.user) {
        router.replace("/login?next=/onboarding");
        return;
      }
      if (!mounted) return;

      const meta = session.user.user_metadata ?? {};
      const space: OnboardingSpaceChoice =
        meta.space_choice === "professional" ? "professional" : "personal";
      const email = session.user.email ?? "";

      setUserId(session.user.id);
      setProPending(Boolean(meta.pro_activation_pending) || space === "professional");
      setDraft((d) => ({
        ...d,
        spaceChoice: space,
        email,
        companyEmail: space === "professional" ? email : d.companyEmail,
      }));
      setReady(true);
    })();
    return () => {
      mounted = false;
    };
  }, [router]);

  const space = draft.spaceChoice;
  const content = useMemo(() => readyContent(space), [space]);

  const patch = useCallback((p: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...p }));
  }, []);

  const finish = async () => {
    if (!userId) return;

    const fullName = [draft.firstName, draft.lastName]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");

    if (fullName || draft.phone) {
      const { error } = await supabase.from("profiles").upsert(
        {
          id: userId,
          email: draft.email.trim() || undefined,
          full_name: fullName || undefined,
          phone: draft.phone.trim() || undefined,
        },
        { onConflict: "id" },
      );
      if (error) console.warn("onboarding profile:", error.message);
    }

    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, userId);
    } catch {
      // ignore
    }

    router.replace("/dashboard");
  };

  const skipAll = async () => {
    try {
      localStorage.setItem(ONBOARDING_DONE_KEY, userId);
    } catch {
      // ignore
    }
    router.replace("/dashboard");
  };

  if (!ready) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ color: PAIPERS_PALETTES.light.textMuted }}
      >
        Chargement…
      </div>
    );
  }

  const title =
    step === 1
      ? space === "professional"
        ? "Votre entreprise"
        : "Vos informations"
      : step === 2
        ? "Connectez vos sources"
        : step === 3
          ? "Activez les rappels importants"
          : content.title;

  const subtitle =
    step === 2
      ? "Pour que Paipers retrouve automatiquement vos documents, connectez les services que vous utilisez déjà."
      : step === 3
        ? "Paipers peut vous prévenir avant une échéance, un renouvellement, un paiement ou une démarche importante."
        : undefined;

  return (
    <AuthFormCard title={title} subtitle={subtitle}>
      <p
        className="paipers-text-muted"
        style={{ fontSize: 13, margin: "-8px 0 0", textAlign: "center" }}
      >
        Étape {step} / {TOTAL_STEPS}
      </p>

      {step === 1 ? (
        <div className="flex flex-col" style={{ gap: 12 }}>
          {space === "personal" ? (
            <>
              <LabeledInput
                label="Prénom"
                value={draft.firstName}
                onChange={(firstName) => patch({ firstName })}
                placeholder="Marie"
                required
              />
              <LabeledInput
                label="Nom"
                value={draft.lastName}
                onChange={(lastName) => patch({ lastName })}
                placeholder="Dupont"
                required
              />
              <LabeledInput
                label="Adresse"
                value={draft.personalAddress}
                onChange={(personalAddress) => patch({ personalAddress })}
                placeholder="12 rue de la Paix, 75002 Paris"
                optional
              />
              <LabeledInput
                label="Email"
                value={draft.email}
                onChange={(email) => patch({ email })}
                placeholder="vous@exemple.fr"
                type="email"
                required
              />
              <LabeledInput
                label="Téléphone"
                value={draft.phone}
                onChange={(phone) => patch({ phone })}
                placeholder="06 12 34 56 78"
                optional
              />
              <LabeledInput
                label="Date de naissance"
                value={draft.birthdate}
                onChange={(birthdate) => patch({ birthdate })}
                placeholder="JJ/MM/AAAA"
                optional
              />
              <Hint>
                Ces informations permettront à Paipers de préremplir vos
                documents, courriers et démarches administratives.
              </Hint>
            </>
          ) : (
            <>
              <LabeledInput
                label="Nom de l'entreprise"
                value={draft.companyName}
                onChange={(companyName) => patch({ companyName })}
                placeholder="Mon entreprise"
                required
              />
              <LabeledInput
                label="SIRET"
                value={draft.siret}
                onChange={(siret) => patch({ siret })}
                placeholder="123 456 789 00012"
                optional
              />
              <LabeledInput
                label="Adresse de l'entreprise"
                value={draft.companyAddress}
                onChange={(companyAddress) => patch({ companyAddress })}
                placeholder="Adresse du siège"
                optional
              />
              <LabeledInput
                label="Email professionnel"
                value={draft.companyEmail}
                onChange={(companyEmail) => patch({ companyEmail })}
                placeholder="contact@entreprise.fr"
                type="email"
                required
              />
              <LabeledInput
                label="Téléphone"
                value={draft.companyPhone}
                onChange={(companyPhone) => patch({ companyPhone })}
                placeholder="01 23 45 67 89"
                optional
              />
              <Hint>
                Ces informations permettront à Paipers de préparer vos
                documents, factures et dossiers administratifs. TVA, activité et
                objectifs pourront être complétés plus tard dans les paramètres
                professionnels.
              </Hint>
              {proPending ? (
                <Hint>
                  L’activation définitive de l’offre Professionnel interviendra
                  lors de la mise en place du parcours d’abonnement web.
                </Hint>
              ) : null}
            </>
          )}

          <button
            type="button"
            className="paipers-button w-full"
            disabled={!canContinueSpaceInfo(space, draft)}
            style={{
              opacity: canContinueSpaceInfo(space, draft) ? 1 : 0.45,
            }}
            onClick={() => setStep(2)}
          >
            Continuer
          </button>
          <button type="button" className="text-center" style={linkBtn} onClick={() => void skipAll()}>
            Passer
          </button>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-col" style={{ gap: 12 }}>
          {[
            { id: "gmail", label: "Gmail", subtitle: "Importer les pièces jointes" },
            { id: "outlook", label: "Outlook", subtitle: "Bientôt sur le web" },
          ].map((p) => (
            <div
              key={p.id}
              style={{
                padding: 14,
                borderRadius: PAIPERS_RADIUS.card,
                border: `1px solid ${PAIPERS_COLORS.border}`,
                background: PAIPERS_PALETTES.light.card,
              }}
            >
              <p style={{ fontWeight: 800, fontSize: 15, margin: 0 }}>
                {p.label}
              </p>
              <p className="paipers-text-muted" style={{ fontSize: 12, margin: "2px 0 0" }}>
                {p.subtitle}
              </p>
              {p.id === "gmail" ? (
                <Link
                  href="/profil/emails"
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    fontSize: 12,
                    fontWeight: 800,
                    color: PAIPERS_COLORS.navy,
                  }}
                >
                  Configurer dans Profil › Emails
                </Link>
              ) : null}
            </div>
          ))}
          <Hint>
            Paipers sera plus utile avec au moins une boîte mail connectée, mais
            vous pouvez continuer sans rien connecter pour l&apos;instant.
          </Hint>
          <p className="paipers-text-muted" style={{ fontSize: 12, margin: 0 }}>
            Connexion OAuth depuis l’onboarding : non encore portée (écart
            mobile).
          </p>
          <button
            type="button"
            className="paipers-button w-full"
            onClick={() => setStep(3)}
          >
            Continuer
          </button>
          <button
            type="button"
            style={linkBtn}
            onClick={() => {
              patch({ skippedSources: true });
              setStep(3);
            }}
          >
            Je le ferai plus tard
          </button>
          <button type="button" style={linkBtn} onClick={() => setStep(1)}>
            ← Retour
          </button>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="flex flex-col" style={{ gap: 16 }}>
          <div
            style={{
              alignSelf: "center",
              width: 80,
              height: 80,
              borderRadius: 24,
              background: PAIPERS_PALETTES.light.muted,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Bell size={36} color={PAIPERS_PALETTES.light.primary} />
          </div>
          <p className="paipers-text-muted" style={{ fontSize: 13, textAlign: "center", margin: 0 }}>
            Vous pourrez modifier ce choix à tout moment dans les paramètres.
          </p>
          <button
            type="button"
            className="paipers-button w-full"
            onClick={async () => {
              try {
                if (typeof Notification !== "undefined") {
                  await Notification.requestPermission();
                  patch({
                    notificationsChoice:
                      Notification.permission === "granted" ? "enabled" : "later",
                  });
                } else {
                  patch({ notificationsChoice: "later" });
                }
              } catch {
                patch({ notificationsChoice: "later" });
              }
              setStep(4);
            }}
          >
            Activer les notifications
          </button>
          <button
            type="button"
            style={linkBtn}
            onClick={() => {
              patch({ notificationsChoice: "later" });
              setStep(4);
            }}
          >
            Plus tard
          </button>
          <button type="button" style={linkBtn} onClick={() => setStep(2)}>
            ← Retour
          </button>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="flex flex-col" style={{ gap: 18 }}>
          <div
            style={{
              alignSelf: "center",
              width: 80,
              height: 80,
              borderRadius: 24,
              background: "hsl(142 45% 96%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle2 size={40} color="#15803d" />
          </div>
          <p
            style={{
              fontSize: 17,
              lineHeight: "26px",
              fontWeight: 700,
              textAlign: "center",
              margin: 0,
            }}
          >
            {content.lead}
          </p>
          {content.pendingNote ? (
            <Hint>{content.pendingNote}</Hint>
          ) : null}
          <p style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
            Vous pouvez maintenant :
          </p>
          <ul className="list-none p-0 m-0" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {content.bullets.map((b) => (
              <li
                key={b}
                className="paipers-text-muted"
                style={{ fontSize: 15, lineHeight: "22px" }}
              >
                · {b}
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="paipers-button w-full"
            onClick={() => void finish()}
          >
            Accéder à Paipers
          </button>
        </div>
      ) : null}
    </AuthFormCard>
  );
}

const linkBtn: CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: PAIPERS_PALETTES.light.textMuted,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 8,
};

function Hint({ children }: { children: ReactNode }) {
  return (
    <p
      className="paipers-text-muted"
      style={{ fontSize: 13, lineHeight: "19px", margin: 0 }}
    >
      {children}
    </p>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  optional,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  required?: boolean;
  optional?: boolean;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 700,
          marginBottom: 6,
          color: PAIPERS_COLORS.textPrimary,
        }}
      >
        {label}
        {optional ? (
          <span className="paipers-text-muted" style={{ fontWeight: 500 }}>
            {" "}
            (optionnel)
          </span>
        ) : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        style={fieldStyle}
        autoComplete="off"
      />
    </div>
  );
}
