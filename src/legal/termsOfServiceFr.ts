/**
 * Conditions générales d’utilisation et de vente (CGU/CGV) de Plaidoc.
 * 05/11/2026 : éditeur = SAS PLAIDOC ; ajout des conditions de vente des abonnements (tarifs du 18/10, essai,
 * achat Apple/Google ou sur le site, rétractation, résiliation, parrainage).
 */
import { PUBLISHER_IDENTITY_FR, PUBLISHER_PLACEHOLDERS_FR as P } from "@/legal/publisherPlaceholdersFr";

export const TERMS_LAST_UPDATED = "5 novembre 2026";
export const TERMS_TITLE_FR = "Conditions générales d’utilisation et de vente";

export type LegalSection = { title: string; paragraphs: string[] };

export const termsOfServiceSectionsFr: LegalSection[] = [
  {
    title: "1. Qui sommes-nous et à quoi servent ces conditions",
    paragraphs: [
      "Plaidoc est un service édité par " + PUBLISHER_IDENTITY_FR + " (« PLAIDOC », « nous »). Contact : " + P.contactEmail + ".",
      "Les présentes conditions générales d’utilisation et de vente (« Conditions ») s’appliquent à l’utilisation de l’application Plaidoc (iPhone, Android et web) et du site plaidoc.fr, ainsi qu’à la souscription des abonnements payants.",
      "En créant un compte, vous acceptez les présentes Conditions. Si vous ne les acceptez pas, n’utilisez pas Plaidoc.",
    ],
  },
  {
    title: "2. Le service",
    paragraphs: [
      "Plaidoc vous aide à gérer vos papiers : stocker, ranger et retrouver vos documents ; recevoir des rappels d’échéances ; utiliser Archi, l’assistant fondé sur l’intelligence artificielle, pour comprendre un document, préparer un courrier ou une démarche ; signer et remplir des documents ; importer les pièces jointes de votre boîte mail si vous la connectez ; et, avec l’offre Pro, gérer un espace Professionnel (factures, clients, contacts, collaborateurs).",
      "Nous faisons évoluer le service régulièrement. Nous faisons le nécessaire pour qu’il soit disponible et fiable, sans pouvoir garantir l’absence totale d’interruption, notamment pendant les opérations de maintenance.",
    ],
  },
  {
    title: "3. Votre compte",
    paragraphs: [
      "Le service est réservé aux personnes âgées d’au moins 15 ans. Vous devez fournir des informations exactes et garder votre mot de passe secret. Toute action faite depuis votre compte est présumée faite par vous ; prévenez-nous sans délai en cas d’utilisation non autorisée.",
      "Vous pouvez supprimer votre compte à tout moment depuis Profil › Confidentialité et légal. La suppression efface vos documents et vos données dans les conditions décrites dans la politique de confidentialité. Supprimer le compte ne résilie pas un abonnement souscrit auprès d’Apple ou de Google : pensez à le résilier aussi (article 9).",
    ],
  },
  {
    title: "4. Espace Professionnel et espaces partagés",
    paragraphs: [
      "L’offre Pro donne accès à un espace Professionnel, séparé de votre espace Personnel. Vous restez seul responsable de la conformité de vos documents professionnels (mentions obligatoires des factures, conservation légale, déclarations).",
      "Le titulaire d’un espace Professionnel peut y inviter des collaborateurs. Il n’invite que des personnes qui ont un lien légitime avec son activité et ne partage que des documents qu’il a le droit de communiquer. L’accès de chaque membre dépend du rôle que le titulaire lui donne. Les membres invités n’ont pas besoin de souscrire eux-mêmes l’offre Pro pour rejoindre l’espace.",
      "Si l’abonnement du titulaire prend fin, l’accès des membres à l’espace peut être limité.",
    ],
  },
  {
    title: "5. Archi et l’intelligence artificielle",
    paragraphs: [
      "Archi utilise l’intelligence artificielle pour lire vos documents, proposer un rangement, répondre à vos questions et préparer des brouillons. Il ne travaille que dans l’espace que vous avez choisi (Personnel ou Professionnel).",
      "Les réponses d’Archi peuvent contenir des erreurs. Elles sont une aide et ne remplacent pas l’avis d’un avocat, d’un expert-comptable, d’un médecin ou de l’administration. Relisez toujours un courrier, une déclaration, un contrat ou une facture avant de l’envoyer : vous restez responsable de ce que vous envoyez.",
      "Le détail des données transmises à l’intelligence artificielle figure dans l’écran « Assistant IA » et dans la politique de confidentialité.",
    ],
  },
  {
    title: "6. Utilisations interdites",
    paragraphs: [
      "Il est interdit d’utiliser Plaidoc pour une activité illégale ou frauduleuse ; pour stocker ou diffuser des contenus illicites ou portant atteinte aux droits d’autrui ; pour fabriquer de faux documents ; pour tenter d’accéder au compte d’une autre personne, de contourner la sécurité ou de surcharger le service ; ou pour revendre l’accès au service sans notre accord écrit.",
      "En cas de manquement grave, nous pouvons suspendre ou fermer le compte concerné, après vous avoir prévenu lorsque c’est possible.",
    ],
  },
  {
    title: "7. Vos documents et nos droits",
    paragraphs: [
      "Vos documents restent les vôtres. Vous nous autorisez seulement à les héberger, les sauvegarder, les afficher et les traiter dans la mesure nécessaire pour vous fournir le service. Nous ne les vendons pas et ne les utilisons pas à des fins publicitaires.",
      "La marque Plaidoc, l’application, le site et leur contenu appartiennent à PLAIDOC. Votre abonnement vous donne un droit personnel d’utiliser le service, sans autre droit sur ces éléments.",
    ],
  },
  {
    title: "8. Offres et prix",
    paragraphs: [
      "Plaidoc propose deux abonnements mensuels : Personnel, à 6,99 € par mois, et Pro, à 29,99 € par mois. L’abonnement Pro comprend aussi l’espace Personnel. Les prix sont indiqués toutes taxes comprises (" + P.tva + ").",
      "Essai gratuit : 7 jours pour l’offre Personnel et 14 jours pour l’offre Pro, une seule fois par personne. Aucun paiement n’est prélevé pendant l’essai. Si vous ne résiliez pas avant la fin de l’essai, l’abonnement commence et le premier mois est facturé à la fin de l’essai. Pendant l’essai, l’appli vous rappelle sa date de fin.",
      "Parrainage : lorsqu’une personne que vous avez parrainée paie son premier mois d’abonnement, vous recevez chacun un mois gratuit. Le mois offert ne peut pas être échangé contre de l’argent.",
      "Le prix applicable est celui affiché au moment de la souscription. Nous pouvons faire évoluer nos prix ; nous vous prévenons au moins 30 jours à l’avance, et vous pouvez résilier avant que le nouveau prix s’applique.",
    ],
  },
  {
    title: "9. Souscription, paiement et résiliation",
    paragraphs: [
      "Achat dans l’application iPhone ou Android : l’abonnement est vendu et encaissé par Apple (App Store) ou Google (Google Play), selon leurs propres conditions. Le paiement est débité sur votre compte Apple ou Google. Pour résilier, ouvrez les réglages d’abonnement de votre téléphone (le bouton « Gérer mon abonnement » dans Profil › Abonnement vous y conduit). Les demandes de remboursement de ces achats se font auprès d’Apple ou de Google.",
      "Achat sur le site plaidoc.fr : l’abonnement est vendu par PLAIDOC et payé par carte bancaire via notre prestataire de paiement sécurisé Stripe. Vous pouvez résilier à tout moment, en quelques clics, depuis Profil › Abonnement ; une confirmation vous est envoyée par e-mail.",
      "Dans tous les cas, l’abonnement se renouvelle automatiquement chaque mois jusqu’à sa résiliation. La résiliation prend effet à la fin du mois en cours, déjà payé : vous gardez l’accès jusqu’à cette date, et aucun nouveau paiement n’est prélevé. Le mois commencé n’est pas remboursé, sauf droit de rétractation (article 10).",
      "Si un paiement échoue, l’accès aux fonctions payantes peut être suspendu jusqu’à régularisation. Vos documents restent consultables et téléchargeables.",
    ],
  },
  {
    title: "10. Droit de rétractation (consommateurs)",
    paragraphs: [
      "Si vous êtes un consommateur, vous disposez d’un délai de 14 jours à compter de la souscription pour vous rétracter, sans avoir à donner de motif (articles L. 221-18 et suivants du Code de la consommation). Pendant l’essai gratuit, il vous suffit de résilier : rien n’est prélevé.",
      "Pour un abonnement acheté sur le site, écrivez à " + P.contactEmail + " ou utilisez le bouton de résiliation. Si vous avez demandé à utiliser le service payant avant la fin du délai, le montant correspondant à la période déjà utilisée reste dû (article L. 221-25) ; le reste vous est remboursé sous 14 jours. Pour un achat fait auprès d’Apple ou de Google, la demande se fait auprès d’eux.",
    ],
  },
  {
    title: "11. Données personnelles",
    paragraphs: [
      "Nous traitons vos données personnelles conformément au RGPD, comme expliqué dans la politique de confidentialité, accessible dans Profil › Confidentialité et légal et sur plaidoc.fr.",
    ],
  },
  {
    title: "12. Responsabilité",
    paragraphs: [
      "Nous mettons en œuvre des moyens sérieux pour assurer la sécurité et le bon fonctionnement du service. Nous ne sommes pas responsables des dommages indirects, des conséquences d’une réponse d’Archi utilisée sans vérification, ni des indisponibilités dues à un cas de force majeure ou à un prestataire extérieur (opérateur, Apple, Google, messagerie).",
      "Gardez une copie des documents importants. Rien dans ces Conditions ne limite les droits que vous accorde la loi si vous êtes un consommateur, notamment la garantie de conformité des contenus et services numériques (articles L. 224-25-12 et suivants du Code de la consommation).",
    ],
  },
  {
    title: "13. Réclamations, médiation et litiges",
    paragraphs: [
      "Pour toute réclamation, écrivez d’abord à " + P.contactEmail + " : nous vous répondons et cherchons une solution amiable.",
      "Si vous êtes un consommateur et que le désaccord persiste, vous pouvez recourir gratuitement à un médiateur de la consommation (articles L. 612-1 et suivants du Code de la consommation). Ses coordonnées vous sont communiquées sur simple demande à " + P.contactEmail + ".",
      "Les présentes Conditions sont soumises au droit français. À défaut d’accord amiable, le litige est porté devant le tribunal compétent ; si vous êtes un consommateur, vous pouvez saisir le tribunal de votre domicile.",
    ],
  },
  {
    title: "14. Modification des Conditions",
    paragraphs: [
      "Nous pouvons modifier ces Conditions pour suivre l’évolution du service ou de la loi. La date de mise à jour est indiquée en haut. En cas de changement important, nous vous prévenons dans l’application ou par e-mail avant son entrée en vigueur ; si vous refusez, vous pouvez résilier votre abonnement et supprimer votre compte.",
    ],
  },
  {
    title: "15. Contact",
    paragraphs: ["Pour toute question : " + P.contactEmail + "."],
  },
];

export const TERMS_DISCLAIMER_FR = "Une question sur ces conditions : contact@plaidoc.fr.";
