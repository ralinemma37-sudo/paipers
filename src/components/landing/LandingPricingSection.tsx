/**
 * Section tarifs (#tarifs).
 */

import { APP_SIGNUP_URL } from "@/lib/appLinks";
import LandingSection from "@/components/landing/LandingSection";
import { DESKTOP_SURFACES } from "@/lib/desktopSurfaces";
import { PAIPERS_COLORS } from "@/lib/paipersTheme";

export default function LandingPricingSection() {
  return (
    <LandingSection id="tarifs" tone="canvas">
      <h2 className="paipers-screen-title text-center" style={{ fontSize: 32 }}>
        Tarifs simples
      </h2>
      <p className="mt-3 text-center paipers-text-muted">
        Essaie gratuitement, sans engagement. Tu choisis ensuite la formule qui te convient.
      </p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 max-w-3xl mx-auto">
        <div className="paipers-card-white p-[22px] paipers-hover-lift">
          <p className="text-sm font-extrabold" style={{ color: PAIPERS_COLORS.navy }}>
            Personnel
          </p>
          <p className="mt-2 text-3xl font-extrabold">
            6,99 € <span className="text-base font-bold paipers-text-muted">/ mois</span>
          </p>
          <p className="mt-2 text-sm font-semibold">7 jours d’essai gratuit</p>
          <ul className="mt-4 text-sm leading-relaxed paipers-text-muted" style={{ paddingLeft: 18, listStyle: "disc" }}>
            <li>Tes documents rangés tout seuls</li>
            <li>Tes mails triés, tes échéances suivies</li>
            <li>Mon budget et tes abonnements</li>
            <li>Archi, ton assistant</li>
          </ul>
          <a href={APP_SIGNUP_URL} className="paipers-button mt-6 w-full text-center" style={{ display: "block", textDecoration: "none" }}>
            Créer mon compte
          </a>
        </div>
        <div className="paipers-card-marine p-[22px] paipers-hover-lift">
          <p className="text-sm font-extrabold" style={{ color: DESKTOP_SURFACES.accentLine }}>
            Offre Professionnelle
          </p>
          <p className="mt-2 text-3xl font-extrabold" style={{ color: DESKTOP_SURFACES.onDark }}>
            29,99 € <span className="text-base font-bold" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>/ mois</span>
          </p>
          <p className="mt-2 text-sm font-semibold" style={{ color: DESKTOP_SURFACES.onDarkMuted }}>
            14 jours d’essai gratuit
          </p>
          <ul className="mt-4 text-sm leading-relaxed" style={{ paddingLeft: 18, listStyle: "disc", color: DESKTOP_SURFACES.onDarkMuted }}>
            <li><b style={{ color: DESKTOP_SURFACES.onDark }}>L’espace Personnel est inclus</b></li>
            <li>Factures, devis et trésorerie</li>
            <li>Documents de l’entreprise rangés à part</li>
            <li>Conformité e-facture</li>
          </ul>
          <a href={APP_SIGNUP_URL} className="paipers-button mt-6 w-full text-center" style={{ display: "block", textDecoration: "none" }}>
            Créer mon compte
          </a>
        </div>
      </div>
      <div className="paipers-card-white mt-6 p-[18px] max-w-3xl mx-auto text-center">
        <p className="text-base font-extrabold" style={{ color: PAIPERS_COLORS.navy }}>
          🎁 Parrainage : 1 mois offert pour vous deux
        </p>
        <p className="mt-1 text-sm paipers-text-muted">
          Invite un proche : dès que son abonnement est validé, vous gagnez chacun un mois gratuit.
        </p>
      </div>
    </LandingSection>
  );
}
