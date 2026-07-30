/**
 * Espaces Pro visibles sur l’accueil Documents — présentation uniquement.
 * Réf. : paipers-mobile/src/features/proDocuments/professionalSpacesConfig.ts
 * Aucune donnée Pro workspace branchée sur le web.
 */

export type ProSpaceHomeItem = {
  id: string;
  title: string;
};

export const PRO_DOCUMENTS_HOME_SPACES: ProSpaceHomeItem[] = [
  { id: "factures-clients", title: "Factures clients" },
  { id: "factures-fournisseurs", title: "Factures fournisseurs" },
  { id: "banque", title: "Banque" },
  { id: "fiscal-urssaf", title: "Fiscal" },
  { id: "social-urssaf", title: "Social / URSSAF" },
  { id: "juridique", title: "Juridique" },
  { id: "contrats", title: "Contrats" },
  { id: "assurance", title: "Assurance" },
  { id: "comptable", title: "Comptable" },
];
