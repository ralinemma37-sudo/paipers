"use client";

/**
 * Mails — réf. AddMailboxScreen / emails.tsx (prioritaires Gmail + Outlook branchés).
 */

import Link from "next/link";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import ProfilSubpageHeader from "@/components/profil/ProfilSubpageHeader";
import { useNavSpace } from "@/components/NavSpaceProvider";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

export default function EmailsPage() {
  const { showProTabs, spaceLabel } = useNavSpace();

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 720 }}
        >
          <ProfilSubpageHeader
            title="Mails"
            subtitle={
              showProTabs
                ? `Boîtes connectées pour l’espace ${spaceLabel}. Ajoutez d’autres fournisseurs ci-dessous.`
                : `Paipers analyse vos emails administratifs. Choisissez un fournisseur pour l’espace ${spaceLabel}.`
            }
          />

          <p
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: PAIPERS_COLORS.textPrimary,
              marginBottom: 10,
            }}
          >
            Fournisseurs prioritaires
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
            <Link
              href="/profil/gmail"
              className="paipers-elevated-card"
              style={{
                display: "block",
                padding: 16,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <p style={{ fontWeight: 800, margin: 0, fontSize: 15 }}>Gmail</p>
              <p className="paipers-text-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                Connecter ou gérer ton compte Google
              </p>
            </Link>
            <Link
              href="/profil/outlook"
              className="paipers-elevated-card"
              style={{
                display: "block",
                padding: 16,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <p style={{ fontWeight: 800, margin: 0, fontSize: 15 }}>Outlook</p>
              <p className="paipers-text-muted" style={{ margin: "4px 0 0", fontSize: 13 }}>
                Comptes Microsoft personnels et Microsoft 365
              </p>
            </Link>
          </div>

          <p
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: PAIPERS_COLORS.textPrimary,
              marginBottom: 10,
            }}
          >
            Autres fournisseurs
          </p>
          <div className="paipers-elevated-card" style={{ opacity: 0.7 }}>
            <p className="paipers-text-muted" style={{ margin: 0, fontSize: 13, lineHeight: "18px" }}>
              iCloud Mail, Yahoo, Orange, SFR, La Poste, Free/Zimbra et IMAP personnalisé sont
              disponibles sur mobile. Non branchés sur le web pour le moment.
            </p>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
