"use client";

/**
 * Abonnements — réf. textes hub mobile ; statut réel depuis profiles.subscription_plan.
 * Pas de checkout web / pas de setTestSubscriptionPlan trompeur.
 */

import { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import ProfilSubpageHeader from "@/components/profil/ProfilSubpageHeader";
import { supabase } from "@/lib/supabase";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

type Plan = "free" | "premium" | "pro" | string;

function planLabel(plan: Plan): string {
  if (plan === "pro") return "Professionnel";
  if (plan === "premium") return "Particulier Premium";
  return "Particulier Gratuit";
}

export default function AbonnementPage() {
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>("free");

  useEffect(() => {
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("subscription_plan,account_type")
        .eq("id", auth.user.id)
        .maybeSingle();
      const raw = (data?.subscription_plan || data?.account_type || "free") as string;
      setPlan(raw === "pro" ? "pro" : raw === "premium" ? "premium" : "free");
      setLoading(false);
    })();
  }, []);

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 720 }}
        >
          <ProfilSubpageHeader
            title="Abonnements"
            subtitle="Choisissez l’offre adaptée à vos besoins"
          />

          {loading ? (
            <p className="paipers-text-muted">Chargement…</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="paipers-elevated-card">
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    color: PAIPERS_COLORS.navy,
                    margin: 0,
                  }}
                >
                  Formule actuelle
                </p>
                <p
                  style={{
                    marginTop: 8,
                    fontSize: 20,
                    fontWeight: 800,
                    marginBottom: 0,
                    color: PAIPERS_COLORS.textPrimary,
                  }}
                >
                  {planLabel(plan)}
                </p>
              </div>

              <div className="paipers-elevated-card">
                <p style={{ fontWeight: 800, margin: "0 0 8px", fontSize: 15 }}>
                  Offres
                </p>
                <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
                  Personnel : 6,99 € / mois · 7 jours d’essai.
                </p>
                <p
                  className="paipers-text-muted"
                  style={{ margin: "8px 0 0", fontSize: 14, lineHeight: "20px" }}
                >
                  Offre Professionnelle : tarif bientôt disponible · 14 jours d’essai au
                  lancement.
                </p>
              </div>

              <div className="paipers-elevated-card">
                <p style={{ fontWeight: 800, margin: "0 0 8px", fontSize: 15 }}>
                  Gestion de l’abonnement
                </p>
                <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
                  Le checkout et le portail client ne sont pas disponibles sur le web pour le
                  moment. Les essais / changements de formule de démonstration existent sur
                  l’app mobile uniquement. Aucun paiement n’est simulé ici.
                </p>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </Protected>
  );
}
