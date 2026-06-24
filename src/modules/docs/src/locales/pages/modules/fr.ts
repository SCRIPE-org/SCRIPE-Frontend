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

    compliance: {
      overview: {
        title: "Module de conformitÃ©",
        description:
          "Automatisation de la conformitÃ© RGPD, CCPA et PDPA : profils, gestion DSR, consentement, conservation, inventaire et rapports.",
        intro:
          "Le module ConformitÃ© est le moteur de conformitÃ© rÃ©glementaire intÃ©grÃ© Ã  SCRIPE. Il aide les opÃ©rateurs et locataires Ã  respecter les principales lois (RGPD, CCPA, PDPA) via des outils automatisÃ©s.",
        infoTitle: "Avis de conformitÃ©",
        infoContent:
          "Ce module est essentiel pour maintenir la conformitÃ© et Ã©viter les amendes. Assurez-vous que toutes les fonctionnalitÃ©s sont mappÃ©es correctement.",
        descDsr: "GÃ¨re les demandes des sujets (Export, Effacement, Rectification)",
        descConsent: "Suivi immuable des Ã©tats de consentement",
        descRet: "Applique les politiques de destruction des donnÃ©es",
        descInv: "Cartographie les PII sensibles dans les modules",
        descRep: "GÃ©nÃ¨re les rapports RoPA et DPIA",
        descId: "Module d'identitÃ©",
        descIdDesc: "Fournit le contexte Utilisateur/Admin et Auth",
        descEnt: "Module des droits",
        descEntDesc: "ContrÃ´le l'accÃ¨s aux capacitÃ©s de conformitÃ©",
        conn1: "initie les demandes",
        conn2: "accorde/rÃ©voque",
        conn3: "contrÃ´le les politiques",
        conn4: "guide l'effacement",
        conn5: "cible les donnÃ©es",
        conn6: "pistes d'audit",
        conn7: "pistes d'audit",
        th1: "Composant",
        th2: "ResponsabilitÃ©",
        tr1_1: "DsrListViewModel",
        tr1_2: "GÃ¨re la pagination, le filtrage et l'assignation des demandes (DSR).",
        tr2_1: "ConsentRecordView",
        tr2_2: "Affiche le snapshot immuable du consentement avec les mÃ©tadonnÃ©es.",
        whatIsTitle: "Qu'est-ce que le module ConformitÃ© ?",
        whatIsIntro:
          "Le module offre six sous-systÃ¨mes couvrant tout le cycle de conformitÃ©. Les locataires SCRIPE obtiennent un systÃ¨me prÃªt pour la production.",
        subModulesTitle: "Six Sous-systÃ¨mes",
        subModulesIntro: "Chaque sous-systÃ¨me gÃ¨re un domaine de conformitÃ© spÃ©cifique :",
        sub1: "Profils de rÃ©glementation â€” Stocke les cadres rÃ©glementaires (RGPD, CCPA, PDPA).",
        sub2: "Demandes des sujets de donnÃ©es (DSR) â€” GÃ¨re les demandes de droits (export, effacement, rectification, restriction).",
        sub3: "Gestion du consentement â€” Enregistre, suit et audite les consentements accordÃ©s et rÃ©voquÃ©s.",
        sub4: "Politiques de conservation â€” DÃ©finit la durÃ©e de conservation et l'action Ã  l'expiration (supprimer ou anonymiser).",
        sub5: "Inventaire des donnÃ©es â€” Un registre de toutes les catÃ©gories de donnÃ©es personnelles.",
        sub6: "Rapports de conformitÃ© â€” GÃ©nÃ¨re des rapports asynchrones (AperÃ§u RGPD, RÃ©sumÃ© DSR, Audit des consentements, etc.).",
        backendTitle: "Architecture Backend",
        backendIntro:
          "Suit la structure SCRIPE Ã  3 projets (Domain / Application / Infrastructure) avec un ComplianceDbContext.",
        frontendTitle: "Architecture Frontend",
        frontendIntro:
          "OrganisÃ© en six sous-modules indÃ©pendants dans src/modules/compliance/ suivant le modÃ¨le View/ViewModel.",
        endpointsTitle: "AperÃ§u des Endpoints API",
        endpointsIntro:
          "Tous les endpoints sont sous /api/v1/compliances/ et nÃ©cessitent l'authentification.",
      },
      dsr: {
        title: "Demandes des sujets de donnÃ©es (DSR)",
        description:
          "GÃ©rer les demandes de droits RGPD/CCPA (export, effacement, rectification, restriction) avec suivi du cycle de vie.",
        intro:
          "Les DSR sont des demandes formelles des individus exerÃ§ant leurs droits. Le module fournit un flux de travail DSR complet : soumission, assignation, traitement et clÃ´ture.",
        typesTitle: "Types de demandes",
        typesIntro:
          "Le systÃ¨me prend en charge quatre types de DSR dÃ©finis par l'Article 17 du RGPD et le CCPA :",
        type1:
          "Export â€” Demande de portabilitÃ©. Le sujet souhaite une copie de ses donnÃ©es personnelles.",
        type2:
          "Effacement â€” Droit Ã  l'oubli. Toutes les donnÃ©es doivent Ãªtre supprimÃ©es ou anonymisÃ©es.",
        type3:
          "Rectification â€” Demande de correction. Les donnÃ©es inexactes doivent Ãªtre mises Ã  jour.",
        type4:
          "Restriction â€” Les donnÃ©es peuvent Ãªtre conservÃ©es mais non traitÃ©es activement.",
        lifecycleTitle: "Cycle de vie de la demande",
        lifecycleIntro: "Les DSR passent par un ensemble dÃ©fini de statuts :",
        status1: "En attente (Pending) â€” Ã‰tat initial lors de la rÃ©ception.",
        status2: "En cours (InProgress) â€” Un responsable de conformitÃ© est assignÃ©.",
        status3: "TerminÃ© (Completed) â€” La demande a Ã©tÃ© satisfaite.",
        status4:
          "RejetÃ© (Rejected) â€” La demande a Ã©tÃ© rejetÃ©e (ex: vÃ©rification insuffisante).",
        slasTitle: "Exigences SLA du RGPD",
        slasIntro:
          "Selon l'Article 12 du RGPD, les responsables doivent rÃ©pondre aux DSR dans les 30 jours (extensible Ã  3 mois).",
        lifecycleFlowTitle: "Flux du cycle de vie DSR",
        nodeSubmit: "Soumettre la demande",
        descSubmit: "Demande d'Export, d'Effacement ou de Rectification",
        nodePending: "Statut : En attente",
        descPending: "Demande enregistrÃ©e, dÃ©lai SLA calculÃ©",
        nodeProcessing: "Statut : En cours",
        descProcessing: "DsrExecutionJob commence le traitement via ISuspendableModule",
        nodeApproval: "Attente de l'Admin",
        descApproval: "L'effacement nÃ©cessite une confirmation manuelle de l'administrateur",
        nodeCompleted: "Statut : TerminÃ©",
        descCompleted: "Export gÃ©nÃ©rÃ© ou donnÃ©es effacÃ©es ; SLA respectÃ©",
        nodeRejected: "Statut : RejetÃ©",
        descRejected: "Demande refusÃ©e par l'administrateur avec notes de rÃ©solution",
        conn1: "initie",
        conn2: "la tÃ¢che en arriÃ¨re-plan prend le relais",
        conn3: "si auto-traitÃ© (Export)",
        conn4: "si radical (Effacement)",
        conn5: "admin confirme",
        conn6: "admin rejette",
        entitiesTitle: "EntitÃ©s",
        entityName: "Nom de l'entitÃ©",
        entityDesc: "Description",
        entityDsrDesc: "ReprÃ©sente une demande d'un sujet de donnÃ©es.",
        entityModuleDesc: "Ã‰tat d'exÃ©cution d'un module.",
        entityStatusDesc: "Historique des changements de statut.",
        codeTitle: "Exemple de code",
        endpointsTitle: "Endpoints API",
        endpointsIntro: "Le contrÃ´leur DSR expose 6 endpoints pour le cycle complet :",
        ep: {
          list: "Lister tous les DSR (paginÃ©, filtrable)",
          get: "Obtenir les dÃ©tails d'un DSR par ID",
          create: "Soumettre un nouveau DSR",
          updateStatus: "Mettre Ã  jour le statut du DSR",
          assign: "Assigner un DSR Ã  un responsable",
          delete: "Suppression logique d'un DSR",
        },
      },
      consent: {
        title: "Gestion du consentement",
        description:
          "Enregistrer, suivre et auditer les consentements pour la conformitÃ© Ã  l'Article 6 du RGPD et au CCPA.",
        intro:
          "La gestion du consentement enregistre chaque fois qu'un utilisateur accorde ou rÃ©voque son consentement pour un objectif spÃ©cifique. SCRIPE stocke la piste d'audit complÃ¨te.",
        purposesTitle: "Objectifs du consentement",
        purposesIntro: "Chaque consentement est liÃ© Ã  un objectif spÃ©cifique :",
        purpose1: "Marketing â€” Emails marketing et communications promotionnelles.",
        purpose2: "Analytique â€” Analyse d'utilisation et amÃ©lioration du produit.",
        purpose3: "Tiers â€” Partage de donnÃ©es avec des services tiers.",
        purpose4: "Personnalisation â€” Contenu personnalisÃ© et recommandations.",
        gdprTitle: "Base lÃ©gale du RGPD",
        gdprIntro:
          "L'Article 6 du RGPD exige que le consentement soit libre, spÃ©cifique, Ã©clairÃ© et univoque. SCRIPE enregistre la version exacte du texte de consentement affichÃ© Ã  l'utilisateur.",
        withdrawalTitle: "RÃ©vocation du consentement",
        withdrawalIntro:
          "Les utilisateurs peuvent rÃ©voquer leur consentement Ã  tout moment. ConsentRecord est mis Ã  jour avec WithdrawnAt.",
        flowTitle: "Flux de l'Ã©tat du consentement",
        nodePurpose: "Objectif de consentement",
        descPurpose: "DÃ©finit Ã  quoi on consent (ex: Marketing)",
        nodeRecord: "Registre de consentement",
        descRecord: "Ã‰tat actuel (AccordÃ©/RÃ©voquÃ©) par objectif",
        nodeSnapshot: "Snapshot de consentement",
        descSnapshot: "Capture immuable Ã  l'instant T de l'accord/rÃ©vocation",
        nodeJob: "TÃ¢che d'expiration du consentement",
        descJob: "TÃ¢che quotidienne rÃ©voquant les consentements expirÃ©s",
        conn1: "modÃ¨les",
        conn2: "gÃ©nÃ¨re au changement",
        conn3: "auto-rÃ©voque si expirÃ©",
        immutabilityTitle: "ImmuabilitÃ©",
        immutabilityIntro: "Les enregistrements de consentement sont immuables.",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Lister tous les consentements (paginÃ©, filtrable)",
          get: "Obtenir le consentement par ID",
          record: "Enregistrer un nouveau consentement",
          withdraw: "RÃ©voquer un consentement prÃ©cÃ©demment accordÃ©",
        },
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
          "Un registre de toutes les catÃ©gories de donnÃ©es personnelles traitÃ©es â€” requis pour les Registres d'activitÃ©s de traitement (RoPA) Article 30 du RGPD.",
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
