"use client";

/**
 * Gmail — remplace l’ancien stub OAuth erroné.
 * Réf. paipers-mobile/app/(tabs)/profil/gmail.tsx
 */

import EmailProviderConnectPage from "@/components/profil/EmailProviderConnectPage";

export default function GmailPage() {
  return (
    <EmailProviderConnectPage
      provider="gmail"
      title="Gmail"
      subtitlePersonal="Compte Gmail pour l’espace Personnel. Séparé de l’autre espace Paipers."
      subtitlePro="Compte Gmail pour l’espace Professionnel. Séparé de l’autre espace Paipers."
    />
  );
}
