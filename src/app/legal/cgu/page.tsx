import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { TERMS_DISCLAIMER_FR, TERMS_LAST_UPDATED, TERMS_TITLE_FR, termsOfServiceSectionsFr } from "@/legal/termsOfServiceFr";

export const metadata: Metadata = { title: `${TERMS_TITLE_FR} — Plaidoc` };

export default function CguPage() {
  return (
    <LegalDocumentPage
      title={TERMS_TITLE_FR}
      lastUpdated={TERMS_LAST_UPDATED}
      sections={termsOfServiceSectionsFr}
      footer={TERMS_DISCLAIMER_FR}
    />
  );
}
