/**
 * Conditions générales d’utilisation (CGU) — MVP français.
 * À faire valider par un juriste (responsabilité, médiation, consommateurs, B2B).
 */
import { getPublisherPlaceholdersForDisplay } from "@/legal/publisherPlaceholdersFr";

export const TERMS_LAST_UPDATED = "20 mai 2026";

export type LegalSection = { title: string; paragraphs: string[] };

const P = getPublisherPlaceholdersForDisplay();

export const termsOfServiceSectionsFr: LegalSection[] = [
  {
    title: "1. Objet",
    paragraphs: [
      "Les présentes conditions générales d’utilisation (« CGU ») régissent l’accès et l’utilisation de l’application mobile Paipers et des services associés proposés par " +
        P.denomination +
        " (« nous », « l’éditeur »).",
      "En créant un compte ou en utilisant le service, vous acceptez sans réserve les présentes CGU. Si vous n’y consentez pas, vous ne devez pas utiliser Paipers.",
    ],
  },
  {
    title: "2. Description du service",
    paragraphs: [
      "Paipers permet notamment de stocker, organiser et consulter des documents numériques, d’utiliser un assistant conversationnel basé sur l’intelligence artificielle, d’analyser ou générer des contenus, de signer des documents, d’importer des pièces jointes via une connexion e-mail facultative, et — selon l’offre souscrite — de gérer un espace Famille (Premium) ou un espace Professionnel (Pro) avec facturation, contacts et collaborateurs.",
      "Le service est fourni « en l’état » dans le cadre d’un MVP ; des interruptions, évolutions ou limitations de fonctionnalités peuvent survenir. Nous visons une disponibilité raisonnable sans garantie de performance absolue.",
    ],
  },
  {
    title: "3. Espaces partagés, invitations et rôles",
    paragraphs: [
      "Un compte utilisateur correspond à une personne identifiée par son adresse e-mail. L’utilisateur peut travailler dans un espace Personnel et, le cas échéant, dans un ou plusieurs espaces Famille ou Professionnel auxquels il a été admis ou qu’il gère en tant que propriétaire.",
      "Le propriétaire d’un espace partagé est responsable des invitations qu’il envoie et des membres qu’il autorise. Il ne doit inviter que des personnes ayant un lien légitime avec l’espace (foyer, activité professionnelle) et ne partager que des contenus qu’il est autorisé à communiquer.",
      "Une personne invitée peut accepter ou refuser une invitation. Les membres non propriétaires peuvent quitter l’espace. Le propriétaire peut retirer un membre ou annuler une invitation selon les fonctionnalités proposées dans l’application.",
      "L’accès aux documents et fonctionnalités au sein d’un espace partagé dépend du rôle attribué (ex. membre, lecture seule, collaborateur). Paipers ne garantit pas une disponibilité permanente d’un espace si l’offre du propriétaire expire ou si le compte du propriétaire est suspendu.",
      "Les membres invités à un espace Famille ou Professionnel n’ont pas, en principe, à souscrire individuellement le même abonnement que le propriétaire pour rejoindre cet espace, dans les limites de l’offre en vigueur au moment de l’invitation.",
    ],
  },
  {
    title: "4. Offre Pro et espace Professionnel",
    paragraphs: [
      "L’offre Pro donne accès à l’espace Professionnel : documents et outils liés à une activité (factures, contacts d’entité, tableau de bord, etc., selon les versions). L’utilisateur Pro reste seul responsable de la conformité de ses documents professionnels (facturation, conservation légale, mentions obligatoires).",
      "Paipers fournit des outils d’aide et d’organisation ; il ne se substitue pas à un expert-comptable, avocat ou conseiller fiscal sauf accord écrit spécifique.",
      "L’essai Pro ou les modes démo n’engagent pas de paiement réel tant qu’aucun abonnement payant n’est souscrit via les canaux officiels prévus.",
    ],
  },
  {
    title: "5. Compte utilisateur",
    paragraphs: [
      "Vous devez fournir des informations exactes et maintenir la confidentialité de vos identifiants. Toute activité réalisée depuis votre compte est présumée effectuée par vous.",
      "Vous devez nous informer sans délai de toute utilisation non autorisée. Nous pouvons suspendre ou clôturer un compte en cas de violation des présentes CGU ou de risque pour la sécurité.",
    ],
  },
  {
    title: "6. Utilisations interdites",
    paragraphs: [
      "Il est interdit d’utiliser Paipers : pour des activités illégales, frauduleuses ou portant atteinte aux droits de tiers ; pour stocker ou diffuser des contenus illicites, haineux, violents ou pornographiques non autorisés ; pour tenter de contourner les mesures de sécurité, d’accéder à des comptes tiers ou de surcharger les infrastructures ; pour revendre ou louer l’accès au service sans accord écrit.",
      "L’éditeur peut retirer tout contenu ou suspendre tout compte manifestement contraire à ces règles, sans préjudice d’éventuelles poursuites.",
    ],
  },
  {
    title: "7. Contenus et propriété intellectuelle",
    paragraphs: [
      "Vous conservez les droits sur les contenus que vous déposez dans Paipers. Vous nous accordez une licence limitée, non exclusive, mondiale et gratuite pour héberger, sauvegarder, afficher, traiter et reproduire techniquement ces contenus uniquement pour fournir le service et améliorer sa fiabilité (sauvegardes, sécurité).",
      "Les éléments de l’application (marque, design, code, textes hors contenus utilisateurs) restent la propriété de l’éditeur ou de ses concédants. Aucune licence n’est accordée sur ces éléments sauf droit d’utilisation personnelle du service.",
    ],
  },
  {
    title: "8. Assistant IA et intelligence artificielle",
    paragraphs: [
      "L’assistant Paipers utilise des technologies d’IA pour comprendre vos demandes et proposer des actions ou réponses. Il fonctionne dans le cadre de l’espace actif que vous avez choisi et selon les limites de votre offre.",
      "Les sorties générées (textes, suggestions, classements, brouillons) sont fournies à titre indicatif. Vous restez seul responsable de l’usage que vous en faites, notamment pour les courriers officiels, déclarations, contrats, factures ou pièces transmises à des tiers.",
      "Il est interdit d’utiliser l’assistant pour générer des contenus illicites, trompeurs ou portant atteinte aux droits de tiers. Ne transmettez pas de données excessivement sensibles si ce n’est pas nécessaire à votre demande.",
      "Pour le détail des données traitées : écran « Assistant IA » dans Confidentialité et légal.",
    ],
  },
  {
    title: "9. Tarification et évolution",
    paragraphs: [
      "Certaines fonctionnalités peuvent être gratuites ou payantes selon les offres publiées. Toute évolution tarifaire substantielle pourra être notifiée conformément à la réglementation applicable (notamment pour les consommateurs).",
      "« À compléter : modalités d’abonnement, essai gratuit, facturation, remboursement selon votre modèle économique réel. »",
    ],
  },
  {
    title: "10. Durée et résiliation",
    paragraphs: [
      "Les CGU s’appliquent pendant toute la durée d’utilisation du service. Vous pouvez cesser d’utiliser Paipers et supprimer votre compte depuis les Paramètres de l’application ; la suppression entraîne l’effacement des données associées dans les limites décrites dans la politique de confidentialité.",
      "Nous pouvons résilier ou suspendre l’accès au service en cas de manquement grave, après notification lorsque cela est possible.",
    ],
  },
  {
    title: "11. Responsabilité",
    paragraphs: [
      "Dans les limites autorisées par la loi, la responsabilité de l’éditeur ne saurait être engagée pour les dommages indirects, perte de données due à une négligence de l’utilisateur, ou indisponibilités indépendantes de notre volonté.",
      "Pour les consommateurs, les dispositions impératives du Code de la consommation et du Code civil demeurent applicables.",
    ],
  },
  {
    title: "12. Droit applicable et litiges",
    paragraphs: [
      "Les présentes CGU sont régies par le droit français, sous réserve des dispositions impératives du pays de résidence des consommateurs.",
      "En cas de litige, vous pouvez recourir à une médiation de la consommation ou à toute voie de recours prévue par la loi. « À compléter : coordonnées médiateur si vous y êtes tenu après seuils légaux. »",
      "Tribunaux compétents : « À compléter : tribunal compétent en l’absence de règle impérative contraire. »",
    ],
  },
  {
    title: "12. Contact",
    paragraphs: ["Pour toute question relative aux présentes CGU : " + P.contactEmail + " ou " + P.contactSupport + "."],
  },
  {
    title: "14. Modifications des CGU",
    paragraphs: [
      "Nous pouvons modifier les CGU ; la date de mise à jour sera indiquée en tête de document. La poursuite de l’utilisation après notification d’un changement substantiel vaut acceptation sauf si la loi impose une procédure spécifique (consommateurs).",
    ],
  },
];

export const TERMS_DISCLAIMER_FR =
  "Base rédigée pour un MVP : faites relire par un juriste (clauses de responsabilité, consommateurs, médiation, abonnements, garanties).";
