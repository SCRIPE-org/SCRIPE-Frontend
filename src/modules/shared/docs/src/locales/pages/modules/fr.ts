// FILE-EXCEPTION: file length
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
        "Le module des Droits (Entitlements) est le moteur de gestion des plans et des fonctionnalités de SCRIPE. Il définit les capacités que chaque locataire (tenant) obtient, comment les plans (éditions) regroupent ces capacités, et comment les abonnements lient les locataires aux plans.",
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
        "SCRIPE intègre les droits directement dans le pipeline CQRS de SCRIPE mediator via FeatureCheckBehavior. Les commandes et requêtes (queries) qui implémentent IRequireFeature sont automatiquement contrôlées — si la valeur résolue de la fonctionnalité pour le locataire est désactivée, la requête est rejetée avant d'atteindre le gestionnaire (handler).",
      pipelineTip:
        "Pour conditionner une commande à une fonctionnalité, implémentez simplement IRequireFeature et définissez RequiredFeatureName sur la clé système stable de la fonctionnalité (ex. 'Chat.Enabled'). Aucun code supplémentaire n'est nécessaire.",
      backendTitle: "Structure du Backend",
      backendIntro:
        "Le backend des Droits suit l'architecture standard des modules Clean Architecture de SCRIPE avec les couches Domain, Application et Infrastructure.",
      frontendTitle: "Structure du Frontend",
      frontendIntro:
        "Le frontend reflète le backend avec quatre sous-modules (éditions, fonctionnalités, abonnements, surcharges), chacun suivant le modèle SOLID View/ViewModel.",
      controllersTitle: "Contrôleurs API",
      controllersIntro:
        "Le module des Droits expose 31 points de terminaison (endpoints) API répartis sur 4 contrôleurs, tous authentifiés par JWT et protégés par une autorisation basée sur les permissions.",
      noOpTitle: "Solution de repli NoOp (Fallback)",
      noOpIntro:
        "Lorsque le module des Droits n'est pas chargé (ex. dans un microservice qui n'inclut pas les Droits), SCRIPE enregistre un NoOpFeatureCache. Cela permet aux commandes IRequireFeature de passer sans erreur — toutes les fonctionnalités sont traitées comme activées par défaut.",
      noOpNote:
        "La solution de repli NoOp garantit que les modules peuvent utiliser IRequireFeature sans dépendance stricte au module des Droits. En mode monolithe de production, le véritable FeatureCache est toujours disponible.",
      contextAwareTitle: "Filtrage contextuel des périmètres",
      contextAwareIntro:
        "Toutes les pages de droits (Fonctionnalités, Éditions, Permissions) sont contextuelles. Le frontend détecte si l'utilisateur est un administrateur système (tenantId est null), un administrateur de locataire ou en mode drill-down, et appelle des endpoints backend différents en conséquence. Les administrateurs système voient le catalogue complet avec CRUD ; les administrateurs de locataires voient uniquement leurs données effectives en mode lecture seule.",
      resolutionTip:
        "La chaîne de résolution est évaluée de manière paresseuse (lazy) — les valeurs sont mises en cache après la première résolution et invalidées lorsque les abonnements, les éditions ou les surcharges changent.",
      cqrsMapTitle: "Carte des Commandes et Requêtes CQRS",
      cqrsMapIntro:
        "Le module des Droits enregistre 31 gestionnaires (handlers) SCRIPE mediator couvrant les quatre domaines. Chaque commande possède un validateur FluentValidation correspondant pour la validation des entrées.",
      diTitle: "Enregistrement de l'Injection de Dépendances",
      diIntro:
        "Tous les services de Droits sont enregistrés via la méthode d'extension AddEntitlementsModule dans DependencyInjection.cs. Le module suit le modèle d'enregistrement standard de SCRIPE.",
      comparisonTitle: "Avec vs Sans Droits",
      comparisonIntro:
        "Le tableau suivant montre la différence de capacités lorsque le module des Droits est activé par rapport à une exécution sans celui-ci :",
      gettingStartedTitle: "Premiers Pas",
      gettingStartedIntro:
        "Suivez ces 5 étapes pour configurer le système de Droits pour votre plateforme. Chaque étape s'appuie sur la précédente :",
      quotaGatingTitle: "Contrôle des quotas et réservations de créneaux",
      quotaGatingIntro:
        "Les fonctionnalités numériques représentent des quotas appliqués lors de la création des ressources du locataire. SCRIPE utilise un modèle de réservation atomique sécurisé pour gérer ces limites.",
      quotaGatingNote:
        "La méthode TryReserveSlotAsync de QuotaCounterRepository incrémente le compteur réservé. Le gestionnaire confirme cette réservation en cas de succès ou la libère en cas d'échec.",
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
        "SCRIPE offre deux façons de mettre à jour les fonctionnalités d'une édition, chacune adaptée à des scénarios différents :",
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
        "SCRIPE prend en charge deux types d'éditions : Les éditions Système, créées par les administrateurs de la plateforme et visibles par tous les locataires, et les éditions de Détail (Retail), créées par les locataires revendeurs uniquement pour leurs sous-locataires.",
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
      seededTitle: "Éditions système prédéfinies",
      seededIntro:
        "La plateforme initialise deux éditions système standard au démarrage via EditionSeeder, établissant les limites par défaut des fonctionnalités.",
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
        "SCRIPE fait la distinction entre les fonctionnalités système (insérées au démarrage, en lecture seule) et les fonctionnalités personnalisées (créées par les administrateurs via l'API) :",
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

    // ── Plugins Module ───────────────────────────────────────
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
          "Cartographie les emplacements sensibles des PII à travers les modules, requis pour le Registre des Activités de Traitement (RoPA) de l'Article 30 du RGPD.",
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
        connApproveConfirm: "Requis pour l'effacement",
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
          "Fonctionnalités essentielles requises pour le fonctionnement de la plateforme. (Obligatoire, base juridique contractuelle).",
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
        connLedgerUpsert: "met à jour l'état du cache depuis",
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
        title: "Politiques de conservation des données",
        description:
          "Définir les périodes de conservation et les actions d'expiration (Suppression ou Anonymisation) pour l'Article 5(1)(e) du RGPD.",
        intro:
          "Définissez la durée de conservation de catégories de données et ce qui se passe à l'expiration. SCRIPE applique cela automatiquement via des tâches en arrière-plan.",
        policiesTitle: "Configuration de la politique",
        policiesIntro: "Chaque politique de conservation spécifie :",
        field1: "DataCategory — Le type de données (ex: 'Profils Utilisateurs').",
        field2: "RetentionDays — Combien de jours les données doivent être conservées.",
        field3:
          "ExpiryAction — Ce qui se passe à l'expiration : Delete (Supprimer) ou Anonymize (Anonymiser).",
        field4: "RegulationCode — Quelle réglementation l'exige (RGPD, CCPA, etc.).",
        actionsTitle: "Actions d'expiration",
        actionsIntro: "À l'expiration, SCRIPE applique l'une des deux actions :",
        action1: "Delete — Supprime définitivement tous les enregistrements correspondants.",
        action2: "Anonymize — Remplace les PII par des jetons pseudonymes.",
        automationTitle: "Application automatisée",
        automationIntro:
          "La tâche RetentionEnforcementJob s'exécute quotidiennement à 3h00 UTC, scannant toutes les politiques actives et appliquant l'action configurée.",
        nodePolicy: "Politique de conservation",
        descPolicy: "Définit le type d'entité, la durée de vie et la stratégie",
        nodeEnforcement: "Tâche d'application de la conservation",
        descEnforcement: "Tâche hebdomadaire évaluant les politiques",
        nodeExecution: "Exécution de la conservation",
        descExecution: "Piste d'audit de l'action de destruction",
        nodeAction: "Destruction des données",
        descAction: "Suppression définitive ou Anonymisation",
        conn1: "scanné par",
        conn2: "déclenche",
        conn3: "enregistre",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Lister toutes les politiques de conservation",
          executions: "Lister l'historique d'exécution",
          update: "Mettre à jour une politique (jours, action, état)",
        },
      },
      inventory: {
        title: "Inventaire des données",
        description:
          "Un registre de toutes les catégories de données personnelles traitées — requis pour les Registres d'activités de traitement (RoPA) Article 30 du RGPD.",
        intro:
          "L'inventaire des données est un registre structuré de toutes les catégories de données personnelles que la plateforme traite.",
        fieldsTitle: "Champs de l'inventaire",
        fieldsIntro: "Chaque élément documente :",
        field1: "DataCategory — Nom lisible (ex: 'Adresses e-mail').",
        field2: "LegalBasis — Base légale du RGPD (Consentement, Contrat, etc.).",
        field3: "DataSubjects — À qui appartiennent les données.",
        field4: "ProcessingPurpose — Pourquoi les données sont traitées.",
        field5: "StorageLocation — Où les données sont stockées.",
        field6: "RetentionPeriod — Durée de conservation (lié à la politique).",
        field7: "ThirdPartySharing — Si partagé avec des tiers.",
        ropaTitle: "Conformité à l'Article 30",
        ropaIntro:
          "Les organisations de plus de 250 employés doivent maintenir un RoPA. L'inventaire sert de RoPA en direct et interrogeable.",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Lister tous les éléments de l'inventaire (paginé, cherchable)",
          get: "Obtenir l'élément par ID",
          create: "Ajouter une nouvelle catégorie de données",
          update: "Mettre à jour un élément existant",
          delete: "Supprimer un élément de l'inventaire",
        },
      },
      reports: {
        title: "Rapports de conformité",
        description:
          "Générer des rapports asynchrones prêts pour l'audit (Aperçu RGPD, Résumé DSR, Audit Consentement, Analyse Conservation, Export Inventaire).",
        intro:
          "Les rapports de conformité sont générés de manière asynchrone et fournissent des résumés prêts pour l'audit. Ils sont générés en arrière-plan et stockés pour le téléchargement.",
        reportTypesTitle: "Types de rapports",
        reportTypesIntro: "Cinq types sont disponibles :",
        type1: "Aperçu RGPD — Résumé de haut niveau du statut RGPD.",
        type2:
          "Résumé de l'activité DSR — Statistiques sur les volumes DSR, types, taux d'achèvement.",
        type3: "Audit du consentement — Journal complet des accords et révocations.",
        type4: "Analyse de la conservation — État d'application actuel des politiques actives.",
        type5:
          "Export de l'inventaire des données — Export complet de l'inventaire (Article 30 RoPA).",
        asyncTitle: "Génération asynchrone",
        asyncIntro:
          "Les rapports sont asynchrones pour éviter de bloquer les requêtes HTTP. Le système crée immédiatement un ComplianceReport (IsReady=false) et met la tâche en file d'attente.",
        asyncTip:
          "Utilisez le bouton Rafraîchir pour vérifier si le rapport est prêt (généralement 30-60 secondes).",
        downloadTitle: "Téléchargement des rapports",
        downloadIntro:
          "Une fois prêt (IsReady=true), DownloadUrl est disponible. Les fichiers sont conservés 90 jours.",
        endpointsTitle: "Endpoints API",
        ep: {
          list: "Lister tous les rapports de conformité",
          get: "Obtenir les détails du rapport et l'URL de téléchargement",
          generate: "Mettre en file d'attente une nouvelle génération de rapport",
          download: "Télécharger le fichier généré",
        },
      },
    },
    hrms: {
      overview: {
        title: "Module HRMS",
        description:
          "Human Resource Management System régissant les profils du personnel, l'emploi, les qualifications, les certifications, la disponibilité et les affectations.",
        intro:
          "Le module HRMS est la source de vérité pour les ressources en personnel de la plateforme. Il gère les profils des membres du personnel, les contrats de travail, les qualifications, les certifications professionnelles, les disponibilités et les affectations.",
        infoTitle: "Principe de Conception",
        infoContent:
          "Les enregistrements HRMS pointent vers les acteurs Identity via des références d'ID stables, et non via des clés étrangères de base de données.",
        whatIsTitle: "Qu'est-ce que le HRMS ?",
        whatIsIntro:
          "C'est le cœur administratif pour les managers, les entraîneurs et le personnel.",
        featureStaff: "Profils du Personnel",
        featureStaffDesc:
          "Détails personnels et professionnels, y compris les contacts d'urgence et le statut d'emploi.",
        featureCompliance: "Qualifications & Certifications",
        featureComplianceDesc:
          "Certificats bilingues, dates de vérification et validation de conformité pour les sessions de coaching.",
        modelTitle: "Modèle de Données",
        modelIntro:
          "Régit des entités telles que StaffMember, EmploymentRecord, Qualification, Certification, StaffAvailability et StaffAssignment.",
        permsTitle: "Autorisations",
        permsIntro:
          "L'accès est contrôlé via les autorisations : hrms.staff.view, hrms.staff.create, hrms.staff.update et hrms.staff.delete.",
      },
    },
    partyKernel: {
      overview: {
        title: "Module Party Kernel",
        description:
          "L'annuaire commercial central gérant les personnes, les organisations, les points de contact, les relations et les candidats à la fusion de données.",
        intro:
          "Le module Party Kernel est le registre principal pour les entités commerciales. Il suit les personnes et les organisations, leurs coordonnées et leurs relations.",
        infoTitle: "Principe de Conception",
        infoContent:
          "Party Kernel utilise un schéma neutre représentant tous les acteurs commerciaux (Clients, Tuteurs, Personnel) sous forme de Parties génériques.",
        whatIsTitle: "Qu'est-ce que Party Kernel ?",
        whatIsIntro: "Il forme la base du CRM et de la facturation.",
        featureParties: "Parties Génériques",
        featurePartiesDesc: "Représentation uniforme des individus et des entités juridiques.",
        featureMerge: "Dédoublonnage des Données",
        featureMergeDesc: "Identifie les enregistrements en double et facilite leur fusion propre.",
        modelTitle: "Modèle de Données",
        modelIntro:
          "Régit des entités telles que Party, PartyPerson, PartyOrganization, PartyRole, PartyRelationship et ContactPoint.",
        permsTitle: "Autorisations",
        permsIntro: "Protégé par party.view, party.create, party.update et party.delete.",
      },
    },
    organizationCore: {
      overview: {
        title: "Module Organization Core",
        description:
          "Définit la hiérarchie physique et juridique des locataires, y compris les unités commerciales, les succursales, les sites et les départements.",
        intro: "Organization Core modélise l'organigramme et la topologie des installations.",
        infoTitle: "Principe de Conception",
        infoContent:
          "La structure de l'organisation est hiérarchique, permettant des relations parent-enfant pour les succursales régionales et les sites.",
        whatIsTitle: "Qu'est-ce que Organization Core ?",
        whatIsIntro: "Il structure le lieu et la manière dont les affaires sont menées.",
        featureStructure: "Hiérarchie Organisationnelle",
        featureStructureDesc:
          "Imbrication flexible d'entités juridiques, de succursales régionales, de sites et de départements.",
        featureNodes: "Références Stables",
        featureNodesDesc:
          "Les identifiants d'organisation stables sont référencés par les modules de planification, de réservation et d'académie.",
        modelTitle: "Modèle de Données",
        modelIntro: "Régit des entités telles que BusinessUnit, Branch, Site et Department.",
        permsTitle: "Autorisations",
        permsIntro:
          "Administré via organization.view, organization.create, organization.update et organization.delete.",
      },
    },
    customFields: {
      overview: {
        title: "Module des Champs Personnalisés",
        description:
          "Définitions de champs personnalisés configurables par locataire, rattachées à tout type d'entité enregistré via une clé stable — sans changement de schéma, sans couplage entre modules.",
        intro:
          "Le module des Champs Personnalisés permet à chaque locataire d'étendre les enregistrements de la plateforme avec ses propres champs typés — par exemple une « taille de maillot » sur une personne ou un « pied préféré » sur un joueur — sans aucune migration de base de données ni modification de code. Les définitions de champ sont propres à chaque locataire et se rattachent à une entité hôte via le Registre des Types d'Entité, partagé entre modules, plutôt que via une clé étrangère, de sorte que le module ne se couple jamais au schéma d'un autre module.",
        infoTitle: "Principe de Conception",
        infoContent:
          'Les champs personnalisés sont rattachés via une clé de type d\'entité stable (par ex. "party.person"), validée par rapport au Registre des Types d\'Entité, et non via une clé étrangère de base de données. Cela maintient le module entièrement découplé et sûr à faire évoluer de manière indépendante.',
        whatIsTitle: "Que sont les Champs Personnalisés ?",
        whatIsIntro:
          "Un champ personnalisé est une extension définie par le locataire sur une entité existante. Chaque définition porte une clé machine (unique par locataire et par type d'entité), des libellés bilingues, un type de valeur, un indicateur facultatif d'obligation, une liste facultative d'options autorisées pour les champs de sélection, ainsi qu'un ordre de tri. Les valeurs sont stockées de façon typée plutôt que dans un bloc JSON non typé.",
        featureTenant: "Propre au Locataire",
        featureTenantDesc:
          "Chaque définition appartient à un locataire et est isolée par le filtre de requête global du locataire. Des définitions au niveau système (partagées) sont prises en charge pour les opérateurs de la plateforme.",
        featureRegistry: "Rattachement Validé par le Registre",
        featureRegistryDesc:
          "Les champs se rattachent à une entité hôte via sa clé de type d'entité canonique, validée par rapport au Registre des Types d'Entité partagé entre modules — jamais via une clé étrangère.",
        featureTyped: "Valeurs Typées",
        featureTypedDesc:
          "Chaque champ déclare l'un des vingt-deux types de valeur — du texte brut et des nombres jusqu'aux références, un fichier ou une image téléchargés, et du texte enrichi mis en forme — évitant ainsi un bloc de métadonnées non typé et permettant une validation appropriée.",
        featureIsolation: "Clés Immuables",
        featureIsolationDesc:
          "La clé de type d'entité et la clé machine sont immuables après création, de sorte que les valeurs déjà stockées restent adressables ; seules les métadonnées d'affichage et de comportement peuvent être modifiées.",
        valueTypesTitle: "Types de Valeur",
        valueTypesIntro:
          "Vingt-deux types de valeur sont pris en charge de bout en bout — consultez la page « Types de Valeur » de la documentation de l'opérateur pour la liste complète. Les champs Sélection et Sélection Multiple portent une liste d'options autorisées séparées par des sauts de ligne ; les autres types ne doivent porter aucune option. L'API impose cela à la fois à la création et à la mise à jour.",
        modelTitle: "Modèle de Données",
        modelIntro:
          "Un CustomField porte : EntityTypeKey (enregistré), Key (clé machine, unique par locataire + type d'entité), LabelEn / LabelAr, ValueType, IsRequired, Options (Sélection uniquement), SortOrder et IsActive. L'unicité est imposée par (TenantId, EntityTypeKey, Key).",
        isolationTitle: "Isolation des Locataires",
        isolationIntro:
          "Les lectures s'exécutent sous le filtre global de locataire du module, de sorte qu'un locataire ne voit que ses propres définitions ainsi que celles partagées au niveau système. La création horodate automatiquement le locataire actuel. La mise à jour et la suppression imposent une vérification de propriété, de sorte qu'un administrateur de locataire ne puisse jamais modifier ou supprimer une définition partagée ou celle d'un autre locataire.",
        isolationWarnTitle: "Champs au Niveau Système",
        isolationWarnContent:
          "Les définitions sans locataire sont traitées comme partagées/globales et sont visibles par tous les locataires. Seuls les principaux système (sans contexte de locataire) peuvent les modifier ou les supprimer ; les administrateurs propres à un locataire sont bloqués par la vérification de propriété.",
        permsTitle: "Autorisations",
        permsIntro:
          "Le module possède la ressource custom-fields avec les actions CRUD standard : custom-fields.view, custom-fields.create, custom-fields.update et custom-fields.delete.",
      },
    },
  },
};
