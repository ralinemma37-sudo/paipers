/**
 * Politique de confidentialité — version renforcée MVP (français, alignée RGPD).
 *
 * Ne remplace pas un conseil juridique : faire valider identité éditeur, pays d’hébergement,
 * liste exacte des sous-traitants et bases légales par traitement avant lancement à grande échelle.
 */
import { PUBLISHER_IDENTITY_FR, PUBLISHER_PLACEHOLDERS_FR as P } from "@/legal/publisherPlaceholdersFr";

export const PRIVACY_POLICY_LAST_UPDATED = "5 novembre 2026";

export type LegalSection = { title: string; paragraphs: string[] };

export const privacyPolicySectionsFr: LegalSection[] = [
  {
    title: "1. Introduction et champ d’application",
    paragraphs: [
      "La présente politique de confidentialité explique comment la société PLAIDOC, éditrice de Plaidoc, traite les données à caractère personnel des utilisateurs de l’application mobile Plaidoc et, le cas échéant, des services associés (site web, flux de connexion tiers).",
      "Elle s’applique à toute personne qui crée un compte ou utilise le service. En vous inscrivant ou en continuant à utiliser Plaidoc après en avoir pris connaissance, vous reconnaissez avoir lu cette politique.",
    ],
  },
  {
    title: "2. Responsable du traitement",
    paragraphs: [
      "Le responsable du traitement au sens du Règlement (UE) 2016/679 (RGPD) et de la loi « Informatique et libertés » est " +
        PUBLISHER_IDENTITY_FR +
        ", représentée par sa Présidente, Vanessa Hyski.",
      "Pour toute question relative à vos données personnelles ou pour exercer vos droits : " + P.contactEmail + ". PLAIDOC n’a pas désigné de délégué à la protection des données, cette désignation n’étant pas obligatoire pour elle ; la Présidente est votre interlocutrice.",
    ],
  },
  {
    title: "3. Catégories de données collectées",
    paragraphs: [
      "Données d’identification et de compte : adresse e-mail, identifiant technique du compte, mot de passe (traité sous forme hachée par notre prestataire d’authentification — " +
        P.prestataireAuth +
        "), type de compte (particulier / professionnel) si vous le renseignez.",
      "Données de profil : nom, prénom, préférences d’affichage (ex. thème clair/sombre), autres champs que vous complétez volontairement, photo de profil si vous en téléversez une.",
      "Contenus que vous fournissez : documents numériques (PDF, images, etc.), signatures électroniques enregistrées par vos soins, titres, classements en dossiers, métadonnées et éventuellement résultats d’analyse ou d’aide à la rédaction si vous utilisez ces fonctions.",
      "Données liées à l’assistant IA : messages que vous adressez au chat, historique de conversation associé à votre compte, contexte de l’espace actif (Personnel ou Professionnel), identifiants et métadonnées de documents consultés pour répondre à votre demande — détaillé dans l’écran « Assistant IA ».",
      "Données espace Professionnel (offre Pro) : informations sur votre activité ou entité (raison sociale, logo), contacts professionnels, factures et devis le cas échéant, données de tableau de bord et rappels liés à l’espace Pro.",
      "Données relatives à la connexion Gmail (facultatif) : identifiants de liaison, adresse du compte connecté, et données nécessaires à la détection et à l’import de pièces jointes, ainsi qu’à l’envoi d’e-mails d’invitation à un espace partagé lorsque vous utilisez cette fonction — détaillé dans l’écran « Données et Gmail ».",
      "Données relatives aux espaces partagés (espace Professionnel, selon offre) : nom de l’espace, type d’espace, identifiant du propriétaire, liste des membres et rôles, statut des invitations (en attente, acceptée, refusée, annulée), adresse e-mail et nom éventuel des invités, message d’invitation, dates d’envoi et de réponse.",
      "Documents pouvant contenir des données sensibles : selon ce que vous choisissez d’importer, vos documents peuvent comporter des données particulièrement protégées — par exemple numéro de sécurité sociale et salaire (fiches de paie), informations de santé (mutuelle, arrêts de travail, ordonnances), situation fiscale ou familiale. Ces documents ne sont traités qu’à votre initiative, pour les ranger, les comprendre et vous rappeler les échéances ; vous pouvez les supprimer à tout moment. Pour les données de santé, le traitement repose sur votre consentement explicite, que vous exprimez en important le document et pouvez retirer en le supprimant.",
      "Données techniques et de sécurité : identifiants de session, journaux techniques, adresse IP, type d’appareil ou système, horodatages, selon ce que nos prestataires enregistrent pour assurer la sécurité et le bon fonctionnement du service.",
    ],
  },
  {
    title: "4. Finalités du traitement",
    paragraphs: [
      "Création et gestion de votre compte ; authentification ; fourniture des fonctionnalités souscrites (stockage, organisation, consultation, signature, import depuis e-mail si activé).",
      "Exécution de fonctions d’aide par intelligence artificielle : assistant conversationnel, recherche dans vos documents, analyse, génération de courriers ou de contenus, dans la limite de l’espace actif et de votre offre.",
      "Amélioration de la fiabilité et de la sécurité du service ; détection d’abus ; respect d’obligations légales (conservation de preuves si la loi l’exige, réponse aux autorités dans les cas prévus).",
      "Communication avec vous concernant le service (support, messages techniques indispensables au compte).",
      "Gestion des espaces partagés : création et administration d’un espace Professionnel par le titulaire de l’offre, envoi et suivi d’invitations, attribution de rôles, accès des membres aux contenus de l’espace selon les permissions prévues, séparation des données entre espace Personnel et espaces partagés.",
    ],
  },
  {
    title: "5. Espaces partagés et invitations (complément)",
    paragraphs: [
      "Un même compte utilisateur peut appartenir à plusieurs espaces (Personnel, Professionnel d’une activité). Le changement d’« espace actif » dans l’application détermine quel ensemble de documents et de données métier est affiché et traité dans l’interface.",
      "Les documents et métadonnées associés à un espace partagé peuvent être accessibles aux autres membres de cet espace, dans la limite des rôles définis par le propriétaire (ex. membre, lecture seule, collaborateur, comptable).",
      "Les invitations sont adressées à l’e-mail de la personne invitée ; seule une personne disposant d’un compte Plaidoc lié à cette adresse peut accepter l’invitation dans l’application.",
      "L’envoi de l’e-mail d’invitation peut transiter par la messagerie Gmail que le propriétaire a connectée : dans ce cas, Google traite l’envoi selon ses propres conditions ; Plaidoc enregistre les informations nécessaires au suivi de l’invitation.",
      "Pour plus de détails sur le fonctionnement et vos choix : écran « Espaces partagés » dans Confidentialité et légal.",
    ],
  },
  {
    title: "6. Bases légales (synthèse)",
    paragraphs: [
      "Exécution du contrat ou mesures précontractuelles : nécessité du traitement pour ouvrir et maintenir votre compte, stocker et afficher vos documents, appliquer les fonctionnalités que vous demandez.",
      "Obligation légale : lorsque la loi nous impose de conserver ou de communiquer certaines informations.",
      "Intérêt légitime : sécurisation des comptes et des infrastructures, lutte contre la fraude, amélioration mesurée du service, statistiques agrégées sans profilage intrusive — dans des conditions compatibles avec vos droits et attentes.",
      "Consentement : lorsque vous connectez un service tiers (ex. Gmail) ou activez une option qui impose un consentement explicite au sens du RGPD ; vous pouvez le retirer à tout moment (sans affecter la licéité des traitements déjà réalisés).",
      "Statistiques d’usage de l’application : uniquement avec votre accord ; sans accord, seuls des événements techniques nécessaires au bon fonctionnement (erreurs) sont enregistrés.",
    ],
  },
  {
    title: "7. Destinataires et sous-traitants",
    paragraphs: [
      "Les données sont traitées par la société PLAIDOC et par des sous-traitants strictement nécessaires : Supabase, Inc. (hébergement, base de données, stockage des fichiers, authentification — serveurs dans l’Union européenne, Paris) ; OpenAI (lecture et analyse des documents, assistant Archi, rédaction de courriers — États-Unis) ; Resend (envoi des e-mails liés au compte : confirmation, mot de passe oublié — États-Unis) ; Vercel (site web et pages de connexion) ; Expo (mises à jour de l’application et notifications) ; Apple et Google (distribution de l’application et paiement des abonnements achetés dans l’App Store ou Google Play) ; RevenueCat (suivi des abonnements achetés dans l’application — États-Unis) ; Stripe (paiement des abonnements souscrits sur le site — Irlande / États-Unis) ; Sentry (rapports de plantage techniques, sans contenu de vos documents — Union européenne). Si vous les connectez : Google (Gmail) et Microsoft (Outlook) pour la lecture des pièces jointes et l’envoi d’e-mails depuis votre boîte. Pour connaître la convention collective applicable à un préavis, seul le nom de la convention est envoyé au service public du ministère du Travail (Code du travail numérique).",
      "Ces acteurs traitent les données sur instruction documentée, dans le respect du RGPD (contrats de sous-traitance, clauses types de la Commission européenne en cas de transfert hors UE le cas échéant).",
      "Nous ne vendons pas vos données personnelles à des tiers et ne les cédons pas à des fins publicitaires.",
      "Au sein d’un espace partagé, certaines données (documents, métadonnées, identité des membres dans l’espace) sont mises à disposition des autres membres autorisés de cet espace, sur instruction du propriétaire et selon les rôles. Ces personnes ne deviennent pas « responsables du traitement » au nom de Plaidoc pour l’exploitation globale du service, mais doivent respecter la confidentialité des contenus auxquels elles accèdent.",
    ],
  },
  {
    title: "8. Transferts hors de l’Espace économique européen",
    paragraphs: [
      "Vos documents et votre compte sont hébergés dans l’Union européenne (Paris). Certaines opérations font intervenir des prestataires situés aux États-Unis : OpenAI (analyse des documents, assistant et tri des e-mails, uniquement pour les contenus nécessaires à la demande), Resend (e-mails liés au compte), RevenueCat et Stripe (abonnements).",
      "Ces transferts reposent sur les garanties prévues par le RGPD : décision d’adéquation (Data Privacy Framework UE–États-Unis) et/ou clauses contractuelles types de la Commission européenne. Les données transmises à l’API d’OpenAI ne sont pas utilisées pour entraîner ses modèles.",
    ],
  },
  {
    title: "9. Durées de conservation",
    paragraphs: [
      "Données de compte et contenus utilisateur : conservés tant que le compte est actif ; supprimés au plus tard sous 30 jours après une demande de suppression de compte effectuée depuis l’application (effacement immédiat des documents et du compte, élimination des copies techniques résiduelles dans ce délai), sous réserve des obligations légales de conservation (ex. obligations comptables ou probatoires si vous êtes une entité soumise à de telles règles).",
      "Données de facturation et de paiement de votre abonnement : conservées 10 ans (obligations comptables), puis supprimées.",
      "Données de connexion technique / journaux : conservés au maximum 90 jours, pour la sécurité et le bon fonctionnement du service.",
      "Conversation avec l’assistant Archi : conservée sur votre appareil pendant votre session, effacée après 30 minutes d’inactivité ou en cas de changement de compte.",
      "Après suppression, certaines informations peuvent persister sous forme anonymisée ou agrégée à des fins statistiques, sans possibilité de vous réidentifier.",
      "Données d’invitation et d’appartenance à un espace : conservées tant que l’espace existe et que l’invitation ou l’adhésion est pertinente ; supprimées ou anonymisées lorsque l’invitation est annulée, refusée, que le membre quitte l’espace ou que le compte concerné est supprimé, dans un délai raisonnable.",
    ],
  },
  {
    title: "10. Sécurité des données",
    paragraphs: [
      "Nous appliquons des mesures techniques et organisationnelles appropriées au regard des risques : chiffrement des communications (TLS), contrôle d’accès par compte, stockage de fichiers en environnement privé avec accès restreint (ex. URL signées à durée limitée), règles d’accès en base de données (ex. Row Level Security) lorsqu’elles sont activées.",
      "Vous devez choisir un mot de passe robuste, ne pas le partager et sécuriser l’accès à votre appareil. En cas de suspicion de compromission, changez votre mot de passe et contactez-nous.",
    ],
  },
  {
    title: "11. Intelligence artificielle et assistant Plaidoc",
    paragraphs: [
      "L’assistant IA permet de dialoguer en langage naturel et d’obtenir de l’aide sur vos documents et démarches dans Plaidoc. Selon votre demande, nous pouvons transmettre votre message, un historique limité de la conversation, le type d’espace actif et des informations sur les documents concernés (titres, catégories, extraits ou métadonnées) à des prestataires de modèles d’IA agissant en sous-traitants (actuellement OpenAI). Ces données ne servent pas à entraîner leurs modèles.",
      "Tri des e-mails : si vous connectez votre boîte mail (Gmail ou Outlook), l’IA (actuellement OpenAI) peut relire l’expéditeur, l’objet, le début du texte et le nom des pièces jointes des e-mails reçus, afin d’écarter les publicités, lettres d’information et tentatives d’arnaque et de ne vous montrer que ce qui concerne vos papiers. Le contenu des pièces jointes n’est pas transmis pour ce tri, et ces données ne servent pas à entraîner les modèles. Vous pouvez déconnecter votre boîte mail à tout moment.",
      "L’utilisation et le transfert, par Plaidoc, des informations reçues des API Google respectent la politique relative aux données utilisateur des services API Google, y compris les exigences d’utilisation limitée (« Plaidoc’s use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements »).",
      "L’assistant est conçu pour respecter la séparation des espaces : en principe, seules les données de l’espace que vous avez sélectionné (Personnel ou Professionnel) sont prises en compte pour vos requêtes.",
      "Les réponses générées sont indicatives. Elles ne constituent pas un conseil juridique, fiscal, comptable, médical ou administratif officiel. Vous devez vérifier toute information importante avant de la utiliser ou de l’envoyer à un tiers.",
      "Des limites d’usage (nombre de requêtes par mois) peuvent s’appliquer selon votre formule (Personnel, Pro).",
      "Nous ne réalisons pas de décision produisant des effets juridiques à votre égard uniquement par traitement automatisé sans intervention humaine au sens strict de l’article 22 RGPD, sauf évolution future expressément décrite et consentie.",
      "Pour plus de détails : écran « Assistant IA » dans Confidentialité et légal.",
    ],
  },
  {
    title: "12. Vos droits",
    paragraphs: [
      "Droit d’accès, de rectification, d’effacement (« droit à l’oubli »), de limitation du traitement, d’opposition (notamment pour l’intérêt légitime, sous réserve de motifs légitimes et impérieux), droit à la portabilité des données fournies par vous et traitées par voie automatisée sur la base du contrat ou du consentement, lorsque applicable.",
      "Droit de retirer votre consentement à tout moment lorsque le traitement est fondé sur le consentement.",
      "Droit d’introduire une réclamation auprès de la CNIL (www.cnil.fr) ou de l’autorité de protection des données de votre pays.",
      "Pour exercer vos droits : écrivez à " +
        P.contactEmail +
        " en précisant votre demande et votre identité. Nous pourrons vous demander une copie d’un justificatif d’identité en cas de doute raisonnable. Délai de réponse habituel : un mois, prolongeable selon la complexité et le volume, avec information préalable.",
      "La suppression de compte est également proposée dans l’application (Paramètres) ; elle entraîne l’effacement des données associées dans les limites techniques du service, comme décrit dans la présente politique.",
    ],
  },
  {
    title: "13. Violation de données personnelles",
    paragraphs: [
      "En cas de violation de données susceptible d’engendrer un risque pour vos droits, nous documentons l’incident et, lorsque requis par le RGPD, nous en informerons la CNIL et, si le risque est élevé pour vous, nous vous en notifierons dans les meilleurs délais avec les mesures prises ou proposées.",
    ],
  },
  {
    title: "14. Cookies, traceurs et application mobile",
    paragraphs: [
      "L’application mobile Plaidoc n’utilise pas de cookies de navigateur au sens des sites web. Des identifiants techniques peuvent être stockés sur l’appareil pour maintenir la session et les préférences.",
      "Si vous accédez à des pages web Plaidoc (ex. flux OAuth Gmail), les politiques de cookies et traceurs de ces sites s’appliquent en complément ; référez-vous aux informations publiées sur ces supports.",
    ],
  },
  {
    title: "15. Mineurs",
    paragraphs: [
      "Le service ne s’adresse pas aux mineurs de moins de 15 ans. Si vous avez entre 15 et 18 ans, l’utilisation doit être faite avec l’accord de votre représentant légal lorsque la loi l’exige. Si nous apprenons qu’un compte a été ouvert par un mineur non autorisé, nous pourrons le clôturer et supprimer les données associées.",
    ],
  },
  {
    title: "16. Modifications",
    paragraphs: [
      "Nous pouvons modifier la présente politique pour refléter l’évolution du service ou des obligations légales. La date de « dernière mise à jour » en tête de document sera actualisée. Les changements substantiels pourront être portés à votre attention par une notification dans l’application ou par e-mail lorsque cela est approprié.",
    ],
  },
  {
    title: "17. Contact",
    paragraphs: [
      "Données personnelles et vie privée : " + P.contactEmail + ".",
      "Support utilisateur : " + P.contactSupport + ".",
    ],
  },
];

export const PRIVACY_POLICY_DISCLAIMER_FR =
  "Une question sur vos données ou pour exercer vos droits : contact@plaidoc.fr.";
