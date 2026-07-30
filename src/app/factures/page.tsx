"use client";

/**
 * Hub Factures Pro — réf. app/(tabs)/factures/index.tsx
 * Segment Factures | Générer ; création non branchée (pas de tables/API web).
 */

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useNavSpace } from "@/components/NavSpaceProvider";
import FacturesGenererSegment, {
  type FacturesGenererSection,
} from "@/components/factures/FacturesGenererSegment";
import ProFacturesHub from "@/components/factures/ProFacturesHub";
import GenererHub from "@/components/generer/GenererHub";
import { loadProAccessSnapshot, type ProAccessSnapshot } from "@/lib/proAccess";
import { E_INVOICE_DISCLAIMER, PAIPERS_NOT_PDP } from "@/lib/eInvoicingCopy";
import { PAIPERS_COLORS, PAIPERS_RADIUS, PAIPERS_SPACE } from "@/lib/paipersTheme";

function FacturesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showProTabs, loaded: spaceLoaded } = useNavSpace();
  const [section, setSection] = useState<FacturesGenererSection>("factures");
  const [access, setAccess] = useState<ProAccessSnapshot | null>(null);
  const [sheet, setSheet] = useState<"facture" | "devis" | null>(null);

  useEffect(() => {
    const s = searchParams.get("section");
    if (s === "generer") setSection("generer");
    if (s === "factures") setSection("factures");
  }, [searchParams]);

  useEffect(() => {
    if (!spaceLoaded) return;
    if (!showProTabs) {
      router.replace("/dashboard");
    }
  }, [spaceLoaded, showProTabs, router]);

  useEffect(() => {
    void loadProAccessSnapshot().then(setAccess);
  }, []);

  if (!spaceLoaded || !showProTabs) {
    return (
      <div
        style={{
          padding: PAIPERS_SPACE.screenPad,
          display: "flex",
          justifyContent: "center",
          paddingTop: 48,
        }}
      >
        <div
          className="assistant-spinner"
          style={{
            width: 28,
            height: 28,
            borderRadius: 999,
            border: `3px solid ${PAIPERS_COLORS.border}`,
            borderTopColor: PAIPERS_COLORS.navy,
            animation: "spin 0.8s linear infinite",
          }}
        />
      </div>
    );
  }

  const accessBanner = (() => {
    if (!access) return null;
    if (access.hasProSubscription) {
      return (
        <div
          className="paipers-elevated-card"
          style={{ marginBottom: 14, padding: 14, fontSize: 13, lineHeight: "18px" }}
        >
          <p style={{ margin: 0, fontWeight: 800, color: PAIPERS_COLORS.textPrimary }}>
            Abonnement Professionnel actif
          </p>
          <p className="paipers-text-muted" style={{ margin: "6px 0 0" }}>
            L’interface Factures est affichée. La création, la liste synchronisée et les PDF
            facture ne sont pas encore portés sur le web (données mobile / tables non branchées
            ici).
          </p>
        </div>
      );
    }
    if (access.activationPending) {
      return (
        <div
          className="paipers-elevated-card"
          style={{ marginBottom: 14, padding: 14, fontSize: 13, lineHeight: "18px" }}
        >
          <p style={{ margin: 0, fontWeight: 800, color: PAIPERS_COLORS.textPrimary }}>
            Activation Professionnel en attente
          </p>
          <p className="paipers-text-muted" style={{ margin: "6px 0 0" }}>
            Le checkout web n’est pas disponible. Cet écran est un aperçu de navigation — aucune
            facture n’est créée ni simulée.
          </p>
        </div>
      );
    }
    return (
      <div
        className="paipers-elevated-card"
        style={{ marginBottom: 14, padding: 14, fontSize: 13, lineHeight: "18px" }}
      >
        <p style={{ margin: 0, fontWeight: 800, color: PAIPERS_COLORS.textPrimary }}>
          Aperçu de l’espace Professionnel
        </p>
        <p className="paipers-text-muted" style={{ margin: "6px 0 0" }}>
          Le basculement d’espace est une préférence d’interface. Votre formule enregistrée n’est
          pas Professionnel. Aucune donnée de facturation n’est inventée ici.
        </p>
      </div>
    );
  })();

  return (
    <>
      <div
        className="pb-24 md:pb-8"
        style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 720 }}
      >
        <div style={{ marginBottom: 12 }}>
          <FacturesGenererSegment value={section} onChange={setSection} />
        </div>

        {section === "factures" ? (
          <>
            {accessBanner}
            <ProFacturesHub onUnavailable={setSheet} />
            <div
              className="paipers-elevated-card"
              style={{ marginTop: 18, padding: 14, fontSize: 12, lineHeight: "17px" }}
            >
              <p style={{ margin: 0, fontWeight: 800, color: PAIPERS_COLORS.textPrimary }}>
                Facturation électronique
              </p>
              <p className="paipers-text-muted" style={{ margin: "6px 0 0" }}>
                {PAIPERS_NOT_PDP} {E_INVOICE_DISCLAIMER}
              </p>
              <p className="paipers-text-muted" style={{ margin: "8px 0 0" }}>
                Aucune connexion à une plateforme partenaire n’est opérationnelle sur le web.
              </p>
            </div>
          </>
        ) : (
          <GenererHub embedded />
        )}
      </div>

      {sheet ? (
        <div
          role="dialog"
          aria-modal
          aria-labelledby="factures-unavailable-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 80,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
          }}
          onClick={() => setSheet(null)}
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
              id="factures-unavailable-title"
              style={{
                margin: 0,
                fontSize: 17,
                fontWeight: 900,
                color: PAIPERS_COLORS.textPrimary,
              }}
            >
              {sheet === "devis" ? "Nouveau devis" : "Nouvelle facture"}
            </p>
            <p className="paipers-text-muted" style={{ margin: 0, fontSize: 14, lineHeight: "20px" }}>
              La création de {sheet === "devis" ? "devis" : "factures"} existe sur l’app mobile
              (ProWorkspace + sync optionnelle). Sur le web, aucune table invoices / formulaire de
              sauvegarde n’est branché. Aucune facture n’est enregistrée ici.
            </p>
            <button
              type="button"
              onClick={() => setSheet(null)}
              style={{
                padding: "14px 16px",
                borderRadius: PAIPERS_RADIUS.button,
                border: "none",
                background: PAIPERS_COLORS.navy,
                color: "#fff",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              Compris
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default function FacturesPage() {
  return (
    <Protected>
      <AppShell>
        <Suspense
          fallback={
            <div
              style={{
                padding: PAIPERS_SPACE.screenPad,
                color: PAIPERS_COLORS.neutral,
                fontSize: 14,
              }}
            >
              Chargement…
            </div>
          }
        >
          <FacturesPageInner />
        </Suspense>
      </AppShell>
    </Protected>
  );
}
