"use client";

/**
 * Hub Profil — réf. paipers-mobile/app/(tabs)/profil/index.tsx
 */

import { useCallback, useEffect, useState } from "react";
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
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

export default function ProfilHomePage() {
  const { showProTabs, spaceLabel, loaded: spaceLoaded } = useNavSpace();

  const [displayName, setDisplayName] = useState("Mon compte");
  const [email, setEmail] = useState("");

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

  const isPro = showProTabs;

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad }}
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

          <div className="md:max-w-none">
            <ProfilIdentityCard
              name={displayName}
              email={email}
              badge={isPro ? "Professionnel" : "Personnel"}
              href="/profil/informations"
            />
          </div>

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

          <div className="flex flex-col gap-2.5 md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-4">
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
              desc="Consulter la formule actuelle."
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
        </div>
      </AppShell>
    </Protected>
  );
}
