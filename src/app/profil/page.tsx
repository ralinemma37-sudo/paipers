"use client";

/**
 * Hub Profil — réf. paipers-mobile/app/(tabs)/profil/index.tsx
 */

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Cloud,
  CreditCard,
  LifeBuoy,
  Mail,
  Settings,
  Shield,
  User,
} from "lucide-react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useNavSpace } from "@/components/NavSpaceProvider";
import ProfilIdentityCard from "@/components/profil/ProfilIdentityCard";
import ProfilMenuRow from "@/components/profil/ProfilMenuRow";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_RADIUS, PAIPERS_SPACE } from "@/lib/paipersTheme";

export default function ProfilHomePage() {
  const router = useRouter();
  const { showProTabs, spaceLabel, loaded: spaceLoaded } = useNavSpace();

  const [displayName, setDisplayName] = useState("Mon compte");
  const [email, setEmail] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return;
    setEmail(auth.user.email || "");

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name,first_name,last_name")
      .eq("id", auth.user.id)
      .maybeSingle();

    const full = (profile?.full_name || "").trim();
    const composed = `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim();
    setDisplayName(full || composed || "Mon compte");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    setLoggingOut(false);
    setLogoutOpen(false);
    router.replace("/login");
  };

  const isPro = showProTabs;

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 720 }}
        >
          <h1 className="paipers-screen-title" style={{ marginBottom: 6 }}>
            Mon profil
          </h1>
          {spaceLoaded ? (
            <p
              className="paipers-text-muted"
              style={{ marginBottom: 18, fontSize: 14, fontWeight: 600 }}
            >
              Espace {spaceLabel}
            </p>
          ) : null}

          <ProfilIdentityCard
            name={displayName}
            email={email}
            badge={isPro ? "Professionnel" : "Personnel"}
            href="/profil/informations"
          />

          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: PAIPERS_COLORS.textPrimary,
              marginBottom: 12,
            }}
          >
            Réglages & compte
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <ProfilMenuRow
              href="/profil/informations"
              title={isPro ? "Mon entreprise" : "Informations"}
              desc={
                isPro
                  ? "Raison sociale, SIRET, TVA et adresse professionnelle."
                  : "Tes infos personnelles et préférences."
              }
              Icon={isPro ? Building2 : User}
            />
            <ProfilMenuRow
              href="/profil/emails"
              title="Mails"
              desc={
                isPro
                  ? "Connecte ta boîte mail professionnelle (séparée du particulier)."
                  : "Connecte ta boîte mail personnelle."
              }
              Icon={Mail}
            />
            <ProfilMenuRow
              href="/profil/cloud"
              title="Cloud"
              desc="Stockage et synchronisation."
              Icon={Cloud}
            />
            <ProfilMenuRow
              href="/profil/abonnement"
              title="Abonnements"
              desc="Comparer les offres et tester en mode démo."
              Icon={CreditCard}
            />
            <ProfilMenuRow
              href="/profil/parametres"
              title="Paramètres"
              desc="Réglages de l’application."
              Icon={Settings}
            />
            <ProfilMenuRow
              href="/profil/legal"
              title="Confidentialité & légal"
              desc="Politique, CGU, assistant IA, espaces, Gmail."
              Icon={Shield}
            />
            <ProfilMenuRow
              href="/profil/support"
              title="Aide & assistance"
              desc={
                isPro
                  ? "Questions fréquentes et contact pour votre activité."
                  : "Questions fréquentes et contact Paipers."
              }
              Icon={LifeBuoy}
            />
          </div>

          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            style={{
              marginTop: 20,
              width: "100%",
              padding: "14px 18px",
              borderRadius: PAIPERS_RADIUS.button,
              border: "none",
              background: "#fee2e2",
              fontWeight: 800,
              fontSize: 16,
              color: "#991b1b",
              cursor: "pointer",
            }}
          >
            Se déconnecter
          </button>

          {logoutOpen ? (
            <div
              role="dialog"
              aria-modal
              aria-labelledby="logout-title"
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 80,
                background: "rgba(15,23,42,0.45)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
              onClick={() => !loggingOut && setLogoutOpen(false)}
            >
              <div
                className="paipers-elevated-card"
                style={{
                  width: "100%",
                  maxWidth: 440,
                  margin: 16,
                  borderRadius: 24,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <p
                  id="logout-title"
                  style={{
                    fontSize: 17,
                    fontWeight: 900,
                    color: PAIPERS_COLORS.textPrimary,
                    margin: 0,
                  }}
                >
                  Se déconnecter ?
                </p>
                <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
                  Tu devras te reconnecter pour accéder à tes documents et à tes espaces.
                </p>
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={() => void handleLogout()}
                  style={{
                    padding: "14px 16px",
                    borderRadius: PAIPERS_RADIUS.button,
                    border: "none",
                    background: "#B91C1C",
                    color: "#fff",
                    fontWeight: 800,
                    cursor: loggingOut ? "wait" : "pointer",
                  }}
                >
                  {loggingOut ? "…" : "Se déconnecter"}
                </button>
                <button
                  type="button"
                  disabled={loggingOut}
                  onClick={() => setLogoutOpen(false)}
                  style={{
                    padding: "14px 16px",
                    borderRadius: PAIPERS_RADIUS.button,
                    border: `1px solid ${PAIPERS_COLORS.border}`,
                    background: "#fff",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </AppShell>
    </Protected>
  );
}
