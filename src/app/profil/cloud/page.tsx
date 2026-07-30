"use client";

/**
 * Cloud — réf. paipers-mobile/app/(tabs)/profil/cloud.tsx
 */

import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import ProfilSubpageHeader from "@/components/profil/ProfilSubpageHeader";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

const PROVIDERS = [
  {
    title: "Supabase Storage",
    desc: "Stockage principal de Paipers.",
    status: "Actif",
    statusColor: "#15803d",
    disabled: false,
  },
  {
    title: "Google Drive",
    desc: "Synchronisez vos fichiers Google.",
    status: "Bientôt",
    disabled: true,
  },
  {
    title: "Dropbox",
    desc: "Reliez votre espace Dropbox.",
    status: "Bientôt",
    disabled: true,
  },
  {
    title: "OneDrive",
    desc: "Microsoft OneDrive et SharePoint.",
    status: "Bientôt",
    disabled: true,
  },
  {
    title: "iCloud Drive",
    desc: "Documents sur votre iCloud.",
    status: "Bientôt",
    disabled: true,
  },
] as const;

export default function CloudPage() {
  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad, maxWidth: 720 }}
        >
          <ProfilSubpageHeader
            title="Cloud"
            subtitle="Stockage et synchronisation."
          />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PROVIDERS.map((item) => (
              <div
                key={item.title}
                className="paipers-elevated-card"
                style={{
                  padding: 18,
                  opacity: item.disabled ? 0.65 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontWeight: 800,
                        fontSize: 15,
                        margin: 0,
                        color: PAIPERS_COLORS.textPrimary,
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="paipers-text-muted"
                      style={{ margin: "4px 0 0", fontSize: 13 }}
                    >
                      {item.desc}
                    </p>
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 800,
                      color: "statusColor" in item ? item.statusColor : undefined,
                    }}
                    className={"statusColor" in item ? undefined : "paipers-text-muted"}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
