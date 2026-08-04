/**
 * Section FAQ (#faq).
 */

import LandingSection from "@/components/landing/LandingSection";

export default function LandingFaqSection() {
  return (
    <LandingSection id="faq" tone="alt">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        Questions fréquentes
      </h2>
      <div className="mt-8 max-w-3xl mx-auto space-y-3">
        {[
          {
            q: "Paipers remplace-t-il mon logiciel de facturation ?",
            a: "Sur mobile, l’espace Pro inclut la création de factures et devis. Sur le web, l’onglet Factures présente l’espace et les états disponibles, sans inventer une suite comptable complète.",
          },
          {
            q: "Mes emails sont-ils en sécurité ?",
            a: "Les connexions Gmail et Outlook passent par OAuth. Tu pourras déconnecter un compte à tout moment depuis le Profil.",
          },
          {
            q: "Puis-je utiliser Paipers gratuitement aujourd’hui ?",
            a: "Paipers n’est pas encore ouvert au public. Rejoins la liste d’attente pour être informé(e) en priorité à l’ouverture. Un accès privé reste réservé à l’équipe.",
          },
          {
            q: "Qu’est-ce qu’Archi ?",
            a: "Archi est l’assistant Paipers. Il t’aide sur ton administratif, sans promettre des actions hors périmètre.",
          },
        ].map((item) => (
          <details key={item.q} className="paipers-card-white p-[18px] group">
            <summary className="font-extrabold cursor-pointer list-none flex justify-between gap-3">
              {item.q}
              <span className="paipers-text-muted font-bold">+</span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed paipers-text-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </LandingSection>
  );
}
