// FILE-EXCEPTION: file length
/**
 * Docs page locale â€” FR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const fr = {
  modules: {
    entitlementsOverview: {
      title: "AperÃ§u des Droits (Entitlements)",
      description:
        "ContrÃ´le d'accÃ¨s aux fonctionnalitÃ©s basÃ© sur les Ã©ditions avec FonctionnalitÃ©s, Ã‰ditions, Abonnements et Surcharges par locataire.",
      intro:
        "Le module des Droits (Entitlements) est le moteur de gestion des plans et des fonctionnalitÃ©s de SCRIPE. Il dÃ©finit les capacitÃ©s que chaque locataire (tenant) obtient, comment les plans (Ã©ditions) regroupent ces capacitÃ©s, et comment les abonnements lient les locataires aux plans.",
      whatIsTitle: "Que sont les Droits ?",
      whatIsIntro:
        "Les Droits sont le module responsable de contrÃ´ler Ã  quelles fonctionnalitÃ©s un locataire peut accÃ©der en fonction de son Ã©dition (plan) souscrite. Il fournit une chaÃ®ne de rÃ©solution Ã  trois niveaux : Valeurs par dÃ©faut de la fonctionnalitÃ© â†’ Valeurs de l'Ã©dition â†’ Surcharges par locataire, garantissant une flexibilitÃ© maximale pour les opÃ©rateurs de la plateforme et les locataires revendeurs.",
      architectureTitle: "Architecture",
      architectureIntro:
        "Le systÃ¨me de Droits est composÃ© de quatre domaines interconnectÃ©s qui travaillent ensemble pour fournir une solution complÃ¨te de contrÃ´le des fonctionnalitÃ©s.",
      domainsTitle: "Quatre Domaines",
      domainsIntro: "Chaque domaine gÃ¨re un aspect spÃ©cifique du cycle de vie des droits :",
      resolutionTitle: "ChaÃ®ne de RÃ©solution des Valeurs de FonctionnalitÃ©",
      resolutionIntro:
        "Lorsque le systÃ¨me a besoin de dÃ©terminer la valeur d'une fonctionnalitÃ© pour un locataire, il suit une chaÃ®ne de prioritÃ© stricte. La source de prioritÃ© la plus Ã©levÃ©e qui fournit une valeur l'emporte.",
      pipelineTitle: "IntÃ©gration au Pipeline",
      pipelineIntro:
        "SCRIPE intÃ¨gre les droits directement dans le pipeline CQRS de SCRIPE mediator via FeatureCheckBehavior. Les commandes et requÃªtes (queries) qui implÃ©mentent IRequireFeature sont automatiquement contrÃ´lÃ©es â€” si la valeur rÃ©solue de la fonctionnalitÃ© pour le locataire est dÃ©sactivÃ©e, la requÃªte est rejetÃ©e avant d'atteindre le gestionnaire (handler).",
      pipelineTip:
        "Pour conditionner une commande Ã  une fonctionnalitÃ©, implÃ©mentez simplement IRequireFeature et dÃ©finissez RequiredFeatureName sur la clÃ© systÃ¨me stable de la fonctionnalitÃ© (ex. 'Chat.Enabled'). Aucun code supplÃ©mentaire n'est nÃ©cessaire.",
      backendTitle: "Structure du Backend",
      backendIntro:
        "Le backend des Droits suit l'architecture standard des modules Clean Architecture de SCRIPE avec les couches Domain, Application et Infrastructure.",
      frontendTitle: "Structure du Frontend",
      frontendIntro:
        "Le frontend reflÃ¨te le backend avec quatre sous-modules (Ã©ditions, fonctionnalitÃ©s, abonnements, surcharges), chacun suivant le modÃ¨le SOLID View/ViewModel.",
      controllersTitle: "ContrÃ´leurs API",
      controllersIntro:
        "Le module des Droits expose 31 points de terminaison (endpoints) API rÃ©partis sur 4 contrÃ´leurs, tous authentifiÃ©s par JWT et protÃ©gÃ©s par une autorisation basÃ©e sur les permissions.",
      noOpTitle: "Solution de repli NoOp (Fallback)",
      noOpIntro:
        "Lorsque le module des Droits n'est pas chargÃ© (ex. dans un microservice qui n'inclut pas les Droits), SCRIPE enregistre un NoOpFeatureCache. Cela permet aux commandes IRequireFeature de passer sans erreur â€” toutes les fonctionnalitÃ©s sont traitÃ©es comme activÃ©es par dÃ©faut.",
      noOpNote:
        "La solution de repli NoOp garantit que les modules peuvent utiliser IRequireFeature sans dÃ©pendance stricte au module des Droits. En mode monolithe de production, le vÃ©ritable FeatureCache est toujours disponible.",
      contextAwareTitle: "Filtrage contextuel des pÃ©rimÃ¨tres",
      contextAwareIntro:
        "Toutes les pages de droits (FonctionnalitÃ©s, Ã‰ditions, Permissions) sont contextuelles. Le frontend dÃ©tecte si l'utilisateur est un administrateur systÃ¨me (tenantId est null), un administrateur de locataire ou en mode drill-down, et appelle des endpoints backend diffÃ©rents en consÃ©quence. Les administrateurs systÃ¨me voient le catalogue complet avec CRUD ; les administrateurs de locataires voient uniquement leurs donnÃ©es effectives en mode lecture seule.",
      resolutionTip:
        "La chaÃ®ne de rÃ©solution est Ã©valuÃ©e de maniÃ¨re paresseuse (lazy) â€” les valeurs sont mises en cache aprÃ¨s la premiÃ¨re rÃ©solution et invalidÃ©es lorsque les abonnements, les Ã©ditions ou les surcharges changent.",
      cqrsMapTitle: "Carte des Commandes et RequÃªtes CQRS",
      cqrsMapIntro:
        "Le module des Droits enregistre 31 gestionnaires (handlers) SCRIPE mediator couvrant les quatre domaines. Chaque commande possÃ¨de un validateur FluentValidation correspondant pour la validation des entrÃ©es.",
      diTitle: "Enregistrement de l'Injection de DÃ©pendances",
      diIntro:
        "Tous les services de Droits sont enregistrÃ©s via la mÃ©thode d'extension AddEntitlementsModule dans DependencyInjection.cs. Le module suit le modÃ¨le d'enregistrement standard de SCRIPE.",
      comparisonTitle: "Avec vs Sans Droits",
      comparisonIntro:
        "Le tableau suivant montre la diffÃ©rence de capacitÃ©s lorsque le module des Droits est activÃ© par rapport Ã  une exÃ©cution sans celui-ci :",
      gettingStartedTitle: "Premiers Pas",
      gettingStartedIntro:
        "Suivez ces 5 Ã©tapes pour configurer le systÃ¨me de Droits pour votre plateforme. Chaque Ã©tape s'appuie sur la prÃ©cÃ©dente :",
      quotaGatingTitle: "Contrôle des quotas et réservations de créneaux",
      quotaGatingIntro:
        "Les fonctionnalités numériques représentent des quotas appliqués lors de la création des ressources du locataire. SCRIPE utilise un modèle de réservation atomique sécurisé pour gérer ces limites.",
      quotaGatingNote:
        "La méthode TryReserveSlotAsync de QuotaCounterRepository incrémente le compteur réservé. Le gestionnaire confirme cette réservation en cas de succès ou la libère en cas d'échec.",
    },
    editions: {
      title: "Ã‰ditions",
      description:
        "Plans d'abonnement nommÃ©s avec regroupements de fonctionnalitÃ©s, politiques de dÃ©passement (overflow), versionnage et stratÃ©gies de dÃ©ploiement.",
      intro:
        "Les Ã‰ditions sont des plans nommÃ©s (ex. Basic, Pro, Enterprise) qui regroupent des valeurs de fonctionnalitÃ©s. Chaque locataire souscrit Ã  une Ã©dition, ce qui dÃ©termine son accÃ¨s aux fonctionnalitÃ©s. Les Ã©ditions prennent en charge le versionnage avec des stratÃ©gies de dÃ©ploiement contrÃ´lÃ©es pour une mise en production sÃ©curisÃ©e des changements.",
      entityTitle: "EntitÃ© Ã‰dition",
      entityIntro:
        "Une Ã‰dition est un plan nommÃ© qui regroupe des valeurs de fonctionnalitÃ©s. Les Ã©ditions systÃ¨me sont crÃ©Ã©es par les administrateurs de la plateforme ; les Ã©ditions de dÃ©tail (retail) sont crÃ©Ã©es par les locataires revendeurs pour leurs sous-locataires.",
      overflowTitle: "Politique de DÃ©passement (Overflow Policy)",
      overflowIntro:
        "Lorsqu'un locataire passe Ã  une Ã©dition avec des limites infÃ©rieures (rÃ©trogradation), ses ressources existantes peuvent dÃ©passer les nouvelles limites. La politique de dÃ©passement dÃ©termine ce qui se passe :",
      featuresTitle: "FonctionnalitÃ©s de l'Ã‰dition",
      featuresIntro:
        "Chaque Ã©dition contient un ensemble d'enregistrements EditionFeature qui associent les fonctionnalitÃ©s Ã  leurs valeurs au sein de ce plan. Les fonctionnalitÃ©s qui ne sont pas explicitement dÃ©finies dans une Ã©dition reviennent Ã  Feature.DefaultValue.",
      versionsTitle: "Versions de l'Ã‰dition",
      versionsIntro:
        "Les Versions d'Ã‰dition fournissent un systÃ¨me de versionnage et de dÃ©ploiement pour les changements de fonctionnalitÃ©s. Au lieu de modifier les fonctionnalitÃ©s directement, les administrateurs peuvent crÃ©er une nouvelle version (instantanÃ©), choisir une stratÃ©gie de dÃ©ploiement et la publier.",
      rolloutTitle: "StratÃ©gies de DÃ©ploiement",
      rolloutIntro:
        "Lors de la publication d'une version d'Ã©dition, les administrateurs choisissent comment les changements sont dÃ©ployÃ©s pour les locataires abonnÃ©s :",
      workflowTitle: "Appliquer Maintenant vs Enregistrer comme Version",
      workflowIntro:
        "SCRIPE offre deux faÃ§ons de mettre Ã  jour les fonctionnalitÃ©s d'une Ã©dition, chacune adaptÃ©e Ã  des scÃ©narios diffÃ©rents :",
      workflowTip:
        "Utilisez 'Appliquer Maintenant' pour les correctifs urgents et les petits changements. Utilisez 'Enregistrer comme Version' pour les mises Ã  jour majeures du plan qui nÃ©cessitent un dÃ©ploiement progressif et une piste d'audit.",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      endpointsIntro:
        "Le contrÃ´leur des Ã‰ditions expose 11 endpoints pour gÃ©rer les Ã©ditions, leurs fonctionnalitÃ©s et le cycle de vie des versions :",
      drillDownTitle: "Comportement du Drill-Down",
      drillDownIntro:
        "Lorsqu'un administrateur systÃ¨me descend dans un locataire (drill-down), la liste des Ã©ditions est automatiquement limitÃ©e aux Ã©ditions visibles par ce locataire. Le backend utilise l'en-tÃªte X-Tenant-Context pour le filtrage : Ã©ditions systÃ¨me + Ã©ditions de dÃ©tail crÃ©Ã©es par le locataire sÃ©lectionnÃ©. Le frontend masque les actions CRUD en mode drill-down.",
      scopingTitle: "Ã‰ditions SystÃ¨me vs DÃ©tail (Retail)",
      scopingIntro:
        "SCRIPE prend en charge deux types d'Ã©ditions : Les Ã©ditions SystÃ¨me, crÃ©Ã©es par les administrateurs de la plateforme et visibles par tous les locataires, et les Ã©ditions de DÃ©tail (Retail), crÃ©Ã©es par les locataires revendeurs uniquement pour leurs sous-locataires.",
      scopingNote:
        "Les administrateurs de locataires ne voient que les Ã©ditions systÃ¨me plus leurs propres Ã©ditions de dÃ©tail. Cela garantit l'isolation des Ã©ditions entre les locataires revendeurs.",
      featuresTip:
        "Les fonctionnalitÃ©s non dÃ©finies explicitement dans une Ã©dition reviennent Ã  Feature.DefaultValue. Vous n'avez besoin de configurer que les fonctionnalitÃ©s qui diffÃ¨rent de la valeur par dÃ©faut globale.",
      endpointsList: "Lister toutes les Ã©ditions (paginÃ©, filtrable)",
      endpointsGet: "Obtenir les dÃ©tails de l'Ã©dition par ID",
      endpointsCreate: "CrÃ©er une nouvelle Ã©dition",
      endpointsUpdate: "Mettre Ã  jour les mÃ©tadonnÃ©es de l'Ã©dition",
      endpointsDelete: "Suppression logique (soft-delete) d'une Ã©dition",
      endpointsGetFeatures: "Lister les fonctionnalitÃ©s configurÃ©es pour cette Ã©dition",
      endpointsSetFeatures: "DÃ©finir/mettre Ã  jour les fonctionnalitÃ©s pour cette Ã©dition",
      endpointsDirectApply:
        "Appliquer les changements de fonctionnalitÃ©s immÃ©diatement (sans versionnage)",
      endpointsGetVersions: "Lister toutes les versions pour cette Ã©dition",
      endpointsCreateVersion:
        "CrÃ©er un nouveau brouillon de version avec un instantanÃ© des fonctionnalitÃ©s",
      endpointsPublishVersion:
        "Publier une version brouillon avec la stratÃ©gie de dÃ©ploiement choisie",
      seededTitle: "Éditions système prédéfinies",
      seededIntro:
        "La plateforme initialise deux éditions système standard au démarrage via EditionSeeder, établissant les limites par défaut des fonctionnalités.",
    },
    subscriptions: {
      title: "Abonnements",
      description:
        "Liaison locataire-Ã©dition avec gestion complÃ¨te du cycle de vie, tarification multi-devises, promotions, essais, rÃ©trogradations (downgrades), comportement d'expiration et export analytique avancÃ©.",
      intro:
        "Les abonnements lient les locataires aux Ã©ditions (plans). Chaque locataire a un abonnement de base qui dÃ©termine son Ã©dition, et Ã©ventuellement des abonnements complÃ©mentaires pour des capacitÃ©s supplÃ©mentaires. Le systÃ¨me d'abonnement gÃ¨re l'ensemble du cycle de vie, de l'attribution au renouvellement, en passant par la rÃ©trogradation, la suspension et l'annulation â€” avec une tarification multi-devises intÃ©grÃ©e et un suivi des remises promotionnelles.",
      entityTitle: "EntitÃ© Abonnement",
      entityIntro:
        "Une TenantSubscription (Abonnement Locataire) lie un locataire Ã  une Ã©dition avec un suivi du cycle de vie. Elle prend en charge plusieurs types et statuts d'abonnement pour une gestion complÃ¨te du cycle de vie.",
      typesTitle: "Types d'Abonnements",
      typesIntro:
        "Chaque abonnement a un type qui dÃ©termine son cycle de facturation et son comportement :",
      lifecycleTitle: "Cycle de vie des Statuts",
      lifecycleIntro:
        "Les abonnements passent par une sÃ©rie de statuts au cours de leur cycle de vie :",
      downgradeTitle: "Suivi des RÃ©trogradations (Downgrades)",
      downgradeIntro:
        "Lorsqu'un locataire est rÃ©trogradÃ© (manuellement ou en raison d'une expiration), le systÃ¨me conserve les dÃ©tails de l'abonnement d'origine pour l'audit et une Ã©ventuelle restauration. Les champs DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate et DowngradedAt prÃ©servent l'historique complet de la rÃ©trogradation.",
      downgradeWarning:
        "Lors d'une rÃ©trogradation, la Politique de DÃ©passement (OverflowPolicy) de l'Ã©dition cible dÃ©termine ce qu'il advient des ressources qui dÃ©passent les nouvelles limites. Utilisez toujours l'endpoint d'Impact de RÃ©trogradation pour prÃ©visualiser les effets avant d'effectuer des changements.",
      expiryTitle: "Comportement d'Expiration",
      expiryIntro:
        "Lorsqu'un abonnement expire, le paramÃ¨tre ExpiryBehavior dÃ©termine ce qui se passe ensuite :",
      pricingTitle: "Tarification Multi-Devises",
      pricingIntro:
        "Chaque abonnement porte des mÃ©tadonnÃ©es de tarification complÃ¨tes : Devise (code ISO), MontantDeBase, MontantAjustement, MontantTotal, TauxDeChangeEnUsd et MontantTotalUsd. Cela permet un suivi prÃ©cis des revenus Ã  travers 9+ devises prises en charge (USD, EUR, GBP, SAR, AED, EGP, TRY, INR, et plus).",
      exchangeRateTitle: "Normalisation en USD",
      exchangeRateIntro:
        "Tous les montants sont normalisÃ©s en USD via ExchangeRateToUsd pour des rapports MRR/ARR cohÃ©rents. Le champ TotalAmountUsd est calculÃ© au moment de l'abonnement et stockÃ© pour une prÃ©cision historique â€” les fluctuations de taux de change ne modifient pas rÃ©troactivement les enregistrements passÃ©s.",
      promotionsTitle: "Remises Promotionnelles",
      promotionsIntro:
        "Les abonnements prennent en charge les codes promo via le champ AppliedPromoCode. Lorsqu'une promotion valide est appliquÃ©e, un pourcentage PromotionDiscount est enregistrÃ© et le MontantAjustement reflÃ¨te la remise appliquÃ©e au MontantDeBase. Les promotions sont suivies par abonnement pour l'audit et l'analyse.",
      exportTitle: "Export et Reporting AvancÃ©s",
      exportIntro:
        "Le systÃ¨me d'export des abonnements gÃ©nÃ¨re des rapports complets aux formats CSV, Excel (XLSX) et PDF. Chaque rapport comprend une page de couverture avec les mÃ©tadonnÃ©es de filtrage, des tableaux de donnÃ©es colorÃ©s et des rÃ©sumÃ©s statistiques.",
      exportFiltersTitle: "Filtres d'Export",
      exportFiltersIntro:
        "Les rapports prennent en charge des filtres avancÃ©s pour des analyses ciblÃ©es :",
      exportFilterDate:
        "Plage de dates â€” filtrer par date de crÃ©ation de l'abonnement (7/30/90 derniers jours, derniÃ¨re annÃ©e ou plage personnalisÃ©e)",
      exportFilterExpiring:
        "Expire bientÃ´t â€” trouver les abonnements expirant dans 5/7/14/30/60/90 jours",
      exportFilterStatus: "Statut â€” Actif, Suspendu, AnnulÃ©, ExpirÃ©",
      exportFilterEdition: "Ã‰dition â€” filtrer par plan/Ã©dition spÃ©cifique",
      exportFilterCurrency: "Devise â€” afficher les montants dans la devise sÃ©lectionnÃ©e",
      exportDaysLeftTitle: "Jours Restants Avant Expiration",
      exportDaysLeftIntro:
        "Les rapports incluent une colonne 'Jours Restants' calculÃ©e avec un codage couleur conditionnel : rouge (â‰¤7 jours), jaune (â‰¤30 jours), vert (>30 jours). Cela permet d'identifier en un coup d'Å“il les abonnements nÃ©cessitant une attention de renouvellement.",
      exportFormatsTitle: "DÃ©tails des Formats d'Export",
      exportFormatCsv: "CSV â€” lÃ©ger, importable dans tout tableur ou outil BI",
      exportFormatExcel:
        "XLSX â€” classeur Excel professionnel avec en-tÃªtes stylisÃ©s, feuille de mÃ©tadonnÃ©es de filtre, mise en forme conditionnelle et colonnes Ã  taille automatique (ClosedXML)",
      exportFormatPdf:
        "PDF â€” document prÃªt Ã  imprimer avec page de couverture associÃ©e Ã  la marque, rÃ©sumÃ© statistique et tableaux de donnÃ©es paginÃ©s (QuestPDF)",
      renewalTitle: "Renouvellement â€” ModÃ¨le Nouvelle Ligne (B2)",
      renewalIntro:
        "Les renouvellements crÃ©ent une NOUVELLE ligne TenantSubscription au lieu d'Ã©craser l'enregistrement existant (modÃ¨le Stripe). L'ancien abonnement est marquÃ© ExpirÃ© (IsActive=false), tandis qu'une nouvelle ligne est crÃ©Ã©e avec un nouvel Id, StartDate=UtcNow, une tarification recalculÃ©e et les dÃ©tails promotionnels reportÃ©s.",
      renewalAuditTitle: "Piste d'Audit des Revenus",
      renewalAuditIntro:
        "Chaque cycle de facturation produit sa propre ligne immuable en base de donnÃ©es avec une tarification figÃ©e au moment du renouvellement. Cela permet des rapports financiers prÃ©cis : tendances MRR, analyse du taux d'attrition par pÃ©riode et suivi des remboursements par cycle.",
      promoExpiryTitle: "Suivi d'Expiration des Promotions (A1)",
      promoExpiryIntro:
        "Lorsqu'une promotion avec DurationDays > 0 est appliquÃ©e, le systÃ¨me calcule un horodatage PromotionExpiresAt. Ã€ chaque renouvellement, le gestionnaire vÃ©rifie si UtcNow > PromotionExpiresAt â€” si la promotion a expirÃ©, la remise est supprimÃ©e et NON reportÃ©e sur la nouvelle ligne d'abonnement.",
      concurrencyTitle: "Concurrence Optimiste (E1)",
      concurrencyIntro:
        "Chaque TenantSubscription possÃ¨de un ConcurrencyStamp (Guid) avec [ConcurrencyCheck]. Le tampon est renouvelÃ© Ã  chaque opÃ©ration d'Ã©criture. Cela prÃ©vient les conditions de course â€” par exemple, une annulation concurrente + un travail de rapprochement â€” en levant une DbUpdateConcurrencyException en cas de collision.",
      validationTitle: "Validation des EntrÃ©es (G1)",
      validationIntro:
        "Les 8 commandes d'abonnement disposent de validateurs FluentValidation dÃ©diÃ©s. Les validateurs utilisent ILocalizer pour des messages d'erreur localisÃ©s (EN + AR). RÃ¨gles mÃ©tier : pas de renouvellement en essai, montants de remboursement positifs, limites de longueur de texte.",
      crossModuleTitle: "IntÃ©gration Inter-Modules (H1)",
      crossModuleIntro:
        "Les Ã©vÃ©nements du cycle de vie d'abonnement publient des Ã©vÃ©nements de domaine consommÃ©s par le module IdentitÃ©. Lors de la suspension d'un abonnement, tous les administrateurs du locataire sont dÃ©sactivÃ©s avec DeactivationReason='SubscriptionSuspended'. Ã€ la reprise, seuls les administrateurs dÃ©sactivÃ©s par suspension sont rÃ©activÃ©s.",
      crossModuleReasons:
        "Trois raisons de dÃ©sactivation : 'Manuel' (jamais rÃ©activÃ© automatiquement), 'SubscriptionSuspended' (rÃ©activÃ© Ã  la reprise), 'SubscriptionExpired' (dÃ©sactivÃ© Ã  l'expiration).",
      impactTitle: "Analyse d'Impact de la RÃ©trogradation",
      impactIntro:
        "Avant de modifier l'Ã©dition d'un locataire, utilisez l'endpoint d'Impact de RÃ©trogradation pour prÃ©visualiser quelles ressources seraient en dÃ©passement. La rÃ©ponse liste chaque fonctionnalitÃ© qui dÃ©passerait les limites de la nouvelle Ã©dition, ainsi que l'utilisation actuelle par rapport Ã  la nouvelle limite.",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      endpointsIntro:
        "Le contrÃ´leur des Abonnements fournit 13 endpoints couvrant l'ensemble du cycle de vie de l'abonnement :",
      operationsTitle: "OpÃ©rations sur les Abonnements",
      operationsIntro:
        "Le module d'abonnement prend en charge un ensemble complet d'opÃ©rations de cycle de vie. Chaque opÃ©ration fait passer l'abonnement Ã  un nouvel Ã©tat avec un suivi d'audit complet.",
      assignTitle: "Attribuer un Abonnement",
      assignIntro:
        "CrÃ©er un nouvel abonnement liant un locataire Ã  une Ã©dition. Si le locataire a dÃ©jÃ  un abonnement actif, le prÃ©cÃ©dent est automatiquement annulÃ©. Prend en charge les paramÃ¨tres optionnels de devise, code promo et comportement d'expiration.",
      upgradeTitle: "Mise Ã  niveau (Upgrade) & RÃ©trogradation (Downgrade)",
      upgradeIntro:
        "Les locataires peuvent passer d'une Ã©dition Ã  l'autre. Les mises Ã  niveau s'appliquent immÃ©diatement et les fonctionnalitÃ©s de la nouvelle Ã©dition prennent effet sur-le-champ. Les rÃ©trogradations vÃ©rifient d'abord la OverflowPolicy pour gÃ©rer les ressources qui dÃ©passent les nouvelles limites.",
      trialTitle: "Conversion d'Essai",
      trialIntro:
        "Les abonnements d'essai ont une TrialEndDate (Date de fin d'essai). Lorsqu'un essai est mis Ã  niveau vers un plan payant, IsTrialConverted est dÃ©fini sur true et l'abonnement passe au nouveau type. Si l'essai expire sans conversion, ExpiryBehavior dÃ©termine ce qui se passe ensuite.",
      ep: {
        list: "Lister tous les abonnements (paginÃ©, filtrable par statut/type/locataire)",
        get: "Obtenir les dÃ©tails de l'abonnement par ID",
        assign:
          "CrÃ©er un nouvel abonnement (attribuer un locataire Ã  une Ã©dition avec devise/promo)",
        upgrade: "Mettre Ã  niveau vers une Ã©dition supÃ©rieure",
        downgrade: "RÃ©trograder vers une Ã©dition infÃ©rieure (vÃ©rifie la OverflowPolicy)",
        impact: "PrÃ©visualiser l'impact de la rÃ©trogradation avant exÃ©cution",
        suspend: "Suspendre l'abonnement (bloquer l'accÃ¨s du locataire)",
        resume: "Reprendre un abonnement suspendu",
        cancel: "Annuler dÃ©finitivement l'abonnement",
        renew: "Renouveler un abonnement arrivant Ã  expiration",
        tenantActive: "Obtenir l'abonnement actif pour un locataire spÃ©cifique",
        export: "Exporter les abonnements en CSV, Excel ou PDF avec des filtres avancÃ©s",
      },
    },
    features: {
      title: "FonctionnalitÃ©s (Features)",
      description:
        "CapacitÃ©s contrÃ´lables de la plateforme avec des types de valeurs BoolÃ©en, NumÃ©rique et ChaÃ®ne de caractÃ¨res.",
      intro:
        "Les fonctionnalitÃ©s sont les Ã©lÃ©ments de base atomiques du systÃ¨me de Droits. Chaque fonctionnalitÃ© reprÃ©sente une capacitÃ© contrÃ´lable â€” un commutateur boolÃ©en, un quota numÃ©rique ou une configuration textuelle. Les fonctionnalitÃ©s ont une clÃ© systÃ¨me stable (Name) qui ne change jamais, ce qui permet de les rÃ©fÃ©rencer en toute sÃ©curitÃ© dans le code.",
      entityTitle: "EntitÃ© FonctionnalitÃ©",
      entityIntro:
        "Une FonctionnalitÃ© (Feature) dÃ©finit une capacitÃ© contrÃ´lable de la plateforme. Le champ Name est une clÃ© systÃ¨me stable utilisÃ©e dans le code ; DisplayNameEn/DisplayNameAr sont des libellÃ©s destinÃ©s aux utilisateurs.",
      valueTypesTitle: "Types de Valeurs",
      valueTypesIntro:
        "Les valeurs des fonctionnalitÃ©s sont stockÃ©es sous forme de chaÃ®nes (strings) mais interprÃ©tÃ©es selon leur ValueType. Le systÃ¨me valide les valeurs par rapport au type attendu lors de la crÃ©ation et de la mise Ã  jour.",
      valueTypesTip:
        "Pour les fonctionnalitÃ©s NumÃ©riques, utilisez -1 pour reprÃ©senter 'illimitÃ©'. Le FeatureCheckBehavior reconnaÃ®t -1 comme une valeur spÃ©ciale et ne bloque jamais les requÃªtes pour les fonctionnalitÃ©s ayant un quota illimitÃ©.",
      systemVsCustomTitle: "FonctionnalitÃ©s SystÃ¨me vs PersonnalisÃ©es",
      systemVsCustomIntro:
        "SCRIPE fait la distinction entre les fonctionnalitÃ©s systÃ¨me (insÃ©rÃ©es au dÃ©marrage, en lecture seule) et les fonctionnalitÃ©s personnalisÃ©es (crÃ©Ã©es par les administrateurs via l'API) :",
      cacheTitle: "Cache des FonctionnalitÃ©s",
      cacheIntro:
        "Les valeurs de fonctionnalitÃ©s rÃ©solues sont mises en cache dans le IFeatureCache pour Ã©viter des requÃªtes Ã  la base de donnÃ©es Ã  chaque demande. Le cache est invalidÃ© chaque fois que les fonctionnalitÃ©s d'une Ã©dition changent, qu'un abonnement est modifiÃ© ou qu'une surcharge est dÃ©finie/supprimÃ©e. Dans les dÃ©ploiements de microservices sans le module des Droits, un NoOpFeatureCache traite toutes les fonctionnalitÃ©s comme activÃ©es.",
      requireFeatureTitle: "Interface IRequireFeature",
      requireFeatureIntro:
        "Pour conditionner une commande ou une requÃªte CQRS Ã  une fonctionnalitÃ©, implÃ©mentez l'interface de marquage IRequireFeature. Le comportement du pipeline FeatureCheckBehavior rÃ©sout automatiquement la valeur actuelle pour le locataire et rejette la requÃªte si la fonctionnalitÃ© est dÃ©sactivÃ©e.",
      requireFeatureNote:
        "IRequireFeature fonctionne Ã  la fois pour les fonctionnalitÃ©s BoolÃ©ennes (vÃ©rifiÃ©es comme activÃ©es/dÃ©sactivÃ©es) et les fonctionnalitÃ©s NumÃ©riques (vÃ©rifiÃ©es selon le quota restant). Le comportement dÃ©termine automatiquement le type de vÃ©rification Ã  partir du Feature.ValueType.",
      contextAwareTitle: "Affichage contextuel des fonctionnalitÃ©s",
      contextAwareIntro:
        "La liste des fonctionnalitÃ©s est contextuelle. Les administrateurs systÃ¨me voient le catalogue complet des fonctionnalitÃ©s avec les opÃ©rations CRUD. Les administrateurs de locataires et les sessions en drill-down ne voient que les fonctionnalitÃ©s effectives du locataire (rÃ©solues Ã  partir de l'Ã©dition + surcharges) en mode lecture seule. Tout le filtrage de pÃ©rimÃ¨tre se fait cÃ´tÃ© backend via GET /features (catalogue) vs GET /features/effective (scoped au locataire).",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      endpointsIntro:
        "Le contrÃ´leur des FonctionnalitÃ©s expose 5 endpoints CRUD. Les fonctionnalitÃ©s systÃ¨me ne peuvent pas Ãªtre supprimÃ©es :",
      seedingTitle: "Initialisation des FonctionnalitÃ©s (Seeding)",
      seedingIntro:
        "Les fonctionnalitÃ©s systÃ¨me sont automatiquement initialisÃ©es (seeded) au dÃ©marrage de l'application par EntitlementsStartupSeeder. L'initialiseur vÃ©rifie si chaque fonctionnalitÃ© systÃ¨me existe dÃ©jÃ  (par son Nom) et ne crÃ©e que celles qui manquent â€” les fonctionnalitÃ©s existantes ne sont jamais Ã©crasÃ©es.",
      quotaTitle: "Suivi des Quotas (QuotaCounter)",
      quotaIntro:
        "Les fonctionnalitÃ©s numÃ©riques prennent en charge l'application automatique des quotas via l'entitÃ© QuotaCounter. Le FeatureCheckBehavior vÃ©rifie l'utilisation actuelle par rapport Ã  la limite rÃ©solue pour chaque commande IRequireFeature ciblant une fonctionnalitÃ© numÃ©rique.",
      cacheNote:
        "Le cache est automatiquement invalidÃ© lorsque : (1) les fonctionnalitÃ©s d'une Ã©dition sont modifiÃ©es, (2) un abonnement est attribuÃ©/modifiÃ©, (3) une surcharge est dÃ©finie/supprimÃ©e. Aucune purge manuelle du cache n'est nÃ©cessaire.",
      patternTitle: "ModÃ¨le IRequireFeature",
      patternIntro:
        "Pour conditionner n'importe quelle commande CQRS derriÃ¨re une vÃ©rification de fonctionnalitÃ©, implÃ©mentez simplement l'interface de marquage IRequireFeature. Le FeatureCheckBehavior intercepte automatiquement la requÃªte, rÃ©sout la valeur de la fonctionnalitÃ© pour le locataire, et la rejette si elle est dÃ©sactivÃ©e ou si le quota est dÃ©passÃ©.",
      ep: {
        list: "Lister toutes les fonctionnalitÃ©s (paginÃ©, filtrable par catÃ©gorie/type)",
        get: "Obtenir les dÃ©tails de la fonctionnalitÃ© par ID",
        create: "CrÃ©er une nouvelle fonctionnalitÃ© personnalisÃ©e",
        update:
          "Mettre Ã  jour les mÃ©tadonnÃ©es de la fonctionnalitÃ© (fonctionnalitÃ©s systÃ¨me : DefaultValue/Description uniquement)",
        delete:
          "Suppression logique d'une fonctionnalitÃ© personnalisÃ©e (les fonctionnalitÃ©s systÃ¨me ne peuvent pas Ãªtre supprimÃ©es)",
      },
    },
    overrides: {
      title: "Surcharges de FonctionnalitÃ©s (Overrides)",
      description:
        "Personnalisation des valeurs de fonctionnalitÃ©s par locataire qui contourne les valeurs par dÃ©faut de l'Ã©dition.",
      intro:
        "Les Surcharges (Overrides) de fonctionnalitÃ©s permettent aux administrateurs de la plateforme de personnaliser les valeurs des fonctionnalitÃ©s pour des locataires individuels, indÃ©pendamment de leur Ã©dition souscrite. Les surcharges ont la plus haute prioritÃ© dans la chaÃ®ne de rÃ©solution, ce qui les rend parfaites pour des accords commerciaux sur mesure, des promotions spÃ©ciales ou des exceptions ponctuelles.",
      entityTitle: "EntitÃ© Surcharge",
      entityIntro:
        "Un TenantFeatureOverride dÃ©finit une valeur personnalisÃ©e pour une fonctionnalitÃ© spÃ©cifique sur un locataire spÃ©cifique. Il inclut un champ optionnel Reason (Raison) Ã  des fins d'audit.",
      priorityTitle: "PrioritÃ© de RÃ©solution",
      priorityIntro:
        "Les surcharges se trouvent en haut de la chaÃ®ne de rÃ©solution. Lorsque le systÃ¨me rÃ©sout une valeur de fonctionnalitÃ© pour un locataire, il vÃ©rifie d'abord l'existence d'une surcharge :",
      whenTitle: "Quand utiliser les Surcharges",
      whenIntro:
        "Les surcharges sont conÃ§ues pour des cas exceptionnels oÃ¹ un locataire a besoin d'une valeur diffÃ©rente de celle fournie par son Ã©dition :",
      useCase1:
        "Accords d'entreprise personnalisÃ©s â€” 'Donner Ã  Acme Corp 500 administrateurs au lieu des 50 standards'",
      useCase2:
        "Offres promotionnelles â€” 'Activer le Chat Premium pour ce locataire pendant 30 jours'",
      useCase3:
        "Tests BÃªta â€” 'Activer le nouveau module de Facturation pour les premiers adoptants (early adopters)'",
      useCase4:
        "Augmentation temporaire â€” 'Augmenter la limite de tÃ©lÃ©chargement de fichiers pendant leur migration'",
      overuseWarning:
        "Les surcharges doivent Ãªtre utilisÃ©es avec parcimonie. Si de nombreux locataires ont besoin de la mÃªme surcharge, envisagez plutÃ´t de crÃ©er une nouvelle Ã©dition. Des surcharges excessives rendent le systÃ¨me plus difficile Ã  gÃ©rer et Ã  auditer.",
      resolvedTitle: "Endpoint des FonctionnalitÃ©s RÃ©solues",
      resolvedIntro:
        "L'endpoint GET /api/v1/tenants/{tenantId}/features/resolved renvoie la valeur finale et effective de chaque fonctionnalitÃ© pour un locataire donnÃ©. Il affiche la source de rÃ©solution (Surcharge, Ã‰dition ou DÃ©faut) pour chaque entrÃ©e, facilitant ainsi le dÃ©bogage et l'audit.",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      endpointsIntro:
        "Le contrÃ´leur TenantFeatures expose 4 endpoints pour gÃ©rer les surcharges par locataire et les valeurs rÃ©solues :",
      scenariosTitle: "ScÃ©narios d'Utilisation",
      scenariosIntro:
        "Les scÃ©narios rÃ©els suivants montrent quand les surcharges apportent le plus de valeur :",
      settingTitle: "DÃ©finir une Surcharge",
      settingIntro:
        "Pour dÃ©finir une surcharge, envoyez une requÃªte POST Ã  l'endpoint des fonctionnalitÃ©s du locataire avec l'ID de la fonctionnalitÃ©, la valeur personnalisÃ©e et une raison optionnelle Ã  des fins d'audit.",
      settingTip:
        "Incluez toujours une raison lors de la dÃ©finition des surcharges â€” cela donne du sens aux pistes d'audit et aide les futurs administrateurs Ã  comprendre pourquoi la surcharge a Ã©tÃ© appliquÃ©e.",
      expiryTitle: "Surcharges Expirables",
      expiryIntro:
        "Les surcharges peuvent avoir une date d'expiration (ExpiresAt) optionnelle. Lorsque la date d'expiration est passÃ©e, la surcharge est automatiquement dÃ©sactivÃ©e et la fonctionnalitÃ© revient Ã  la valeur de l'Ã©dition (ou Ã  la valeur par dÃ©faut globale).",
      expiryNote:
        "Les surcharges expirÃ©es sont dÃ©sactivÃ©es de maniÃ¨re logique (IsActive = false), et non supprimÃ©es. Cela prÃ©serve la piste d'audit et permet une rÃ©activation si nÃ©cessaire.",
      auditTitle: "Piste d'Audit",
      auditIntro:
        "Chaque opÃ©ration de surcharge est suivie avec des informations d'audit complÃ¨tes. Le champ Raison (Reason) de chaque surcharge fournit le contexte expliquant pourquoi la valeur personnalisÃ©e a Ã©tÃ© appliquÃ©e.",
      bestPracticesTitle: "Bonnes Pratiques",
      bestPracticesIntro:
        "Suivez ces directives pour garder votre systÃ¨me de surcharges maintenable et auditable.",
      bestPracticesWarning:
        "Les surcharges doivent Ãªtre utilisÃ©es avec parcimonie. Si de nombreux locataires ont besoin de la mÃªme surcharge, envisagez plutÃ´t de crÃ©er une nouvelle Ã©dition. L'abus de surcharges rend le systÃ¨me plus difficile Ã  gÃ©rer et crÃ©e une dette technique de maintenance.",
      historyTitle: "Historique des Surcharges",
      historyIntro:
        "Le systÃ¨me conserve un historique complet des modifications de surcharges, permettant d'identifier qui a effectuÃ© une modification et pourquoi.",
      bulkTitle: "Gestion en Masse",
      bulkIntro:
        "Les administrateurs peuvent appliquer des surcharges Ã  plusieurs locataires simultanÃ©ment pour des mises Ã  jour rapides Ã  l'Ã©chelle de la plateforme.",
      importTitle: "Import/Export de Surcharges",
      importIntro:
        "Prise en charge de l'importation de surcharges via des fichiers CSV pour les configurations complexes nÃ©cessitant une prÃ©paration hors ligne.",
      validationTitle: "Validation des Surcharges",
      validationIntro:
        "Les nouvelles surcharges sont validÃ©es par rapport aux limites de l'Ã©dition actuelle pour prÃ©venir toute configuration invalide.",
      errorTitle: "Gestion des Erreurs",
      errorIntro:
        "Les erreurs de rÃ©solution des surcharges sont journalisÃ©es avec des dÃ©tails sur la fonctionnalitÃ© en conflit et le contexte du locataire pour un dÃ©pannage rapide.",
      ep: {
        list: "Lister toutes les dÃ©rogations pour un locataire spÃ©cifique",
        set: "DÃ©finir ou mettre Ã  jour une dÃ©rogation de fonctionnalitÃ© pour un locataire",
        remove: "Supprimer (dÃ©sactiver) une dÃ©rogation de fonctionnalitÃ©",
        resolved:
          "Obtenir toutes les valeurs de fonctionnalitÃ©s rÃ©solues pour un locataire (affiche la source : DÃ©rogation/Ã‰dition/DÃ©faut)",
      },
    },

    // ── Plugins Module (Phase 15) ────────────────────────────
    plugins: {
      overview: {
        title: "Module de Conformité",
        description:
          "Automatisation de la conformité au RGPD, CCPA et PDPA — réglementations, traitement des DSR, gestion du consentement, rétention des données, inventaire et génération de rapports.",
        intro:
          "Le module de Conformité est le moteur de conformité réglementaire intégré de SCRIPE. Il aide les opérateurs de plateformes et leurs locataires à se conformer aux principales lois sur la protection des données (RGPD, CCPA, PDPA) via des outils automatisés pour gérer les demandes des personnes concernées, les registres de consentement, les politiques de rétention et générer des rapports de conformité prêts pour l'audit.",
        infoTitle: "Avis de Conformité",
        infoContent:
          "Le module de Conformité est essentiel pour maintenir le respect des réglementations et éviter les amendes. Assurez-vous que toutes les fonctionnalités sont correctement mappées aux politiques de traitement des données.",
        featureDsr: "Demandes des Personnes Concernées (DSR)",
        featureDsrDesc:
          "Gère les demandes des personnes concernées, y compris l'Exportation, la Suppression, la Rectification et la Restriction avec suivi complet du cycle de vie et surveillance du SLA.",
        featureConsent: "Gestion du Consentement",
        featureConsentDesc:
          "Suivi immuable des états de consentement, instantanés et pistes d'audit pour la conformité à l'Article 6 du RGPD et à la CCPA.",
        featureRetention: "Politiques de Rétention",
        featureRetentionDesc:
          "Applique des politiques de destruction des données basées sur des périodes de rétention configurables avec des actions automatisées de Suppression ou d'Anonymisation.",
        featureInventory: "Inventaire des Données",
        featureInventoryDesc:
          "Cartographie les emplacements sensibles des PII à travers les modules, reqscripe pour le Registre des Activités de Traitement (RoPA) de l'Article 30 du RGPD.",
        featureReports: "Rapports de Conformité",
        featureReportsDesc:
          "Génère des rapports asynchrones prêts pour l'audit (Aperçu RGPD, Résumé DSR, Audit du Consentement, Analyse de la Rétention, Exportation de l'Inventaire).",
        featureWebhooks: "Événements Webhook",
        featureWebhooksDesc:
          "11 événements webhook en temps réel couvrant le cycle de vie des DSR, les changements de consentement, l'application de la rétention et la génération de rapports.",
        descDsr:
          "Gère les demandes des personnes concernées (Exportation, Suppression, Rectification)",
        descConsent: "Suivi immuable des états de consentement et instantanés",
        descRet: "Applique des politiques de destruction des données basées sur l'âge",
        descInv: "Cartographie les emplacements sensibles des PII dans tous les modules",
        descRep: "Génère des rapports de conformité RoPA et DPIA",
        descId: "Module d'Identité",
        descIdDesc: "Fournit le contexte Utilisateur/Administrateur et l'Authentification",
        descEnt: "Module d'Autorisations",
        descEntDesc: "Contrôle les capacités de conformité via des portes de fonctionnalités",
        conn1: "initie les demandes",
        conn2: "accorde/révoque",
        conn3: "contrôle les politiques",
        conn4: "guide la suppression",
        conn5: "cible les données",
        conn6: "pistes d'audit",
        conn7: "pistes d'audit",
        th1: "Composant",
        th2: "Responsabilité",
        tr1_1: "DsrListViewModel",
        tr1_2:
          "Gère la pagination, le filtrage et l'attribution des demandes de droits des personnes concernées entrantes.",
        tr2_1: "ConsentRecordView",
        tr2_2:
          "Affiche l'instantané de consentement immuable aux côtés de l'agent utilisateur et des métadonnées de timestamp.",
        whatIsTitle: "Qu'est-ce que le Module de Conformité ?",
        whatIsIntro:
          "Le module de Conformité fournit six sous-systèmes interconnectés qui couvrent le cycle de vie complet de conformité. Au lieu de concevoir des outils de conformité de toutes pièces, les locataires de SCRIPE bénéficient d'un système prêt pour la production qui suit, automatise et rend compte de leurs obligations de protection des données.",
        subModulesTitle: "Six Sous-Systèmes",
        subModulesIntro: "Chaque sous-système gère un domaine de conformité spécifique :",
        sub1: "Profils Réglementaires — Stocke les cadres réglementaires (RGPD, CCPA, PDPA) sous lesquels la plateforme opère.",
        sub2: "Demandes des Personnes Concernées (DSR) — Gère les demandes de droits des personnes concernées (exportation, suppression, rectification, restriction).",
        sub3: "Gestion du Consentement — Enregistre, suit et audite les octrois et retraits de consentement des utilisateurs.",
        sub4: "Politiques de Rétention des Données — Définit combien de temps les données sont conservées et ce qui se passe à l'expiration (suppression ou anonymisation).",
        sub5: "Inventaire des Données — Un registre de toutes les catégories de données personnelles traitées par la plateforme.",
        sub6: "Rapports de Conformité — Génère des rapports asynchrones prêts pour l'audit (Aperçu RGPD, Résumé DSR, Audit du Consentement, etc.).",
        regulationsTitle: "Réglementations Prises en Charge",
        regulationsIntro:
          "Le module de Conformité de SCRIPE prend en charge l'application de ces principales réglementations de protection des données. Chaque réglementation est pré-configurée avec ses délais de SLA et ses structures de sanctions.",
        regName: "Réglementation",
        regRegion: "Région / Juridiction",
        regSla: "SLA de Réponse",
        regPenalty: "Sanction Maximale",
        regGdprRegion: "Union Européenne (UE/EEE)",
        regCcpaRegion: "Californie, États-Unis",
        regLgpdRegion: "Brésil",
        regPopiaRegion: "Afrique du Sud",
        regPdpaRegion: "Singapour",
        backendTitle: "Architecture du Backend",
        backendIntro:
          "Le backend de conformité suit la structure de module standard de 3 projets SCRIPE (Domain / Application / Infrastructure) avec un ComplianceDbContext et ComplianceController dédiés.",
        cqrsTitle: "Commandes & Requêtes CQRS",
        cqrsIntro:
          "Le module de Conformité utilise le modèle de médiateur CQRS standard de SCRIPE. Les commandes gèrent les opérations d'écriture et les requêtes gèrent les opérations de lecture, chacune ayant des validateurs FluentValidation dédiés.",
        cqrsType: "Type",
        cqrsExample: "Gestionnaire",
        cqrsDesc: "Description",
        cqrsSubmit: "Soumet une nouvelle demande DSR avec validation et calcul de SLA",
        cqrsReview: "Examine et met à jour le statut d'une DSR (approuver, rejeter, terminer)",
        cqrsConsent:
          "Enregistre un octroi de consentement avec des métadonnées d'audit complètes (IP, agent utilisateur, version)",
        cqrsRetention:
          "Met à jour la configuration de la politique de rétention (jours, action, statut actif)",
        cqrsDsrList:
          "Liste toutes les DSR avec pagination, filtrage par statut/type/réglementation",
        cqrsConsentAnalytics: "Agrège les statistiques de consentement par but, statut et période",
        cqrsDashboard:
          "Renvoie un tableau de bord de résumé avec des décomptes pour tous les sous-systèmes de conformité",
        frontendTitle: "Architecture du Frontend",
        frontendIntro:
          "Le frontend est organisé en six sous-modules indépendants sous src/modules/compliance/, chacun avec ses propres couches de domaine, de données et de présentation suivant le modèle View/ViewModel.",
        endpointsTitle: "Aperçu des Endpoints API",
        endpointsIntro:
          "Tous les points de terminaison sont sous /api/v1/compliances/ et nécessitent une authentification avec la permission compliance.view.",
        apiRegList: "Liste tous les profils réglementaires configurés pour la plateforme",
        apiDsrSubmit:
          "Soumet une nouvelle demande DSR (Exportation, Suppression, Rectification, Restriction)",
        apiDsrList: "Liste toutes les DSR avec pagination, filtrage par statut/type/réglementation",
        apiDsrReview:
          "Examine une DSR — approuver, rejeter, ou marquer comme terminée avec des notes de résolution",
        apiConsentRecord:
          "Enregistre un nouvel octroi de consentement avec des métadonnées d'audit complètes",
        apiConsentAnalytics:
          "Récupère les analyses de consentement (taux d'octroi/retrait par but)",
        apiRetentionList: "Liste toutes les politiques de rétention avec le statut d'application",
        apiRetentionUpdate: "Met à jour une politique de rétention (jours, action, statut actif)",
        apiInventoryList:
          "Liste tous les éléments de l'inventaire des données (RGPD Article 30 RoPA)",
        apiReportsList: "Liste tous les rapports de conformité avec filtres de statut et de type",
        apiReportDownload: "Télécharge un rapport généré au format CSV, JSON, XLSX ou PDF",
        apiReportGenerate:
          "Met en file d'attente un travail de génération de rapport de conformité asynchrone",
        apiDashboard:
          "Récupère le résumé du tableau de bord de conformité (décomptes, statut SLA, alertes)",
        webhooksTitle: "Événements Webhook",
        webhooksIntro:
          "Le module de Conformité déclenche 11 événements webhook en temps réel auxquels les systèmes externes peuvent s'abonner. Les événements sont enregistrés via le ComplianceWebhookEventCatalog et distribués par la pipeline IWebhookDispatcher.",
        webhookEvent: "Clé de l'Événement",
        webhookCategory: "Catégorie",
        webhookDesc: "Description",
        whDsrSubmitted: "Déclenché lors de la soumission d'une nouvelle demande DSR",
        whDsrStatusChanged:
          "Déclenché lorsque le statut d'une DSR change (En attente → En cours → Terminé/Rejeté)",
        whDsrCompleted:
          "Déclenché lorsqu'une DSR est entièrement terminée (données exportées, supprimées ou rectifiées)",
        whDsrErasure:
          "Déclenché lorsqu'une DSR de suppression est confirmée par un administrateur (action nucléaire)",
        whDsrCancelled: "Déclenché lorsqu'une DSR est annulée avant la fin",
        whConsentGranted:
          "Déclenché lorsqu'un utilisateur accorde son consentement pour un but spécifique",
        whConsentWithdrawn:
          "Déclenché lorsqu'un utilisateur retire un consentement préalablement accordé",
        whRetentionUpdated: "Déclenché lors de la mise à jour d'une politique de rétention",
        whRetentionExec:
          "Déclenché à la fin d'un travail d'application des politiques de rétention",
        whReportGenerated:
          "Déclenché lorsque la génération d'un rapport de conformité se termine avec succès",
        whReportFailed: "Déclenché lorsque la génération d'un rapport de conformité échoue",
        quickStartTitle: "Guide de Démarrage Rapide",
        step1Title: "Alimenter les Données de Conformité",
        step1Content:
          "Exécutez le seeder de développement pour remplir les profils réglementaires, les buts de consentement types et les politiques de rétention pour votre environnement de test.",
        step2Title: "Configurer les Profils Réglementaires",
        step2Content:
          "Accédez à Conformité → Réglementations dans le panneau d'administration. Activez les réglementations sous lesquelles votre plateforme opère (RGPD, CCPA, PDPA). Chaque réglementation définit les délais de SLA et les sanctions qui seront appliquées.",
        step3Title: "Soumettre une DSR de Test",
        step3Content:
          "Créez une demande de droits pour tester le cycle de vie. Le système validera la demande, calculera le délai de SLA et la mettra à disposition pour attribution à un officier de conformité.",
        step4Title: "Enregistrer le Consentement et Configurer la Rétention",
        step4Content:
          "Définissez les buts de consentement (Marketing, Analyses, Tiers) et configurez les politiques de rétention pour chaque catégorie de données. La tâche d'application de la rétention appliquera automatiquement les actions configurées lorsque les données dépassent le délai.",
        step5Title: "Générer un Rapport de Conformité",
        step5Content:
          "Mettez en file d'attente un rapport de conformité asynchrone. Le rapport sera généré en arrière-plan et apparaîtra dans la liste des rapports dès qu'il sera prêt. Téléchargez-le au format CSV, JSON, XLSX ou PDF.",
        securityTitle: "Considérations de Sécurité",
        securityIntro:
          "Les données de conformité sont parmi les plus sensibles de la plateforme. Tous les points de terminaison sont protégés par l'authentification JWT, l'autorisation basée sur les rôles et le transfert d'identifiants chiffrés. Les données personnelles dans les DSR et les registres de consentement sont soumises à des restrictions de sécurité au niveau du champ.",
        securityWarningTitle: "Avertissement de Protection des Données",
        securityWarningContent:
          "Les données de conformité contiennent des informations personnelles (PII). Assurez-vous que les contrôles d'accès, la journalisation d'audit et le chiffrement des données appropriés sont configurés. Ne divulguez jamais d'endpoints de conformité bruts sans authentification.",
        secDoTitle: "Pratiques Recommandées",
        secDo1: "Activer la sécurité au niveau du champ pour les champs PII dans les réponses DSR",
        secDo2:
          "Configurer des secrets de webhook pour tous les abonnements aux événements de conformité",
        secDo3:
          "Définir des politiques de rétention pour les données de conformité elles-mêmes (méta-conformité)",
        secDo4:
          "Examiner régulièrement les journaux d'audit pour détecter les tentatives d'accès non autorisées",
        secDontTitle: "Anti-patterns à Éviter",
        secDont1:
          "Ne jamais exposer les points de terminaison DSR sans authentification réservée aux administrateurs (AdminOnly)",
        secDont2:
          "Ne jamais sauter le suivi de version du consentement — cela annule la piste d'audit",
        secDont3:
          "Ne jamais supprimer définitivement les dossiers de conformité — utilisez toujours la suppression logique (soft-delete)",
        secDont4:
          "Ne jamais contourner le répartiteur de webhooks pour les événements de conformité",
      },

      dsr: {
        title: "Droits des personnes concernées (DSR)",
        description: "Description",
        intro:
          "Les demandes de droits des personnes concernées (DSR) sont des demandes formelles de personnes exerçant leurs droits en vertu des lois sur la protection des données. Le module de conformité fournit un flux de travail DSR structuré et complet : soumission, affectation, examen, traitement et clôture — avec un journal d'audit complet en ajout uniquement et un suivi SLA.",
        typesTitle: "Types de requêtes",
        typesIntro:
          "Le système prend en charge cinq types de DSR définis par les réglementations GDPR et CCPA :",
        typesType: "Type de requête",
        typesDesc: "Description",
        typesGdpr: "Référence GDPR",
        typesAccessDesc:
          "Droit d'accès (Article 15). La personne demande la liste des finalités du traitement, les catégories de données personnelles et les destinataires.",
        typesExportDesc:
          "Droit à la portabilité des données (Article 20). La personne demande une copie lisible par machine de ses données personnelles.",
        typesErasureDesc:
          "Droit à l'effacement / Droit à l'oubli (Article 17). La personne demande la suppression définitive ou l'anonymisation de ses PII.",
        typesRectificationDesc:
          "Droit de rectification (Article 16). La personne demande la correction de données personnelles inexactes ou incomplètes.",
        typesRestrictionDesc:
          "Droit à la limitation du traitement (Article 18). La personne demande la suspension du traitement tout en conservant le stockage des données.",
        lifecycleTitle: "Cycle de vie des demandes",
        lifecycleIntro:
          "Les tickets DSR sont modélisés comme des transitions d'état avec un cycle d'examen et des barrières de confirmation de sécurité pour éviter les suppressions accidentelles et irréversibles :",
        lifecycleFlowTitle: "Cycle de vie des demandes DSR et barrières de sécurité",
        nodeSubmit: "1. Soumettre la demande",
        descSubmit:
          "La personne soumet sa demande via SubmitDsrCommand. Le statut passe à En attente et l'échéance SLA est calculée.",
        nodeReview: "2. Examen de l'administrateur",
        descReview:
          "L'administrateur examine la demande via ReviewDsrCommand, passant le statut à Approuvé ou Rejeté.",
        nodeConfirm: "3. Confirmer l'effacement",
        descConfirm:
          "Les demandes d'effacement nécessitent une confirmation manuelle via ConfirmErasureCommand, définissant la valeur ErasureConfirmed = true.",
        nodeProcessing: "4. Tâche d'exécution DSR",
        descProcessing:
          "La tâche DsrExecutionJob, exécutée toutes les 5 minutes, traite les demandes confirmées/approuvées par lots de 50.",
        nodeCompleted: "5. Statut : Terminé",
        descCompleted:
          "Exécuté avec succès sur tous les modules, avec enregistrement de l'horodatage de fin.",
        nodeRejected: "Statut : Rejeté",
        descRejected:
          "La demande est rejetée par l'administrateur pendant l'examen. Les notes de résolution sont enregistrées.",
        nodeCancelled: "Statut : Annulé",
        descCancelled:
          "Les demandes en attente, en examen ou approuvées peuvent être annulées manuellement à tout moment.",
        nodePartial: "6. Partiellement terminé",
        descPartial:
          "Si un module échoue, le DSR passe à Partiellement terminé et incrémente le compteur RetryCount (max 3).",
        connSubmitReview: "Assigne et passe à En examen",
        connReviewApprove: "Approuve la demande",
        connReviewReject: "Rejette la demande",
        connApproveConfirm: "Reqscripe pour l'effacement",
        connConfirmExec: "Prend en charge pour traitement",
        connExecComplete: "Tous les modules réussissent",
        connExecPartial: "Un module échoue",
        connPartialRetry: "Réessaye les modules ayant échoué",
        connCancel: "Annule la demande",
        executionFlowTitle: "Flux d'exécution de l'anonymisation DSR",
        nodeExecJob: "Déclenchement DsrExecutionJob",
        descExecJob:
          "S'exécute toutes les 5 minutes et récupère les demandes d'effacement approuvées prêtes pour traitement.",
        nodeCheckSafety: "Barrière de contrôle de sécurité",
        descCheckSafety:
          "Vérifie que ErasureConfirmed = true et que le délai de grâce ErasureExecuteAfter est dépassé.",
        nodeGenToken: "Générer le jeton d'anonymisation",
        descGenToken:
          "Génère un jeton d'anonymisation SHA-256 sécurisé basé sur l'ID de la personne concernée.",
        nodeFanOut: "Distribution aux modules",
        descFanOut:
          "Parcourt tous les fournisseurs de conformité enregistrés implémentant IUserDataAnonymizer.",
        nodeModuleExec: "Exécution sans allocation de mémoire",
        descModuleExec:
          "Exécute les mises à jour de base de données via ExecuteUpdateAsync d'EF Core pour effacer les champs PII.",
        nodeEvalStatus: "Évaluer les résultats",
        descEvalStatus: "Vérifie les rapports d'exécution des modules pour confirmer leur succès.",
        nodeComplete: "Définir le statut : Terminé",
        descComplete:
          "Le ticket DSR est marqué comme Terminé et l'horodatage CompletedAt est stocké.",
        nodePartialLimit: "Définir le statut : Partiellement terminé",
        descPartialLimit:
          "Enregistre l'erreur, incrémente RetryCount et met en file d'attente les modules ayant échoué (max 3).",
        connJobCheck: "récupère le lot",
        connCheckGen: "si les barrières de sécurité sont franchies",
        connGenFan: "génère le jeton",
        connFanMod: "appelle les anonymiseurs",
        connModEval: "rassemble les statuts",
        connEvalComplete: "si tous réussissent",
        connEvalPartial: "si l'un d'eux échoue",
        slaTitle: "Suivi SLA et calcul des échéances",
        slaIntro:
          "Les réglementations de conformité imposent des délais de réponse stricts. SCRIPE calcule et suit automatiquement les métriques SLA sur le tableau de bord d'administration :",
        slaWarningTitle: "Logique d'échéance SLA",
        slaWarningContent:
          "Les échéances sont calculées lors de la soumission en lisant le profil de réglementation actif (GDPR : 30 jours, CCPA : 45 jours). La progression du SLA est calculée dynamiquement sous forme de pourcentage : (Heure actuelle - CreatedAt) / (Échéance - CreatedAt) * 100.",
        escalationTitle: "Moteur d'escalade et alertes",
        escalationIntro:
          "La tâche DsrEscalationJob s'exécute quotidiennement à 08:00 UTC pour évaluer la consommation du SLA et escalader les tickets en retard :",
        escalationTier1:
          "Palier 1 (50% du SLA) — Alerte de rappel standard envoyée à l'administrateur affecté. Enregistre la note d'historique : [SLA-ESCALATION-50%].",
        escalationTier2:
          "Palier 2 (75% du SLA) — Escalade d'avertissement. Enregistre la note d'historique : [SLA-ESCALATION-75%] et déclenche le webhook compliance.dsr_sla_escalated.",
        escalationTier3:
          "Palier 3 (90% du SLA) — Escalade critique. Enregistre la note d'historique : [SLA-ESCALATION-90%], alerte les gestionnaires du système et envoie le webhook critique.",
        providerTitle: "Architecture de fournisseurs extensible",
        providerIntro:
          "Pour maintenir un couplage faible, le module de conformité communique avec les autres modules en utilisant les abstractions IUserDataProvider et IUserDataAnonymizer :",
        providerIdentityTitle: "Intégration du module d'identité",
        providerIdentityContent:
          "IdentityUserDataProvider exporte les métadonnées de profil, les sessions de connexion actives et les comptes externes liés. IdentityUserDataAnonymizer utilise des mises à jour de base de données ultra-performantes et sans allocation de mémoire pour remplacer les noms par le jeton d'anonymisation, formater les e-mails sous la forme {token}@anonymized.invalid, définir les numéros de téléphone sur null et marquer les adresses IP de session comme 'ANONYMIZED'.",
        providerComplianceTitle: "Intégration du module de conformité",
        providerComplianceContent:
          "ComplianceUserDataProvider exporte les journaux de requêtes et les entrées du registre de consentement. ComplianceUserDataAnonymizer efface les informations personnelles des anciennes DSR (SubjectEmail et RequesterNotes) et des journaux de consentement (IpAddress et UserAgent).",
        entitiesTitle: "Référence des entités",
        entityName: "Nom de l'entité",
        entityDesc: "Description",
        entityDsrDesc:
          "Représente une demande de personne concernée contenant le type, le statut, l'échéance SLA et les paramètres d'exécutions.",
        entityModuleDesc:
          "Suit le statut d'exécution et les tentatives de réessai de l'exécution DSR pour chaque fournisseur de module.",
        entityStatusDesc:
          "Registre en ajout uniquement suivant les transitions d'état DSR, les commentaires de résolution et les escalades SLA.",
        codeTitle: "Implémentation du code",
        endpointsTitle: "Points d'accès API",
        endpointsIntro:
          "Le contrôleur DSR expose les points d'accès suivants pour la soumission, l'examen et le contrôle de l'exécution des demandes :",
        ep: {
          list: "Lister toutes les DSR (paginé, filtrable par statut/type/réglementation)",
          get: "Obtenir les détails d'une DSR par ID",
          create: "Soumettre une nouvelle DSR (calcule l'échéance SLA)",
          updateStatus: "Mettre à jour le statut d'une DSR (En cours, Terminé, Rejeté)",
          assign: "Assigner la DSR à un agent de conformité",
          delete: "Supprimer temporairement (soft-delete) une DSR",
          confirm:
            "Confirmer explicitement une DSR d'effacement approuvée pour déverrouiller son exécution",
        },
        field: "Champ",
        type: "Type",
        fId: "Identifiant unique de la demande DSR.",
        fTenantId: "Clé étrangère référençant le contexte du locataire.",
        fSubjectEmail: "Adresse e-mail de la personne concernée (anonymisée lors de l'effacement).",
        fRequestType: "Type de DSR (Accès, Exportation, Effacement, Rectification, Limitation).",
        fStatus: "Statut actuel du cycle de vie de la demande.",
        fDeadline: "Échéance de réponse SLA calculée.",
        fErasureConfirmed:
          "Drapeau logique déverrouillant les demandes d'effacement pour les tâches en arrière-plan.",
        fErasureExecuteAfter: "Seuil d'exécution imposant le délai de grâce adaptatif.",
        fExportFileUrl: "URL de téléchargement du fichier compressé des données exportées.",
        fAssignedTo: "Clé étrangère référençant l'administrateur assigné.",
        fRetryCount:
          "Nombre actuel de tentatives de réessai pour les exécutions de modules ayant échoué.",
        fCompletedAt: "Horodatage indiquant quand la DSR a été terminée.",
        quickStartTitle: "Guide de démarrage rapide",
        step1Title: "Alimenter les profils de conformité",
        step1Content:
          "Exécutez le seeder de développement pour remplir les profils de réglementation GDPR et CCPA avec les jours SLA.",
        step2Title: "Soumettre une demande de personne concernée",
        step2Content:
          "Utilisez le point d'accès POST pour enregistrer une nouvelle demande. Le système valide les contraintes d'entrée et calcule l'échéance.",
        step3Title: "Examiner et approuver",
        step3Content:
          "L'agent de conformité assigné examine le ticket. Approuver une DSR d'effacement définit le délai de grâce et attend la confirmation finale.",
        executionFlowIntro:
          "L'exécution de la demande d'effacement anonymise les données personnelles de manière asynchrone à travers les modules via des implémentations de fournisseurs distribuées :",
      },
      consent: {
        title: "Gestion du consentement",
        description: "Description",
        intro:
          "La gestion du consentement fournit un enregistrement immuable des états de consentement. Pour prendre en charge des recherches ultra-performantes tout en conservant un journal d'audit légalement défendable, SCRIPE utilise une architecture à double table divisée entre un registre de transactions en ajout uniquement et une vue matérialisée mise en cache.",
        purposesTitle: "Finalités du consentement et paramètres",
        purposesIntro:
          "Le suivi du consentement est régi par des profils globaux et des finalités de consentement structurelles alimentées au démarrage de l'application :",
        purposesKey: "Clé de finalité",
        purposesBasis: "Base juridique",
        purposesRequired: "Obligatoire",
        purposesSort: "Ordre de tri",
        purposesActive: "Actif",
        purposesEssentialDesc:
          "Fonctionnalités essentielles reqscripees pour le fonctionnement de la plateforme. (Obligatoire, base juridique contractuelle).",
        purposesMarketingDesc:
          "Bulletins promotionnels, e-mails et communications de campagne. (Optionnel, base juridique de consentement).",
        purposesAnalyticsDesc:
          "Analyses d'utilisation, suivi du comportement des utilisateurs et télémétrie d'amélioration du produit. (Optionnel, base juridique de consentement).",
        basisContract: "Contrat",
        basisConsent: "Consentement",
        basisLegitimate: "Intérêt légitime",
        basisObligation: "Obligation légale",
        flowTitle: "Flux d'enregistrement et de vérification du consentement",
        nodeSubmit: "Soumission du consentement",
        descSubmit:
          "L'utilisateur met à jour ses préférences ou soumet un formulaire de consentement.",
        nodeValidate: "Contrôle FluentValidation",
        descValidate: "Valide les contraintes réglementaires et la syntaxe de la clé de finalité.",
        nodeLedger: "Ajouter au registre",
        descLedger:
          "Écrit une transaction ConsentRecord immuable contenant l'adresse IP, le client utilisateur, la version et l'action.",
        nodeUpsert: "Mettre à jour l'instantané",
        descUpsert:
          "Matérialise l'état actuel dans le cache ConsentSnapshot pour des contrôles d'autorisation ultra-rapides.",
        nodeEvents: "Événements de domaine",
        descEvents: "Publie ConsentGrantedEvent ou ConsentWithdrawnEvent via MediatR.",
        nodeExpiry: "Tâche d'expiration du consentement",
        descExpiry:
          "La tâche hebdomadaire en arrière-plan analyse les écarts de version et marque les enregistrements obsolètes pour ré-consentement.",
        connSubmitValidate: "soumet les détails à",
        connValidateLedger: "ajoute la transaction si elle est valide",
        connLedgerUpsert: "met à jour l'état du cache depscripe",
        connUpsertEvents: "distribue les événements en cas de succès",
        connExpiryUpsert: "marque RequiresReConsent = true dans",
        immutabilityTitle: "Architecture de base de données à double table",
        immutabilityIntro:
          "Pour garantir à la fois les performances de la base de données et l'intégrité de l'audit de conformité, le suivi du consentement sépare les transactions à écriture intensive des contrôles d'autorisation à lecture intensive :",
        entitiesTitle: "Référence des entités",
        entitiesIntro:
          "Les tableaux suivants définissent les propriétés du schéma pour le registre en ajout uniquement et pour les instantanés d'état actuels mis en cache :",
        field: "Champ",
        type: "Type",
        fId: "Identifiant unique de l'enregistrement.",
        fTenantId: "Clé étrangère référençant le contexte du locataire.",
        fSubjectId: "Clé étrangère référençant la personne concernée (utilisateur).",
        fPurposeId: "Clé étrangère référençant la configuration ConsentPurpose.",
        fAction: "Action de consentement enregistrée (Accordé ou Retiré).",
        fCurrentAction: "Dernier statut de consentement mis en cache pour le sujet et la finalité.",
        fRequiresReConsent:
          "Drapeau indiquant que l'utilisateur doit renouveler son consentement suite à une mise à jour de version.",
        fLastUpdatedAt: "Horodatage représentant la dernière modification de l'instantané.",
        fRecordedAt: "Horodatage représentant le moment de la transaction du registre.",
        fIpAddress: "Adresse IP du client capturée au moment de l'enregistrement.",
        fUserAgent: "Client utilisateur du navigateur capturé au moment de l'enregistrement.",
        fRegulationBasis: "Contexte réglementaire (GDPR, CCPA) actif lors de la soumission.",
        fCollectionMethod: "Méthode de collecte du consentement (Formulaire Web, App Mobile, API).",
        fConsentVersion:
          "Version du document de politique de consentement active lors de la soumission.",
        bestPracticesTitle: "Bonnes pratiques",
        doTitle: "Pratiques recommandées",
        dontTitle: "Pratiques à éviter",
        do1: "Vérifier que la clé de finalité respecte la contrainte regex alphanumérique en minuscules.",
        do2: "Exécuter systématiquement la tâche ConsentExpiryJob hebdomadaire pour imposer le ré-consentement lors des mises à jour de version.",
        do3: "Consommer les événements MediatR ConsentWithdrawnEvents pour limiter les traitements de données en aval.",
        dont1:
          "Ne jamais modifier directement les lignes de ConsentRecord pour éviter de rompre l'historique immuable.",
        dont2:
          "Ne jamais exécuter de requêtes SQL directes sur ConsentRecord pour les vérifications d'autorisations du frontend ; lire toujours ConsentSnapshot.",
        dont3:
          "Ne jamais exposer de points d'accès bruts non authentifiés pour l'enregistrement du consentement.",
        endpointsTitle: "Points d'accès API",
        ep: {
          list: "Lister tous les enregistrements du registre (administrateurs uniquement, filtrable avec pagination)",
          get: "Obtenir les détails d'un enregistrement par ID",
          record: "Enregistrer un octroi ou retrait de consentement (utilisateur/administrateur)",
          withdraw: "Retirer un consentement précédemment accordé (utilisateur/administrateur)",
          getMy: "Récupérer les instantanés de consentement actifs de l'utilisateur connecté",
          analytics:
            "Obtenir les statistiques de consentement par finalité et état (administrateurs uniquement)",
        },
        entitiesLedgerTitle: "ConsentRecord (Registre en ajout uniquement)",
        entitiesSnapshotTitle: "ConsentSnapshot (Instant matérialisé mis en cache)",
        epWithdraw: "Retirer un consentement précédemment accordé",
      },

      retention: {
        title: "Politiques de conservation des donnÃ©es",
        description:
          "DÃ©finir les pÃ©riodes de conservation et les actions d'expiration (Suppression ou Anonymisation) pour l'Article 5(1)(e) du RGPD.",
        intro:
          "DÃ©finissez la durÃ©e de conservation de catÃ©gories de donnÃ©es et ce qui se passe Ã  l'expiration. SCRIPE applique cela automatiquement via des tÃ¢ches en arriÃ¨re-plan.",
        policiesTitle: "Configuration de la politique",
        policiesIntro: "Chaque politique de conservation spÃ©cifie :",
        field1: "DataCategory â€” Le type de donnÃ©es (ex: 'Profils Utilisateurs').",
        field2: "RetentionDays â€” Combien de jours les donnÃ©es doivent Ãªtre conservÃ©es.",
        field3:
          "ExpiryAction â€” Ce qui se passe Ã  l'expiration : Delete (Supprimer) ou Anonymize (Anonymiser).",
        field4: "RegulationCode â€” Quelle rÃ©glementation l'exige (RGPD, CCPA, etc.).",
        actionsTitle: "Actions d'expiration",
        actionsIntro: "Ã€ l'expiration, SCRIPE applique l'une des deux actions :",
        action1: "Delete â€” Supprime dÃ©finitivement tous les enregistrements correspondants.",
        action2: "Anonymize â€” Remplace les PII par des jetons pseudonymes.",
        automationTitle: "Application automatisÃ©e",
        automationIntro:
          "La tÃ¢che RetentionEnforcementJob s'exÃ©cute quotidiennement Ã  3h00 UTC, scannant toutes les politiques actives et appliquant l'action configurÃ©e.",
        nodePolicy: "Politique de conservation",
        descPolicy: "DÃ©finit le type d'entitÃ©, la durÃ©e de vie et la stratÃ©gie",
        nodeEnforcement: "TÃ¢che d'application de la conservation",
        descEnforcement: "TÃ¢che hebdomadaire Ã©valuant les politiques",
        nodeExecution: "ExÃ©cution de la conservation",
        descExecution: "Piste d'audit de l'action de destruction",
        nodeAction: "Destruction des donnÃ©es",
        descAction: "Suppression dÃ©finitive ou Anonymisation",
        conn1: "scannÃ© par",
        conn2: "dÃ©clenche",
        conn3: "enregistre",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Lister toutes les politiques de conservation",
          executions: "Lister l'historique d'exÃ©cution",
          update: "Mettre Ã  jour une politique (jours, action, Ã©tat)",
        },
      },
      inventory: {
        title: "Inventaire des donnÃ©es",
        description:
          "Un registre de toutes les catÃ©gories de donnÃ©es personnelles traitÃ©es â€” reqscripe pour les Registres d'activitÃ©s de traitement (RoPA) Article 30 du RGPD.",
        intro:
          "L'inventaire des donnÃ©es est un registre structurÃ© de toutes les catÃ©gories de donnÃ©es personnelles que la plateforme traite.",
        fieldsTitle: "Champs de l'inventaire",
        fieldsIntro: "Chaque Ã©lÃ©ment documente :",
        field1: "DataCategory â€” Nom lisible (ex: 'Adresses e-mail').",
        field2: "LegalBasis â€” Base lÃ©gale du RGPD (Consentement, Contrat, etc.).",
        field3: "DataSubjects â€” Ã€ qui appartiennent les donnÃ©es.",
        field4: "ProcessingPurpose â€” Pourquoi les donnÃ©es sont traitÃ©es.",
        field5: "StorageLocation â€” OÃ¹ les donnÃ©es sont stockÃ©es.",
        field6: "RetentionPeriod â€” DurÃ©e de conservation (liÃ© Ã  la politique).",
        field7: "ThirdPartySharing â€” Si partagÃ© avec des tiers.",
        ropaTitle: "ConformitÃ© Ã  l'Article 30",
        ropaIntro:
          "Les organisations de plus de 250 employÃ©s doivent maintenir un RoPA. L'inventaire sert de RoPA en direct et interrogeable.",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Lister tous les Ã©lÃ©ments de l'inventaire (paginÃ©, cherchable)",
          get: "Obtenir l'Ã©lÃ©ment par ID",
          create: "Ajouter une nouvelle catÃ©gorie de donnÃ©es",
          update: "Mettre Ã  jour un Ã©lÃ©ment existant",
          delete: "Supprimer un Ã©lÃ©ment de l'inventaire",
        },
      },
      reports: {
        title: "Rapports de conformitÃ©",
        description:
          "GÃ©nÃ©rer des rapports asynchrones prÃªts pour l'audit (AperÃ§u RGPD, RÃ©sumÃ© DSR, Audit Consentement, Analyse Conservation, Export Inventaire).",
        intro:
          "Les rapports de conformitÃ© sont gÃ©nÃ©rÃ©s de maniÃ¨re asynchrone et fournissent des rÃ©sumÃ©s prÃªts pour l'audit. Ils sont gÃ©nÃ©rÃ©s en arriÃ¨re-plan et stockÃ©s pour le tÃ©lÃ©chargement.",
        reportTypesTitle: "Types de rapports",
        reportTypesIntro: "Cinq types sont disponibles :",
        type1: "AperÃ§u RGPD â€” RÃ©sumÃ© de haut niveau du statut RGPD.",
        type2:
          "RÃ©sumÃ© de l'activitÃ© DSR â€” Statistiques sur les volumes DSR, types, taux d'achÃ¨vement.",
        type3: "Audit du consentement â€” Journal complet des accords et rÃ©vocations.",
        type4: "Analyse de la conservation â€” Ã‰tat d'application actuel des politiques actives.",
        type5:
          "Export de l'inventaire des donnÃ©es â€” Export complet de l'inventaire (Article 30 RoPA).",
        asyncTitle: "GÃ©nÃ©ration asynchrone",
        asyncIntro:
          "Les rapports sont asynchrones pour Ã©viter de bloquer les requÃªtes HTTP. Le systÃ¨me crÃ©e immÃ©diatement un ComplianceReport (IsReady=false) et met la tÃ¢che en file d'attente.",
        asyncTip:
          "Utilisez le bouton RafraÃ®chir pour vÃ©rifier si le rapport est prÃªt (gÃ©nÃ©ralement 30-60 secondes).",
        downloadTitle: "TÃ©lÃ©chargement des rapports",
        downloadIntro:
          "Une fois prÃªt (IsReady=true), DownloadUrl est disponible. Les fichiers sont conservÃ©s 90 jours.",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Lister tous les rapports de conformitÃ©",
          get: "Obtenir les dÃ©tails du rapport et l'URL de tÃ©lÃ©chargement",
          generate: "Mettre en file d'attente une nouvelle gÃ©nÃ©ration de rapport",
          download: "TÃ©lÃ©charger le fichier gÃ©nÃ©rÃ©",
        },
      },
    },
  },
};
