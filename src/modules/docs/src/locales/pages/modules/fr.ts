/**
 * Docs page locale — FR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const fr = {
  modules: {
    entitlementsOverview: {
      title: "Aperçu des Droits (Entitlements)",
      description:
        "Contrôle d'accès aux fonctionnalités basé sur les éditions avec Fonctionnalités, Éditions, Abonnements et Surcharges par locataire.",
      intro:
        "Le module des Droits (Entitlements) est le moteur de gestion des plans et des fonctionnalités de NEXORA. Il définit les capacités que chaque locataire (tenant) obtient, comment les plans (éditions) regroupent ces capacités, et comment les abonnements lient les locataires aux plans.",
      whatIsTitle: "Que sont les Droits ?",
      whatIsIntro:
        "Les Droits sont le module responsable de contrôler à quelles fonctionnalités un locataire peut accéder en fonction de son édition (plan) souscrite. Il fournit une chaîne de résolution à trois niveaux : Valeurs par défaut de la fonctionnalité → Valeurs de l'édition → Surcharges par locataire, garantissant une flexibilité maximale pour les opérateurs de la plateforme et les locataires revendeurs.",
      architectureTitle: "Architecture",
      architectureIntro:
        "Le système de Droits est composé de quatre domaines interconnectés qui travaillent ensemble pour fournir une solution complète de contrôle des fonctionnalités.",
      domainsTitle: "Quatre Domaines",
      domainsIntro: "Chaque domaine gère un aspect spécifique du cycle de vie des droits :",
      resolutionTitle: "Chaîne de Résolution des Valeurs de Fonctionnalité",
      resolutionIntro:
        "Lorsque le système a besoin de déterminer la valeur d'une fonctionnalité pour un locataire, il suit une chaîne de priorité stricte. La source de priorité la plus élevée qui fournit une valeur l'emporte.",
      pipelineTitle: "Intégration au Pipeline",
      pipelineIntro:
        "NEXORA intègre les droits directement dans le pipeline CQRS de MediatR via FeatureCheckBehavior. Les commandes et requêtes (queries) qui implémentent IRequireFeature sont automatiquement contrôlées — si la valeur résolue de la fonctionnalité pour le locataire est désactivée, la requête est rejetée avant d'atteindre le gestionnaire (handler).",
      pipelineTip:
        "Pour conditionner une commande à une fonctionnalité, implémentez simplement IRequireFeature et définissez RequiredFeatureName sur la clé système stable de la fonctionnalité (ex. 'Chat.Enabled'). Aucun code supplémentaire n'est nécessaire.",
      backendTitle: "Structure du Backend",
      backendIntro:
        "Le backend des Droits suit l'architecture standard des modules Clean Architecture de NEXORA avec les couches Domain, Application et Infrastructure.",
      frontendTitle: "Structure du Frontend",
      frontendIntro:
        "Le frontend reflète le backend avec quatre sous-modules (éditions, fonctionnalités, abonnements, surcharges), chacun suivant le modèle SOLID View/ViewModel.",
      controllersTitle: "Contrôleurs API",
      controllersIntro:
        "Le module des Droits expose 31 points de terminaison (endpoints) API répartis sur 4 contrôleurs, tous authentifiés par JWT et protégés par une autorisation basée sur les permissions.",
      noOpTitle: "Solution de repli NoOp (Fallback)",
      noOpIntro:
        "Lorsque le module des Droits n'est pas chargé (ex. dans un microservice qui n'inclut pas les Droits), NEXORA enregistre un NoOpFeatureCache. Cela permet aux commandes IRequireFeature de passer sans erreur — toutes les fonctionnalités sont traitées comme activées par défaut.",
      noOpNote:
        "La solution de repli NoOp garantit que les modules peuvent utiliser IRequireFeature sans dépendance stricte au module des Droits. En mode monolithe de production, le véritable FeatureCache est toujours disponible.",
      contextAwareTitle: "Filtrage contextuel des périmètres",
      contextAwareIntro:
        "Toutes les pages de droits (Fonctionnalités, Éditions, Permissions) sont contextuelles. Le frontend détecte si l'utilisateur est un administrateur système (tenantId est null), un administrateur de locataire ou en mode drill-down, et appelle des endpoints backend différents en conséquence. Les administrateurs système voient le catalogue complet avec CRUD ; les administrateurs de locataires voient uniquement leurs données effectives en mode lecture seule.",
      resolutionTip:
        "La chaîne de résolution est évaluée de manière paresseuse (lazy) — les valeurs sont mises en cache après la première résolution et invalidées lorsque les abonnements, les éditions ou les surcharges changent.",
      cqrsMapTitle: "Carte des Commandes et Requêtes CQRS",
      cqrsMapIntro:
        "Le module des Droits enregistre 31 gestionnaires (handlers) MediatR couvrant les quatre domaines. Chaque commande possède un validateur FluentValidation correspondant pour la validation des entrées.",
      diTitle: "Enregistrement de l'Injection de Dépendances",
      diIntro:
        "Tous les services de Droits sont enregistrés via la méthode d'extension AddEntitlementsModule dans DependencyInjection.cs. Le module suit le modèle d'enregistrement standard de NEXORA.",
      comparisonTitle: "Avec vs Sans Droits",
      comparisonIntro:
        "Le tableau suivant montre la différence de capacités lorsque le module des Droits est activé par rapport à une exécution sans celui-ci :",
      gettingStartedTitle: "Premiers Pas",
      gettingStartedIntro:
        "Suivez ces 5 étapes pour configurer le système de Droits pour votre plateforme. Chaque étape s'appuie sur la précédente :",
    },
    editions: {
      title: "Éditions",
      description:
        "Plans d'abonnement nommés avec regroupements de fonctionnalités, politiques de dépassement (overflow), versionnage et stratégies de déploiement.",
      intro:
        "Les Éditions sont des plans nommés (ex. Basic, Pro, Enterprise) qui regroupent des valeurs de fonctionnalités. Chaque locataire souscrit à une édition, ce qui détermine son accès aux fonctionnalités. Les éditions prennent en charge le versionnage avec des stratégies de déploiement contrôlées pour une mise en production sécurisée des changements.",
      entityTitle: "Entité Édition",
      entityIntro:
        "Une Édition est un plan nommé qui regroupe des valeurs de fonctionnalités. Les éditions système sont créées par les administrateurs de la plateforme ; les éditions de détail (retail) sont créées par les locataires revendeurs pour leurs sous-locataires.",
      overflowTitle: "Politique de Dépassement (Overflow Policy)",
      overflowIntro:
        "Lorsqu'un locataire passe à une édition avec des limites inférieures (rétrogradation), ses ressources existantes peuvent dépasser les nouvelles limites. La politique de dépassement détermine ce qui se passe :",
      featuresTitle: "Fonctionnalités de l'Édition",
      featuresIntro:
        "Chaque édition contient un ensemble d'enregistrements EditionFeature qui associent les fonctionnalités à leurs valeurs au sein de ce plan. Les fonctionnalités qui ne sont pas explicitement définies dans une édition reviennent à Feature.DefaultValue.",
      versionsTitle: "Versions de l'Édition",
      versionsIntro:
        "Les Versions d'Édition fournissent un système de versionnage et de déploiement pour les changements de fonctionnalités. Au lieu de modifier les fonctionnalités directement, les administrateurs peuvent créer une nouvelle version (instantané), choisir une stratégie de déploiement et la publier.",
      rolloutTitle: "Stratégies de Déploiement",
      rolloutIntro:
        "Lors de la publication d'une version d'édition, les administrateurs choisissent comment les changements sont déployés pour les locataires abonnés :",
      workflowTitle: "Appliquer Maintenant vs Enregistrer comme Version",
      workflowIntro:
        "NEXORA offre deux façons de mettre à jour les fonctionnalités d'une édition, chacune adaptée à des scénarios différents :",
      workflowTip:
        "Utilisez 'Appliquer Maintenant' pour les correctifs urgents et les petits changements. Utilisez 'Enregistrer comme Version' pour les mises à jour majeures du plan qui nécessitent un déploiement progressif et une piste d'audit.",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      endpointsIntro:
        "Le contrôleur des Éditions expose 11 endpoints pour gérer les éditions, leurs fonctionnalités et le cycle de vie des versions :",
      drillDownTitle: "Comportement du Drill-Down",
      drillDownIntro:
        "Lorsqu'un administrateur système descend dans un locataire (drill-down), la liste des éditions est automatiquement limitée aux éditions visibles par ce locataire. Le backend utilise l'en-tête X-Tenant-Context pour le filtrage : éditions système + éditions de détail créées par le locataire sélectionné. Le frontend masque les actions CRUD en mode drill-down.",
      scopingTitle: "Éditions Système vs Détail (Retail)",
      scopingIntro:
        "NEXORA prend en charge deux types d'éditions : Les éditions Système, créées par les administrateurs de la plateforme et visibles par tous les locataires, et les éditions de Détail (Retail), créées par les locataires revendeurs uniquement pour leurs sous-locataires.",
      scopingNote:
        "Les administrateurs de locataires ne voient que les éditions système plus leurs propres éditions de détail. Cela garantit l'isolation des éditions entre les locataires revendeurs.",
      featuresTip:
        "Les fonctionnalités non définies explicitement dans une édition reviennent à Feature.DefaultValue. Vous n'avez besoin de configurer que les fonctionnalités qui diffèrent de la valeur par défaut globale.",
      endpointsList: "Lister toutes les éditions (paginé, filtrable)",
      endpointsGet: "Obtenir les détails de l'édition par ID",
      endpointsCreate: "Créer une nouvelle édition",
      endpointsUpdate: "Mettre à jour les métadonnées de l'édition",
      endpointsDelete: "Suppression logique (soft-delete) d'une édition",
      endpointsGetFeatures: "Lister les fonctionnalités configurées pour cette édition",
      endpointsSetFeatures: "Définir/mettre à jour les fonctionnalités pour cette édition",
      endpointsDirectApply:
        "Appliquer les changements de fonctionnalités immédiatement (sans versionnage)",
      endpointsGetVersions: "Lister toutes les versions pour cette édition",
      endpointsCreateVersion:
        "Créer un nouveau brouillon de version avec un instantané des fonctionnalités",
      endpointsPublishVersion:
        "Publier une version brouillon avec la stratégie de déploiement choisie",
    },
    subscriptions: {
      title: "Abonnements",
      description:
        "Liaison locataire-édition avec gestion complète du cycle de vie, tarification multi-devises, promotions, essais, rétrogradations (downgrades), comportement d'expiration et export analytique avancé.",
      intro:
        "Les abonnements lient les locataires aux éditions (plans). Chaque locataire a un abonnement de base qui détermine son édition, et éventuellement des abonnements complémentaires pour des capacités supplémentaires. Le système d'abonnement gère l'ensemble du cycle de vie, de l'attribution au renouvellement, en passant par la rétrogradation, la suspension et l'annulation — avec une tarification multi-devises intégrée et un suivi des remises promotionnelles.",
      entityTitle: "Entité Abonnement",
      entityIntro:
        "Une TenantSubscription (Abonnement Locataire) lie un locataire à une édition avec un suivi du cycle de vie. Elle prend en charge plusieurs types et statuts d'abonnement pour une gestion complète du cycle de vie.",
      typesTitle: "Types d'Abonnements",
      typesIntro:
        "Chaque abonnement a un type qui détermine son cycle de facturation et son comportement :",
      lifecycleTitle: "Cycle de vie des Statuts",
      lifecycleIntro:
        "Les abonnements passent par une série de statuts au cours de leur cycle de vie :",
      downgradeTitle: "Suivi des Rétrogradations (Downgrades)",
      downgradeIntro:
        "Lorsqu'un locataire est rétrogradé (manuellement ou en raison d'une expiration), le système conserve les détails de l'abonnement d'origine pour l'audit et une éventuelle restauration. Les champs DowngradedFromEditionId, DowngradedFromType, DowngradedFromEndDate et DowngradedAt préservent l'historique complet de la rétrogradation.",
      downgradeWarning:
        "Lors d'une rétrogradation, la Politique de Dépassement (OverflowPolicy) de l'édition cible détermine ce qu'il advient des ressources qui dépassent les nouvelles limites. Utilisez toujours l'endpoint d'Impact de Rétrogradation pour prévisualiser les effets avant d'effectuer des changements.",
      expiryTitle: "Comportement d'Expiration",
      expiryIntro:
        "Lorsqu'un abonnement expire, le paramètre ExpiryBehavior détermine ce qui se passe ensuite :",
      pricingTitle: "Tarification Multi-Devises",
      pricingIntro:
        "Chaque abonnement porte des métadonnées de tarification complètes : Devise (code ISO), MontantDeBase, MontantAjustement, MontantTotal, TauxDeChangeEnUsd et MontantTotalUsd. Cela permet un suivi précis des revenus à travers 9+ devises prises en charge (USD, EUR, GBP, SAR, AED, EGP, TRY, INR, et plus).",
      exchangeRateTitle: "Normalisation en USD",
      exchangeRateIntro:
        "Tous les montants sont normalisés en USD via ExchangeRateToUsd pour des rapports MRR/ARR cohérents. Le champ TotalAmountUsd est calculé au moment de l'abonnement et stocké pour une précision historique — les fluctuations de taux de change ne modifient pas rétroactivement les enregistrements passés.",
      promotionsTitle: "Remises Promotionnelles",
      promotionsIntro:
        "Les abonnements prennent en charge les codes promo via le champ AppliedPromoCode. Lorsqu'une promotion valide est appliquée, un pourcentage PromotionDiscount est enregistré et le MontantAjustement reflète la remise appliquée au MontantDeBase. Les promotions sont suivies par abonnement pour l'audit et l'analyse.",
      exportTitle: "Export et Reporting Avancés",
      exportIntro:
        "Le système d'export des abonnements génère des rapports complets aux formats CSV, Excel (XLSX) et PDF. Chaque rapport comprend une page de couverture avec les métadonnées de filtrage, des tableaux de données colorés et des résumés statistiques.",
      exportFiltersTitle: "Filtres d'Export",
      exportFiltersIntro:
        "Les rapports prennent en charge des filtres avancés pour des analyses ciblées :",
      exportFilterDate:
        "Plage de dates — filtrer par date de création de l'abonnement (7/30/90 derniers jours, dernière année ou plage personnalisée)",
      exportFilterExpiring:
        "Expire bientôt — trouver les abonnements expirant dans 5/7/14/30/60/90 jours",
      exportFilterStatus: "Statut — Actif, Suspendu, Annulé, Expiré",
      exportFilterEdition: "Édition — filtrer par plan/édition spécifique",
      exportFilterCurrency: "Devise — afficher les montants dans la devise sélectionnée",
      exportDaysLeftTitle: "Jours Restants Avant Expiration",
      exportDaysLeftIntro:
        "Les rapports incluent une colonne 'Jours Restants' calculée avec un codage couleur conditionnel : rouge (≤7 jours), jaune (≤30 jours), vert (>30 jours). Cela permet d'identifier en un coup d'œil les abonnements nécessitant une attention de renouvellement.",
      exportFormatsTitle: "Détails des Formats d'Export",
      exportFormatCsv: "CSV — léger, importable dans tout tableur ou outil BI",
      exportFormatExcel:
        "XLSX — classeur Excel professionnel avec en-têtes stylisés, feuille de métadonnées de filtre, mise en forme conditionnelle et colonnes à taille automatique (ClosedXML)",
      exportFormatPdf:
        "PDF — document prêt à imprimer avec page de couverture associée à la marque, résumé statistique et tableaux de données paginés (QuestPDF)",
      renewalTitle: "Renouvellement — Modèle Nouvelle Ligne (B2)",
      renewalIntro:
        "Les renouvellements créent une NOUVELLE ligne TenantSubscription au lieu d'écraser l'enregistrement existant (modèle Stripe). L'ancien abonnement est marqué Expiré (IsActive=false), tandis qu'une nouvelle ligne est créée avec un nouvel Id, StartDate=UtcNow, une tarification recalculée et les détails promotionnels reportés.",
      renewalAuditTitle: "Piste d'Audit des Revenus",
      renewalAuditIntro:
        "Chaque cycle de facturation produit sa propre ligne immuable en base de données avec une tarification figée au moment du renouvellement. Cela permet des rapports financiers précis : tendances MRR, analyse du taux d'attrition par période et suivi des remboursements par cycle.",
      promoExpiryTitle: "Suivi d'Expiration des Promotions (A1)",
      promoExpiryIntro:
        "Lorsqu'une promotion avec DurationDays > 0 est appliquée, le système calcule un horodatage PromotionExpiresAt. À chaque renouvellement, le gestionnaire vérifie si UtcNow > PromotionExpiresAt — si la promotion a expiré, la remise est supprimée et NON reportée sur la nouvelle ligne d'abonnement.",
      concurrencyTitle: "Concurrence Optimiste (E1)",
      concurrencyIntro:
        "Chaque TenantSubscription possède un ConcurrencyStamp (Guid) avec [ConcurrencyCheck]. Le tampon est renouvelé à chaque opération d'écriture. Cela prévient les conditions de course — par exemple, une annulation concurrente + un travail de rapprochement — en levant une DbUpdateConcurrencyException en cas de collision.",
      validationTitle: "Validation des Entrées (G1)",
      validationIntro:
        "Les 8 commandes d'abonnement disposent de validateurs FluentValidation dédiés. Les validateurs utilisent ILocalizer pour des messages d'erreur localisés (EN + AR). Règles métier : pas de renouvellement en essai, montants de remboursement positifs, limites de longueur de texte.",
      crossModuleTitle: "Intégration Inter-Modules (H1)",
      crossModuleIntro:
        "Les événements du cycle de vie d'abonnement publient des événements de domaine consommés par le module Identité. Lors de la suspension d'un abonnement, tous les administrateurs du locataire sont désactivés avec DeactivationReason='SubscriptionSuspended'. À la reprise, seuls les administrateurs désactivés par suspension sont réactivés.",
      crossModuleReasons:
        "Trois raisons de désactivation : 'Manuel' (jamais réactivé automatiquement), 'SubscriptionSuspended' (réactivé à la reprise), 'SubscriptionExpired' (désactivé à l'expiration).",
      impactTitle: "Analyse d'Impact de la Rétrogradation",
      impactIntro:
        "Avant de modifier l'édition d'un locataire, utilisez l'endpoint d'Impact de Rétrogradation pour prévisualiser quelles ressources seraient en dépassement. La réponse liste chaque fonctionnalité qui dépasserait les limites de la nouvelle édition, ainsi que l'utilisation actuelle par rapport à la nouvelle limite.",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      endpointsIntro:
        "Le contrôleur des Abonnements fournit 13 endpoints couvrant l'ensemble du cycle de vie de l'abonnement :",
      operationsTitle: "Opérations sur les Abonnements",
      operationsIntro:
        "Le module d'abonnement prend en charge un ensemble complet d'opérations de cycle de vie. Chaque opération fait passer l'abonnement à un nouvel état avec un suivi d'audit complet.",
      assignTitle: "Attribuer un Abonnement",
      assignIntro:
        "Créer un nouvel abonnement liant un locataire à une édition. Si le locataire a déjà un abonnement actif, le précédent est automatiquement annulé. Prend en charge les paramètres optionnels de devise, code promo et comportement d'expiration.",
      upgradeTitle: "Mise à niveau (Upgrade) & Rétrogradation (Downgrade)",
      upgradeIntro:
        "Les locataires peuvent passer d'une édition à l'autre. Les mises à niveau s'appliquent immédiatement et les fonctionnalités de la nouvelle édition prennent effet sur-le-champ. Les rétrogradations vérifient d'abord la OverflowPolicy pour gérer les ressources qui dépassent les nouvelles limites.",
      trialTitle: "Conversion d'Essai",
      trialIntro:
        "Les abonnements d'essai ont une TrialEndDate (Date de fin d'essai). Lorsqu'un essai est mis à niveau vers un plan payant, IsTrialConverted est défini sur true et l'abonnement passe au nouveau type. Si l'essai expire sans conversion, ExpiryBehavior détermine ce qui se passe ensuite.",
      ep: {
        list: "Lister tous les abonnements (paginé, filtrable par statut/type/locataire)",
        get: "Obtenir les détails de l'abonnement par ID",
        assign:
          "Créer un nouvel abonnement (attribuer un locataire à une édition avec devise/promo)",
        upgrade: "Mettre à niveau vers une édition supérieure",
        downgrade: "Rétrograder vers une édition inférieure (vérifie la OverflowPolicy)",
        impact: "Prévisualiser l'impact de la rétrogradation avant exécution",
        suspend: "Suspendre l'abonnement (bloquer l'accès du locataire)",
        resume: "Reprendre un abonnement suspendu",
        cancel: "Annuler définitivement l'abonnement",
        renew: "Renouveler un abonnement arrivant à expiration",
        tenantActive: "Obtenir l'abonnement actif pour un locataire spécifique",
        export: "Exporter les abonnements en CSV, Excel ou PDF avec des filtres avancés",
      },
    },
    features: {
      title: "Fonctionnalités (Features)",
      description:
        "Capacités contrôlables de la plateforme avec des types de valeurs Booléen, Numérique et Chaîne de caractères.",
      intro:
        "Les fonctionnalités sont les éléments de base atomiques du système de Droits. Chaque fonctionnalité représente une capacité contrôlable — un commutateur booléen, un quota numérique ou une configuration textuelle. Les fonctionnalités ont une clé système stable (Name) qui ne change jamais, ce qui permet de les référencer en toute sécurité dans le code.",
      entityTitle: "Entité Fonctionnalité",
      entityIntro:
        "Une Fonctionnalité (Feature) définit une capacité contrôlable de la plateforme. Le champ Name est une clé système stable utilisée dans le code ; DisplayNameEn/DisplayNameAr sont des libellés destinés aux utilisateurs.",
      valueTypesTitle: "Types de Valeurs",
      valueTypesIntro:
        "Les valeurs des fonctionnalités sont stockées sous forme de chaînes (strings) mais interprétées selon leur ValueType. Le système valide les valeurs par rapport au type attendu lors de la création et de la mise à jour.",
      valueTypesTip:
        "Pour les fonctionnalités Numériques, utilisez -1 pour représenter 'illimité'. Le FeatureCheckBehavior reconnaît -1 comme une valeur spéciale et ne bloque jamais les requêtes pour les fonctionnalités ayant un quota illimité.",
      systemVsCustomTitle: "Fonctionnalités Système vs Personnalisées",
      systemVsCustomIntro:
        "NEXORA fait la distinction entre les fonctionnalités système (insérées au démarrage, en lecture seule) et les fonctionnalités personnalisées (créées par les administrateurs via l'API) :",
      cacheTitle: "Cache des Fonctionnalités",
      cacheIntro:
        "Les valeurs de fonctionnalités résolues sont mises en cache dans le IFeatureCache pour éviter des requêtes à la base de données à chaque demande. Le cache est invalidé chaque fois que les fonctionnalités d'une édition changent, qu'un abonnement est modifié ou qu'une surcharge est définie/supprimée. Dans les déploiements de microservices sans le module des Droits, un NoOpFeatureCache traite toutes les fonctionnalités comme activées.",
      requireFeatureTitle: "Interface IRequireFeature",
      requireFeatureIntro:
        "Pour conditionner une commande ou une requête CQRS à une fonctionnalité, implémentez l'interface de marquage IRequireFeature. Le comportement du pipeline FeatureCheckBehavior résout automatiquement la valeur actuelle pour le locataire et rejette la requête si la fonctionnalité est désactivée.",
      requireFeatureNote:
        "IRequireFeature fonctionne à la fois pour les fonctionnalités Booléennes (vérifiées comme activées/désactivées) et les fonctionnalités Numériques (vérifiées selon le quota restant). Le comportement détermine automatiquement le type de vérification à partir du Feature.ValueType.",
      contextAwareTitle: "Affichage contextuel des fonctionnalités",
      contextAwareIntro:
        "La liste des fonctionnalités est contextuelle. Les administrateurs système voient le catalogue complet des fonctionnalités avec les opérations CRUD. Les administrateurs de locataires et les sessions en drill-down ne voient que les fonctionnalités effectives du locataire (résolues à partir de l'édition + surcharges) en mode lecture seule. Tout le filtrage de périmètre se fait côté backend via GET /features (catalogue) vs GET /features/effective (scoped au locataire).",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      endpointsIntro:
        "Le contrôleur des Fonctionnalités expose 5 endpoints CRUD. Les fonctionnalités système ne peuvent pas être supprimées :",
      seedingTitle: "Initialisation des Fonctionnalités (Seeding)",
      seedingIntro:
        "Les fonctionnalités système sont automatiquement initialisées (seeded) au démarrage de l'application par EntitlementsStartupSeeder. L'initialiseur vérifie si chaque fonctionnalité système existe déjà (par son Nom) et ne crée que celles qui manquent — les fonctionnalités existantes ne sont jamais écrasées.",
      quotaTitle: "Suivi des Quotas (QuotaCounter)",
      quotaIntro:
        "Les fonctionnalités numériques prennent en charge l'application automatique des quotas via l'entité QuotaCounter. Le FeatureCheckBehavior vérifie l'utilisation actuelle par rapport à la limite résolue pour chaque commande IRequireFeature ciblant une fonctionnalité numérique.",
      cacheNote:
        "Le cache est automatiquement invalidé lorsque : (1) les fonctionnalités d'une édition sont modifiées, (2) un abonnement est attribué/modifié, (3) une surcharge est définie/supprimée. Aucune purge manuelle du cache n'est nécessaire.",
      patternTitle: "Modèle IRequireFeature",
      patternIntro:
        "Pour conditionner n'importe quelle commande CQRS derrière une vérification de fonctionnalité, implémentez simplement l'interface de marquage IRequireFeature. Le FeatureCheckBehavior intercepte automatiquement la requête, résout la valeur de la fonctionnalité pour le locataire, et la rejette si elle est désactivée ou si le quota est dépassé.",
      ep: {
        list: "Lister toutes les fonctionnalités (paginé, filtrable par catégorie/type)",
        get: "Obtenir les détails de la fonctionnalité par ID",
        create: "Créer une nouvelle fonctionnalité personnalisée",
        update:
          "Mettre à jour les métadonnées de la fonctionnalité (fonctionnalités système : DefaultValue/Description uniquement)",
        delete:
          "Suppression logique d'une fonctionnalité personnalisée (les fonctionnalités système ne peuvent pas être supprimées)",
      },
    },
    overrides: {
      title: "Surcharges de Fonctionnalités (Overrides)",
      description:
        "Personnalisation des valeurs de fonctionnalités par locataire qui contourne les valeurs par défaut de l'édition.",
      intro:
        "Les Surcharges (Overrides) de fonctionnalités permettent aux administrateurs de la plateforme de personnaliser les valeurs des fonctionnalités pour des locataires individuels, indépendamment de leur édition souscrite. Les surcharges ont la plus haute priorité dans la chaîne de résolution, ce qui les rend parfaites pour des accords commerciaux sur mesure, des promotions spéciales ou des exceptions ponctuelles.",
      entityTitle: "Entité Surcharge",
      entityIntro:
        "Un TenantFeatureOverride définit une valeur personnalisée pour une fonctionnalité spécifique sur un locataire spécifique. Il inclut un champ optionnel Reason (Raison) à des fins d'audit.",
      priorityTitle: "Priorité de Résolution",
      priorityIntro:
        "Les surcharges se trouvent en haut de la chaîne de résolution. Lorsque le système résout une valeur de fonctionnalité pour un locataire, il vérifie d'abord l'existence d'une surcharge :",
      whenTitle: "Quand utiliser les Surcharges",
      whenIntro:
        "Les surcharges sont conçues pour des cas exceptionnels où un locataire a besoin d'une valeur différente de celle fournie par son édition :",
      useCase1:
        "Accords d'entreprise personnalisés — 'Donner à Acme Corp 500 administrateurs au lieu des 50 standards'",
      useCase2:
        "Offres promotionnelles — 'Activer le Chat Premium pour ce locataire pendant 30 jours'",
      useCase3:
        "Tests Bêta — 'Activer le nouveau module de Facturation pour les premiers adoptants (early adopters)'",
      useCase4:
        "Augmentation temporaire — 'Augmenter la limite de téléchargement de fichiers pendant leur migration'",
      overuseWarning:
        "Les surcharges doivent être utilisées avec parcimonie. Si de nombreux locataires ont besoin de la même surcharge, envisagez plutôt de créer une nouvelle édition. Des surcharges excessives rendent le système plus difficile à gérer et à auditer.",
      resolvedTitle: "Endpoint des Fonctionnalités Résolues",
      resolvedIntro:
        "L'endpoint GET /api/v1/tenants/{tenantId}/features/resolved renvoie la valeur finale et effective de chaque fonctionnalité pour un locataire donné. Il affiche la source de résolution (Surcharge, Édition ou Défaut) pour chaque entrée, facilitant ainsi le débogage et l'audit.",
      endpointsTitle: "Points de terminaison API (Endpoints)",
      endpointsIntro:
        "Le contrôleur TenantFeatures expose 4 endpoints pour gérer les surcharges par locataire et les valeurs résolues :",
      scenariosTitle: "Scénarios d'Utilisation",
      scenariosIntro:
        "Les scénarios réels suivants montrent quand les surcharges apportent le plus de valeur :",
      settingTitle: "Définir une Surcharge",
      settingIntro:
        "Pour définir une surcharge, envoyez une requête POST à l'endpoint des fonctionnalités du locataire avec l'ID de la fonctionnalité, la valeur personnalisée et une raison optionnelle à des fins d'audit.",
      settingTip:
        "Incluez toujours une raison lors de la définition des surcharges — cela donne du sens aux pistes d'audit et aide les futurs administrateurs à comprendre pourquoi la surcharge a été appliquée.",
      expiryTitle: "Surcharges Expirables",
      expiryIntro:
        "Les surcharges peuvent avoir une date d'expiration (ExpiresAt) optionnelle. Lorsque la date d'expiration est passée, la surcharge est automatiquement désactivée et la fonctionnalité revient à la valeur de l'édition (ou à la valeur par défaut globale).",
      expiryNote:
        "Les surcharges expirées sont désactivées de manière logique (IsActive = false), et non supprimées. Cela préserve la piste d'audit et permet une réactivation si nécessaire.",
      auditTitle: "Piste d'Audit",
      auditIntro:
        "Chaque opération de surcharge est suivie avec des informations d'audit complètes. Le champ Raison (Reason) de chaque surcharge fournit le contexte expliquant pourquoi la valeur personnalisée a été appliquée.",
      bestPracticesTitle: "Bonnes Pratiques",
      bestPracticesIntro:
        "Suivez ces directives pour garder votre système de surcharges maintenable et auditable.",
      bestPracticesWarning:
        "Les surcharges doivent être utilisées avec parcimonie. Si de nombreux locataires ont besoin de la même surcharge, envisagez plutôt de créer une nouvelle édition. L'abus de surcharges rend le système plus difficile à gérer et crée une dette technique de maintenance.",
      historyTitle: "Historique des Surcharges",
      historyIntro:
        "Le système conserve un historique complet des modifications de surcharges, permettant d'identifier qui a effectué une modification et pourquoi.",
      bulkTitle: "Gestion en Masse",
      bulkIntro:
        "Les administrateurs peuvent appliquer des surcharges à plusieurs locataires simultanément pour des mises à jour rapides à l'échelle de la plateforme.",
      importTitle: "Import/Export de Surcharges",
      importIntro:
        "Prise en charge de l'importation de surcharges via des fichiers CSV pour les configurations complexes nécessitant une préparation hors ligne.",
      validationTitle: "Validation des Surcharges",
      validationIntro:
        "Les nouvelles surcharges sont validées par rapport aux limites de l'édition actuelle pour prévenir toute configuration invalide.",
      errorTitle: "Gestion des Erreurs",
      errorIntro:
        "Les erreurs de résolution des surcharges sont journalisées avec des détails sur la fonctionnalité en conflit et le contexte du locataire pour un dépannage rapide.",
      ep: {
        list: "Lister toutes les dérogations pour un locataire spécifique",
        set: "Définir ou mettre à jour une dérogation de fonctionnalité pour un locataire",
        remove: "Supprimer (désactiver) une dérogation de fonctionnalité",
        resolved:
          "Obtenir toutes les valeurs de fonctionnalités résolues pour un locataire (affiche la source : Dérogation/Édition/Défaut)",
      },
    },

    compliance: {
      overview: {
        title: "[FR] Compliance Module",
        description: "[FR] GDPR, CCPA, and PDPA compliance automation — regulations, DSR handling, consent management, data retention, inventory, and report generation.",
        intro: "[FR] The Compliance module is NEXORA's built-in regulatory compliance engine. It helps platform operators and their tenants stay compliant with major data protection laws (GDPR, CCPA, PDPA) through automated tools for managing data subject requests, consent records, retention policies, and generating audit-ready compliance reports.",
        infoTitle: "[FR] Compliance Notice",
        infoContent: "[FR] The Compliance module is critical for maintaining regulatory adherence and avoiding fines. Ensure all features are correctly mapped to data processing policies.",
        descDsr: "[FR] Handles Subject Requests (Export, Erasure, Rectification)",
        descConsent: "[FR] Immutable tracking of consent states & snapshots",
        descRet: "[FR] Enforces data destruction policies based on age",
        descInv: "[FR] Maps sensitive PII locations across modules",
        descRep: "[FR] Generates RoPA and DPIA compliance reports",
        descId: "[FR] Identity Module",
        descIdDesc: "[FR] Provides User/Admin context & Auth",
        descEnt: "[FR] Entitlements Module",
        descEntDesc: "[FR] Feature-gates compliance capabilities",
        conn1: "[FR] initiates requests",
        conn2: "[FR] grants/revokes",
        conn3: "[FR] gates policies",
        conn4: "[FR] guides erasure",
        conn5: "[FR] targets data",
        conn6: "[FR] audit trails",
        conn7: "[FR] audit trails",
        th1: "[FR] Component",
        th2: "[FR] Responsibility",
        tr1_1: "[FR] DsrListViewModel",
        tr1_2: "[FR] Handles the pagination, filtering, and assignment of incoming Data Subject Requests.",
        tr2_1: "[FR] ConsentRecordView",
        tr2_2: "[FR] Renders the immutable consent snapshot alongside user agent and timestamp metadata.",
        whatIsTitle: "[FR] What is the Compliance Module?",
        whatIsIntro: "[FR] The Compliance module provides six interconnected sub-systems that cover the full compliance lifecycle. Instead of building compliance tooling from scratch, NEXORA tenants get a production-ready system that tracks, automates, and reports on their data protection obligations.",
        subModulesTitle: "[FR] Six Sub-Systems",
        subModulesIntro: "[FR] Each sub-system handles a specific compliance domain:",
        sub1: "[FR] Regulation Profiles — Stores the regulatory frameworks (GDPR, CCPA, PDPA) that the platform operates under.",
        sub2: "[FR] Data Subject Requests (DSR) — Manages rights requests from data subjects (export, erasure, rectification, restriction).",
        sub3: "[FR] Consent Management — Records, tracks, and audits user consent grants and withdrawals.",
        sub4: "[FR] Data Retention Policies — Defines how long data is kept and what happens when it expires (delete or anonymize).",
        sub5: "[FR] Data Inventory — A registry of all personal data categories the platform processes.",
        sub6: "[FR] Compliance Reports — Generates async audit-ready reports (GDPR Overview, DSR Summary, Consent Audit, etc.).",
        backendTitle: "[FR] Backend Architecture",
        backendIntro: "[FR] The Compliance backend follows the standard NEXORA 3-project module layout (Domain / Application / Infrastructure) with a dedicated ComplianceDbContext and ComplianceController.",
        frontendTitle: "[FR] Frontend Architecture",
        frontendIntro: "[FR] The frontend is organized as six independent sub-modules under src/modules/compliance/, each with its own domain, data, and presentation layers following the View/ViewModel pattern.",
        endpointsTitle: "[FR] API Endpoints Overview",
        endpointsIntro: "[FR] All endpoints are under /api/v1/compliances/ and require authentication with the compliance.view permission.",
      },
      dsr: {
        title: "[FR] Data Subject Requests (DSR)",
        description: "[FR] Manage GDPR/CCPA rights requests — export, erasure, rectification, and restriction — with full lifecycle tracking.",
        intro: "[FR] Data Subject Requests (DSRs) are formal requests from individuals exercising their rights under data protection laws. The Compliance module provides a complete DSR workflow: submission, assignment, processing, and closure — with full audit trail and SLA tracking.",
        typesTitle: "[FR] Request Types",
        typesIntro: "[FR] The system supports four DSR types as defined by GDPR Article 17 and CCPA:",
        type1: "[FR] Export — Data portability request. The subject wants a copy of their personal data.",
        type2: "[FR] Erasure — Right to be forgotten. All personal data must be deleted or anonymized.",
        type3: "[FR] Rectification — Correction request. Inaccurate personal data must be updated.",
        type4: "[FR] Restriction — Processing restriction. Data can be retained but not actively processed.",
        lifecycleTitle: "[FR] Request Lifecycle",
        lifecycleIntro: "[FR] DSRs move through a defined set of statuses from submission to closure:",
        status1: "[FR] Pending — Initial state when the request is received.",
        status2: "[FR] InProgress — A compliance officer has been assigned and is processing the request.",
        status3: "[FR] Completed — The request has been fulfilled (data exported, erased, corrected, or restricted).",
        status4: "[FR] Rejected — The request was rejected (e.g. insufficient identity verification).",
        slasTitle: "[FR] GDPR SLA Requirements",
        slasIntro: "[FR] Under GDPR Article 12, data controllers must respond to DSRs within 30 days (extendable to 3 months for complex requests). NEXORA tracks the submission date for each DSR to help you meet these deadlines.",
        lifecycleFlowTitle: "[FR] DSR Lifecycle Flow",
        nodeSubmit: "[FR] Submit Request",
        descSubmit: "[FR] Subject requests Export, Erasure, or Rectification",
        nodePending: "[FR] Status: Pending",
        descPending: "[FR] Request is logged, SLA deadline calculated",
        nodeProcessing: "[FR] Status: Processing",
        descProcessing: "[FR] DsrExecutionJob begins processing modules via ISuspendableModule",
        nodeApproval: "[FR] Wait For Admin",
        descApproval: "[FR] Nuclear actions (Erasure) require manual admin confirmation",
        nodeCompleted: "[FR] Status: Completed",
        descCompleted: "[FR] Export generated or data erased; SLA fulfilled",
        nodeRejected: "[FR] Status: Rejected",
        descRejected: "[FR] Request denied by admin with resolution notes",
        conn1: "[FR] initiates",
        conn2: "[FR] background job picks up",
        conn3: "[FR] if auto-processed (Export)",
        conn4: "[FR] if nuclear (Erasure)",
        conn5: "[FR] admin confirms",
        conn6: "[FR] admin rejects",
        entitiesTitle: "[FR] Entities",
        entityName: "[FR] Entity Name",
        entityDesc: "[FR] Description",
        entityDsrDesc: "[FR] Represents a data subject request.",
        entityModuleDesc: "[FR] Execution state of a module.",
        entityStatusDesc: "[FR] History of status changes.",
        codeTitle: "[FR] Code Example",
        endpointsTitle: "[FR] API Endpoints",
        endpointsIntro: "[FR] The DSR controller exposes 6 endpoints for the full DSR lifecycle:",
        ep: {
          list: "[FR] List all DSRs (paginated, filterable by status/type/regulation)",
          get: "[FR] Get DSR details by ID",
          create: "[FR] Submit a new DSR",
          updateStatus: "[FR] Update DSR status (InProgress, Completed, Rejected)",
          assign: "[FR] Assign DSR to a compliance officer",
          delete: "[FR] Soft-delete a DSR",
        },
      },
      consent: {
        title: "[FR] Consent Management",
        description: "[FR] Record, track, and audit user consent grants and withdrawals for GDPR Article 6 and CCPA compliance.",
        intro: "[FR] Consent Management records every time a user grants or withdraws consent for a specific purpose (e.g. marketing emails, analytics tracking). NEXORA stores the full consent audit trail including timestamp, IP address, user agent, and the exact consent version shown.",
        purposesTitle: "[FR] Consent Purposes",
        purposesIntro: "[FR] Each consent record is tied to a specific purpose. Common purposes include:",
        purpose1: "[FR] Marketing — Email marketing and promotional communications.",
        purpose2: "[FR] Analytics — Usage analytics and product improvement.",
        purpose3: "[FR] ThirdParty — Sharing data with third-party services.",
        purpose4: "[FR] Personalization — Personalized content and recommendations.",
        gdprTitle: "[FR] GDPR Lawful Basis",
        gdprIntro: "[FR] Under GDPR Article 6, consent must be: freely given, specific, informed, and unambiguous. NEXORA records the exact consent text version shown to the user and the timestamp it was accepted, providing a legally defensible audit trail.",
        withdrawalTitle: "[FR] Consent Withdrawal",
        withdrawalIntro: "[FR] Users can withdraw consent at any time. When consent is withdrawn, the ConsentRecord is updated with WithdrawnAt timestamp. Downstream systems should be notified via domain events to stop processing data for the withdrawn purpose.",
        flowTitle: "[FR] Consent State Flow",
        nodePurpose: "[FR] Consent Purpose",
        descPurpose: "[FR] Defines what is being consented to (e.g. Marketing)",
        nodeRecord: "[FR] Consent Record",
        descRecord: "[FR] User's current state (Granted/Revoked) per purpose",
        nodeSnapshot: "[FR] Consent Snapshot",
        descSnapshot: "[FR] Immutable point-in-time capture of consent grant/revoke",
        nodeJob: "[FR] Consent Expiry Job",
        descJob: "[FR] Daily job revokes expired consents",
        conn1: "[FR] templates",
        conn2: "[FR] generates on change",
        conn3: "[FR] auto-revokes if expired",
        immutabilityTitle: "[FR] Immutability",
        immutabilityIntro: "[FR] Consent records are immutable and track integrity.",
        endpointsTitle: "[FR] API Endpoints",
        ep: {
          list: "[FR] List all consent records (paginated, filterable by purpose/status)",
          get: "[FR] Get consent record by ID",
          record: "[FR] Record a new consent grant",
          withdraw: "[FR] Withdraw a previously granted consent",
        },
      },
      retention: {
        title: "[FR] Data Retention Policies",
        description: "[FR] Define data retention periods and automated expiry actions (Delete or Anonymize) for GDPR Article 5(1)(e) compliance.",
        intro: "[FR] Data Retention Policies define how long specific categories of data must be kept and what happens when the retention period expires. NEXORA enforces these policies automatically via background jobs, removing the manual overhead of managing data lifecycles.",
        policiesTitle: "[FR] Policy Configuration",
        policiesIntro: "[FR] Each retention policy specifies:",
        field1: "[FR] DataCategory — The type of data (e.g. 'User Profiles', 'Transaction Logs', 'Consent Records').",
        field2: "[FR] RetentionDays — How many days the data must be retained.",
        field3: "[FR] ExpiryAction — What happens when the period expires: Delete or Anonymize.",
        field4: "[FR] RegulationCode — Which regulation requires this retention period (GDPR, CCPA, etc.).",
        actionsTitle: "[FR] Expiry Actions",
        actionsIntro: "[FR] When a retention period expires, NEXORA applies one of two actions:",
        action1: "[FR] Delete — Permanently removes all records matching the data category.",
        action2: "[FR] Anonymize — Replaces personally identifiable information with pseudonymous tokens, preserving aggregate analytics data.",
        automationTitle: "[FR] Automated Enforcement",
        automationIntro: "[FR] The RetentionEnforcementJob runs daily at 3:00 AM UTC, scanning all active retention policies and applying the configured expiry action to eligible records. Each enforcement run creates a RetentionExecution audit record.",
        nodePolicy: "[FR] Retention Policy",
        descPolicy: "[FR] Defines entity type, age limit, and destruction strategy",
        nodeEnforcement: "[FR] Retention Enforcement Job",
        descEnforcement: "[FR] Weekly job to evaluate policies",
        nodeExecution: "[FR] Retention Execution",
        descExecution: "[FR] Audit trail of the destruction action",
        nodeAction: "[FR] Data Destruction",
        descAction: "[FR] Hard deletion or Anonymization via ISuspendableModule",
        conn1: "[FR] scanned by",
        conn2: "[FR] triggers",
        conn3: "[FR] logs",
        endpointsTitle: "[FR] API Endpoints",
        ep: {
          list: "[FR] List all retention policies",
          executions: "[FR] List enforcement execution history",
          update: "[FR] Update a retention policy (days, action, active status)",
        },
      },
      inventory: {
        title: "[FR] Data Inventory",
        description: "[FR] A registry of all personal data categories the platform processes — required for GDPR Article 30 Records of Processing Activities (RoPA).",
        intro: "[FR] The Data Inventory is a structured registry of all personal data categories that the platform processes. Under GDPR Article 30, controllers must maintain Records of Processing Activities (RoPA) — the Data Inventory is NEXORA's implementation of this requirement.",
        fieldsTitle: "[FR] Inventory Fields",
        fieldsIntro: "[FR] Each inventory item documents:",
        field1: "[FR] DataCategory — Human-readable name of the data category (e.g. 'Email Addresses', 'Payment Information').",
        field2: "[FR] LegalBasis — The GDPR lawful basis for processing (Consent, Contract, Legal Obligation, Vital Interests, Public Task, Legitimate Interests).",
        field3: "[FR] DataSubjects — Who the data belongs to (e.g. 'End users', 'Employees', 'Customers').",
        field4: "[FR] ProcessingPurpose — Why the data is processed (e.g. 'Order fulfillment', 'Marketing', 'Legal compliance').",
        field5: "[FR] StorageLocation — Where the data is stored (country/region for cross-border transfer compliance).",
        field6: "[FR] RetentionPeriod — How long the data is retained (linked to the retention policy).",
        field7: "[FR] ThirdPartySharing — Whether the data is shared with third parties and which ones.",
        ropaTitle: "[FR] Article 30 Compliance",
        ropaIntro: "[FR] Organizations with 250+ employees or processing high-risk data must maintain a RoPA under GDPR Article 30. NEXORA's Data Inventory serves as a live, queryable RoPA that can be exported for regulatory inspections.",
        endpointsTitle: "[FR] API Endpoints",
        ep: {
          list: "[FR] List all data inventory items (paginated, searchable)",
          get: "[FR] Get item by ID",
          create: "[FR] Add a new data category to the inventory",
          update: "[FR] Update an existing inventory item",
          delete: "[FR] Remove an item from the inventory",
        },
      },
      reports: {
        title: "[FR] Compliance Reports",
        description: "[FR] Generate async audit-ready compliance reports (GDPR Overview, DSR Summary, Consent Audit, Retention Analysis, Data Inventory Export).",
        intro: "[FR] Compliance Reports are asynchronously generated documents that provide audit-ready summaries of your compliance posture. Reports are generated in the background and stored for download once ready, supporting regulatory inspections, internal audits, and executive reporting.",
        reportTypesTitle: "[FR] Report Types",
        reportTypesIntro: "[FR] Five report types are available:",
        type1: "[FR] GDPR Overview — High-level summary of GDPR compliance status across all sub-modules.",
        type2: "[FR] DSR Activity Summary — Statistics on DSR volume, types, completion rates, and SLA adherence.",
        type3: "[FR] Consent Audit — Full log of consent grants and withdrawals by purpose and time period.",
        type4: "[FR] Retention Analysis — Current enforcement status of all active retention policies.",
        type5: "[FR] Data Inventory Export — Full export of the data inventory (Article 30 RoPA).",
        asyncTitle: "[FR] Asynchronous Generation",
        asyncIntro: "[FR] Reports are generated asynchronously to avoid blocking HTTP requests for large datasets. When you request a report, the system immediately creates a ComplianceReport record with IsReady=false and queues the generation job. Poll the reports list to check when IsReady becomes true.",
        asyncTip: "[FR] Use the Refresh button in the Reports UI to poll for report readiness. Reports typically complete within 30–60 seconds for datasets up to 10,000 records.",
        downloadTitle: "[FR] Downloading Reports",
        downloadIntro: "[FR] Once a report is ready (IsReady=true), a DownloadUrl is available. The download endpoint serves the report file securely. Report files are retained for 90 days before automatic cleanup.",
        endpointsTitle: "[FR] API Endpoints",
        ep: {
          list: "[FR] List all compliance reports (paginated, filterable by type/status)",
          get: "[FR] Get report details and download URL by ID",
          generate: "[FR] Queue a new report generation job",
          download: "[FR] Download the generated report file",
        },
      },
    },
  },
};
