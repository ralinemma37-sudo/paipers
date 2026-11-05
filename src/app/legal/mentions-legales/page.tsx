import type { Metadata } from "next";
import { LegalDocumentPage } from "@/components/legal/LegalDocumentPage";
import { LEGAL_NOTICES_DISCLAIMER_FR, LEGAL_NOTICES_LAST_UPDATED, legalNoticesSectionsFr } from "@/legal/legalNoticesFr";

export const metadata: Metadata = { title: "Mentions légales — Plaidoc" };

export default function MentionsLegalesPage() {
  return (
    <LegalDocumentPage
      title="Mentions légales"
      lastUpdated={LEGAL_NOTICES_LAST_UPDATED}
      sections={legalNoticesSectionsFr}
      footer={LEGAL_NOTICES_DISCLAIMER_FR}
    />
  );
}
