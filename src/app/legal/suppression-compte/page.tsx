import type { Metadata } from "next";
import Link from "next/link";
import { PAIPERS_COLORS, PAIPERS_PALETTES, PAIPERS_SPACE } from "@/lib/paipersTheme";

/**
 * Page publique (sans connexion) exigée par Google Play — « URL de suppression de compte ».
 * Doit : citer l'appli / le développeur, montrer clairement la marche à suivre,
 * dire quelles données sont supprimées ou conservées et pendant combien de temps.
 * Durées alignées sur la politique de confidentialité (paipers-mobile/src/legal/privacyPolicyFr.ts).
 */
export const metadata: Metadata = {
  title: "Supprimer son compte Plaidoc",
  description:
    "Comment supprimer ton compte Plaidoc et toutes tes données : depuis l'application ou par e-mail.",
};

const CONTACT_EMAIL = "contact@plaidoc.fr";

const card: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  padding: 20,
  marginBottom: 16,
  border: "1px solid #E6DCEE",
};

const h2: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 800,
  color: PAIPERS_COLORS.navy,
  margin: "0 0 10px",
};

const p: React.CSSProperties = { margin: "0 0 8px", lineHeight: 1.6 };

export default function SuppressionComptePage() {
  return (
    <div
      className="min-h-screen"
      style={{
        background: PAIPERS_PALETTES.light.background,
        padding: PAIPERS_SPACE.screenPad,
        paddingBottom: 48,
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <Link
          href="/"
          style={{ fontWeight: 700, color: PAIPERS_PALETTES.light.textMuted, textDecoration: "none" }}
        >
          ← Retour
        </Link>

        <h1 className="paipers-screen-title" style={{ marginTop: 16, marginBottom: 8 }}>
          Supprimer son compte Plaidoc
        </h1>
        <p className="paipers-text-muted" style={{ marginBottom: 24 }}>
          Cette page concerne l’application <b>Plaidoc</b> (Android et iPhone), éditée par la société{" "}
          <b>PAIPERS</b>. Tu peux supprimer ton compte et toutes les données associées à tout moment,
          gratuitement.
        </p>

        <section style={card}>
          <h2 style={h2}>Méthode 1 — Depuis l’application (immédiat)</h2>
          <ol style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, listStyle: "decimal" }}>
            <li>Ouvre l’application Plaidoc et connecte-toi.</li>
            <li>
              Va dans l’onglet <b>Profil</b>, puis <b>Paramètres</b>.
            </li>
            <li>
              Touche <b>« Supprimer mon compte »</b>.
            </li>
            <li>
              Confirme la suppression. Ton compte et tes données sont effacés aussitôt.
            </li>
          </ol>
        </section>

        <section style={card}>
          <h2 style={h2}>Méthode 2 — Par e-mail (sans l’application)</h2>
          <p style={p}>
            Tu n’as plus l’application ou tu n’arrives plus à te connecter ? Écris-nous à{" "}
            <a href={`mailto:${CONTACT_EMAIL}?subject=Suppression%20de%20mon%20compte%20Paipers`}>
              <b>{CONTACT_EMAIL}</b>
            </a>{" "}
            avec pour objet <b>« Suppression de mon compte Plaidoc »</b>, depuis l’adresse e-mail de ton
            compte.
          </p>
          <p style={{ ...p, margin: 0 }}>
            Nous vérifions que la demande vient bien du titulaire du compte, puis nous supprimons le
            compte et ses données sous <b>30 jours</b> au plus, et nous te confirmons la suppression par
            e-mail.
          </p>
        </section>

        <section style={card}>
          <h2 style={h2}>Supprimer seulement certaines données (sans supprimer ton compte)</h2>
          <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, listStyle: "disc" }}>
            <li>
              <b>Un document ou une photo</b> : ouvre-le dans Plaidoc, puis touche{" "}
              <b>«&nbsp;Supprimer&nbsp;»</b>. Le fichier est effacé.
            </li>
            <li>
              <b>Ta boîte mail</b> : dans <b>Profil</b>, ouvre ta boîte Gmail ou Outlook connectée et
              touche <b>«&nbsp;Déconnecter Gmail&nbsp;»</b> (ou <b>«&nbsp;Déconnecter Outlook&nbsp;»</b>).
              Plaidoc n’a plus accès à tes mails.
            </li>
            <li>
              <b>Ta signature enregistrée</b> : dans <b>Générer</b> → <b>Mes signatures</b>, touche{" "}
              <b>«&nbsp;Supprimer&nbsp;»</b>.
            </li>
            <li>
              Pour toute autre donnée, écris-nous à{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>
                <b>{CONTACT_EMAIL}</b>
              </a>{" "}
              : nous la supprimons sous <b>30 jours</b> au plus.
            </li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}>Ce qui est supprimé</h2>
          <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, listStyle: "disc" }}>
            <li>Ton compte (adresse e-mail, identifiant, mot de passe) et ton profil.</li>
            <li>Tous tes documents, photos et fichiers importés, et tes dossiers.</li>
            <li>Tes signatures enregistrées et les documents que tu as générés.</li>
            <li>Tout ce que l’assistant Archi a enregistré pour toi : rappels, alertes, éléments rangés.</li>
            <li>
              Les connexions à ta boîte mail (Gmail, Outlook) : l’accès de Plaidoc à ta boîte est
              coupé.
            </li>
            <li>Ton budget, tes abonnements, tes notifications et ton espace Professionnel (si tu en es le seul membre).</li>
          </ul>
        </section>

        <section style={card}>
          <h2 style={h2}>Ce qui est conservé, et combien de temps</h2>
          <ul style={{ margin: 0, paddingLeft: 22, lineHeight: 1.8, listStyle: "disc" }}>
            <li>
              Les copies techniques de sauvegarde sont effacées <b>au plus tard 30 jours</b> après la
              suppression.
            </li>
            <li>
              Les journaux techniques de connexion (sécurité du service) sont conservés{" "}
              <b>90 jours au maximum</b>, puis effacés.
            </li>
            <li>
              Des statistiques anonymes peuvent être gardées : elles ne permettent pas de
              t’identifier.
            </li>
          </ul>
        </section>

        <p className="paipers-text-muted" style={{ fontSize: 14 }}>
          Pour en savoir plus, consulte notre{" "}
          <Link href="/legal/politique-confidentialite">politique de confidentialité</Link>. Une
          question ? <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </div>
    </div>
  );
}
