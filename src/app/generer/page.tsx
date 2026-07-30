"use client";

/**
 * Hub Générer — réf. app/(tabs)/generer/index.tsx + GenererHubContent.tsx
 * Pro : redirection vers /factures (comme mobile Redirect factures).
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { useNavSpace } from "@/components/NavSpaceProvider";
import GenererHub from "@/components/generer/GenererHub";
import { PAIPERS_COLORS, PAIPERS_SPACE } from "@/lib/paipersTheme";

export default function GenererPage() {
  const router = useRouter();
  const { showProTabs, loaded } = useNavSpace();

  useEffect(() => {
    if (!loaded) return;
    if (showProTabs) {
      router.replace("/factures");
    }
  }, [loaded, showProTabs, router]);

  if (!loaded || showProTabs) {
    return (
      <Protected>
        <AppShell>
          <div
            style={{
              padding: PAIPERS_SPACE.screenPad,
              display: "flex",
              justifyContent: "center",
              paddingTop: 48,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 999,
                border: `3px solid ${PAIPERS_COLORS.border}`,
                borderTopColor: PAIPERS_COLORS.navy,
                animation: "spin 0.8s linear infinite",
              }}
              className="assistant-spinner"
            />
          </div>
        </AppShell>
      </Protected>
    );
  }

  return (
    <Protected>
      <AppShell>
        <div
          className="pb-24 md:pb-8"
          style={{ padding: PAIPERS_SPACE.screenPad }}
        >
          <GenererHub />
        </div>
      </AppShell>
    </Protected>
  );
}
