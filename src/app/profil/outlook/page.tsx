"use client";

/**
 * Outlook — réf. paipers-mobile/app/(tabs)/profil/outlook.tsx
 */

import EmailProviderConnectPage from "@/components/profil/EmailProviderConnectPage";

export default function OutlookPage() {
  return (
    <EmailProviderConnectPage
      provider="outlook"
      title="Outlook"
      subtitlePersonal="Comptes Microsoft personnels et Microsoft 365 — import des PDF en pièce jointe."
      subtitlePro="Comptes Microsoft personnels et Microsoft 365 — import des PDF en pièce jointe."
    />
  );
}
