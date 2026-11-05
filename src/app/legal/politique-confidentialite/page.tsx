import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { PRIVACY_POLICY_DISCLAIMER_FR, PRIVACY_POLICY_LAST_UPDATED, privacyPolicySectionsFr } from "@/legal/privacyPolicyFr";

export const metadata: Metadata = { title: "Politique de confidentialité — Plaidoc" };

export default function PolitiqueConfidentialitePage() {
  return (
    <LegalDocumentPage
      title="Politique de confidentialité"
      lastUpdated={PRIVACY_POLICY_LAST_UPDATED}
      sections={privacyPolicySectionsFr}
      footer={PRIVACY_POLICY_DISCLAIMER_FR}
    />
  );
}
