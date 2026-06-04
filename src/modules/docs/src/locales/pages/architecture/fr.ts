export const fr = {
  architecture: {
    backend: {
      controllersTitle: "Contrôleurs (Controllers)",
      controllerTip:
        "Tous les contrôleurs héritent d'un ApiController de base qui fournit un formatage de réponse standardisé Result<T>. Les contrôleurs doivent rester fins : ils ne font que valider le modèle de la requête et délèguent à AstraFlow mediator.",
      description:
        "Anatomie de Program.cs, pipeline des middlewares, carte de l'injection de dépendances (DI), modèle d'enregistrement des modules et catalogue des contrôleurs.",
      diMapIntro:
        "Le tableau suivant montre toutes les interfaces de services majeures, leurs implémentations, leurs cycles de vie (lifetimes) et où elles sont enregistrées. Comprendre cette carte est essentiel pour déboguer et étendre le système.",
      diMapTitle: "Carte des Services DI",
      intro:
        "Le backend de SCRIPE est un Monolithe Modulaire .NET 10 avec 30 lignes dans Program.cs qui délèguent la configuration de démarrage à des extensions dédiées. Cette page décortique chaque couche de l'architecture du backend.",
      middlewarePipelineIntro:
        "Le pipeline de middlewares traite chaque requête HTTP dans un ordre précis. Chaque middleware peut court-circuiter le pipeline (ex : le limiteur de débit renvoie 429, l'authentification renvoie 401). L'ordre compte : le modifier peut casser la sécurité.",
      middlewarePipelineTitle: "Pipeline de Middlewares",
      modulePatternIntro:
        "Chaque nouveau module suit le même modèle d'enregistrement DI. La méthode d'extension AddXxxModule() enregistre le DbContext du module, les dépôts (repositories), les services et le marqueur d'enregistrement du module.",
      modulePatternTitle: "Modèle d'Enregistrement de Module",
      programCsIntro:
        "Program.cs est le point d'entrée de l'application et le centre de cblage. Il détecte le mode de déploiement, enregistre les services dans un ordre spécifique et construit le pipeline des middlewares. Le fichier suit une structure claire en 5 sections.",
      programCsTitle: "Anatomie de Program.cs",
      title: "Architecture du Backend",
    },
    cqrs: {
      cachingTip:
        "Les requêtes peuvent utiliser la mise en cache côté serveur pour éviter d'interroger la base de données à chaque demande. La clé de cache doit inclure tous les paramètres de requête pour garantir son unicité. Le cache est automatiquement invalidé lorsque les commandes associées réussissent.",
      commandExampleTitle: "Exemple de Commande",
      commandSide: "Côté Commande (Écriture)",
      description:
        "Séparation des Responsabilités de Commande et de Requête avec pipeline AstraFlow mediator, comportements, validation et mise en cache.",
      intro:
        "SCRIPE utilise le modèle CQRS (Command Query Responsibility Segregation) pour séparer les opérations de lecture et d'écriture. Les commandes mutent l'état et passent par des comportements de validation et d'audit. Les requêtes (Queries) lisent l'état et peuvent tirer parti de la mise en cache. AstraFlow mediator agit comme médiateur entre les contrôleurs et les gestionnaires.",
      pipelineTitle: "Pipeline AstraFlow mediator",
      queryExampleTitle: "Exemple de Requête",
      querySide: "Côté Requête (Lecture)",
      title: "Modèle CQRS",
      validationBehaviorTitle: "Comportement de Validation",
      whatIsCqrsIntro:
        "CQRS sépare votre application en deux côtés : Commandes (écritures) et Requêtes (lectures). Chaque côté peut être optimisé indépendamment : les commandes se concentrent sur l'intégrité des données et la validation, tandis que les requêtes se concentrent sur les performances et la mise en cache.",
      whatIsCqrsTitle: "Qu'est-ce que CQRS ?",
    },
    cqrsPipeline: {
      behaviorOrderTip:
        "La validation de sécurité par défaut rejette les ordres où Caching s'exécute avant Validation ou FeatureCheck. Ne désactivez Mediator__EnforceSecurityPipelineOrder que si vous maîtrisez entièrement le risque.",
      cachingIntro:
        "Intercepte les requêtes implémentant ICacheable et vérifie le cache avant d'exécuter la base de données.",
      cachingTitle: "CachingBehavior",
      commandMapIntro:
        "Le tableau suivant répertorie chaque commande, requête et validateur enregistré dans le système.",
      commandMapTitle: "Catalogue des Commandes et Requêtes",
      commandsTitle: "Commandes (Écriture)",
      description:
        "Comportements de la pipeline du médiateur SCRIPE : LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, modèle Result et catalogue complet commandes/requêtes.",
      featureCheckIntro:
        "Le FeatureCheckBehavior intercepte les commandes implémentant IRequireFeature. Il vérifie si l'édition du locataire autorise la fonctionnalité demandée en appelant IFeatureChecker.IsEnabledAsync. Si la fonctionnalité est désactivée, il renvoie une erreur Forbidden sans exécuter le gestionnaire. Les opérations au niveau système (sans TenantId) contournent cette vérification.",
      featureCheckMarkerIntro:
        "Les commandes optent pour le contrôle des fonctionnalités en implémentant l'interface IRequireFeature avec une propriété RequiredFeatureName. Lorsque le module Entitlements n'est pas déployé, NoOpFeatureChecker renvoie true pour toutes les vérifications, rendant ce comportement transparent.",
      featureCheckMarkerTitle: "Marqueur IRequireFeature",
      featureCheckTitle: "FeatureCheckBehavior",
      intro:
        "Chaque commande et requête dans SCRIPE passe par une pipeline configurable du médiateur SCRIPE avec 5 comportements intégrés : LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior et CachingBehavior. L'ordre est géré depuis appsettings ou les variables d'environnement et validé au démarrage.",
      loggingIntro:
        "Journalise chaque requête AstraFlow mediator avec l'ID utilisateur, l'ID locataire et le temps d'exécution.",
      loggingTitle: "LoggingBehavior",
      overviewIntro:
        "L'ordre par défaut est Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. La validation et les contrôles de fonctionnalités précèdent volontairement la lecture du cache, tandis que l'invalidation du cache s'exécute avant l'envoi des webhooks après les mutations réussies.",
      overviewTitle: "Vue d'ensemble du Pipeline",
      queriesTitle: "Requêtes (Lecture)",
      registrationIntro:
        "AddCoreApplication() enregistre les comportements de pipeline depuis les options Mediator. Le scan des handlers, la validation de couverture, la politique d'échec des notifications et l'ordre de pipeline sont contrôlés par configuration.",
      registrationTitle: "Enregistrement du Pipeline",
      resultPatternIntro:
        "Tous les gestionnaires renvoient un Result<T> au lieu de lever des exceptions pour les échecs attendus, éliminant les blocs try-catch dans les contrôleurs.",
      resultPatternTitle: "Modèle de Résultat (Result Pattern)",
      separationIntro:
        "CQRS sépare l'application : les commandes (écritures) mutent l'état et valident, les requêtes (lectures) sont optimisées et mises en cache.",
      separationTitle: "Séparation Commande vs Requête",
      title: "Pipeline CQRS",
      validationIntro:
        "ValidationBehavior s'exécute juste après le logging. Il collecte tous les validateurs IValidator<TRequest>, renvoie des échecs Result structurés pour les requêtes invalides et les empêche d'atteindre les handlers ou le cache.",
      validationTitle: "ValidationBehavior",
      validatorExampleTitle: "Exemples de Validateurs",
    },
    dataFlow: {
      backendPipelineIntro:
        "Chaque requête backend passe par les middlewares puis les comportements du médiateur SCRIPE avant d'atteindre le gestionnaire. Cela garantit une journalisation, une authentification, une autorisation, une validation, un contrôle de fonctionnalités et une diffusion Webhook cohérents.",
      backendPipelineTitle: "Pipeline de Requêtes Backend",
      cacheTip:
        "Définissez staleTime à 5 minutes pour les données qui changent rarement (rôles, permissions). Utilisez 0 pour les données qui changent souvent. Invalidez toujours les requêtes liées après des mutations réussies.",
      cachingFlowIntro:
        "Le backend utilise une stratégie de cache à deux niveaux : L1 (IMemoryCache en cours de processus) et L2 (Redis distribué). Le frontend utilise le cache intégré de TanStack Query avec un staleTime configurable.",
      cachingFlowTitle: "Stratégie de Mise en Cache",
      description:
        "Diagrammes de flux de données de bout en bout : requête, mutation, pipeline backend, gestion des erreurs et stratégie de cache.",
      errorFlowIntro:
        "Les erreurs sont gérées à plusieurs niveaux. Chaque source d'erreur possède un gestionnaire spécifique, un code de réponse et une stratégie de gestion front-end.",
      errorFlowTitle: "Gestion des Erreurs",
      intro:
        "Comprendre comment les données circulent dans SCRIPE est essentiel pour déboguer et étendre le système. Cette page trace les données depuis un clic dans l'interface utilisateur jusqu'à la base de données et retour.",
      mutationFlowTitle: "Flux de Mutation (Écriture)",
      queryFlowIntro:
        "Lorsqu'un utilisateur consulte des données, le flux commence à la Vue, traverse le ViewModel, TanStack Query, le Référentiel (Repository), le Service API et enfin l'API backend.",
      queryFlowTitle: "Flux de Requête (Lecture)",
      title: "Flux de Données",
    },
    dependencyInjection: {
      architectureIntro:
        "Program.cs suit un ordre en 4 phases : (1) Infrastructure, (2) CORS, (3) Modules, (4) Couche Application (AstraFlow mediator).",
      architectureTitle: "Architecture d'Enregistrement DI",
      bestPracticesTitle: "Meilleures Pratiques DI",
      captiveTip:
        "Évitez les dépendances captives (quand un service Singleton injecte un service Scoped). Utilisez IServiceScopeFactory à la place.",
      controllerProviderIntro:
        "Filtre quels contrôleurs API sont chargés au démarrage selon le contexte du microservice.",
      controllerProviderTitle: "Module Controller Feature Provider",
      coreServicesIntro:
        "Enregistrés par AddCoreInfrastructure() et mis à la disposition de tous les modules.",
      coreServicesTitle: "Services d'Infrastructure de Base",
      description:
        "Flux d'enregistrement Program.cs, modèle DI des modules, découverte de services, règles de durée de vie et passerelle YARP.",
      gatewayIntro:
        "En mode Gateway, l'application agit comme un proxy inverse YARP routant vers les microservices.",
      gatewayTitle: "Configuration de la Passerelle YARP",
      identityModuleIntro:
        "Le module Identité enregistre des dizaines de référentiels sous une durée de vie Scoped.",
      identityModuleTitle: "Services du Module d'Identité",
      intro:
        "SCRIPE utilise le conteneur DI natif de .NET avec un modèle d'enregistrement structuré ordonné.",
      lifetimeTitle: "Règles de Durée de Vie (Lifetimes)",
      moduleRegIntro:
        "Chaque module expose une méthode d'extension AddXxxModule() qui enregistre ses propres services en fonction de la variable MODULE_NAME.",
      moduleRegTitle: "Modèle d'Enregistrement de Module",
      monolithNote:
        "En mode monolithe, TOUS les modules sont chargés ensemble. En mode microservice, chaque processus charge uniquement le sien.",
      scopedTitle: "Durée de Vie Scoped (Par Requête HTTP)",
      serviceDiscoveryIntro:
        "SCRIPE utilise une découverte basée sur la configuration pour résoudre les noms de services en URL.",
      serviceDiscoveryTitle: "Découverte de Services (Service Discovery)",
      singletonTitle: "Durée de Vie Singleton",
      title: "Injection de Dépendances (DI)",
    },
    domainEvents: {
      architectureSummaryTitle: "Résumé de l'Architecture Outbox",
      customEventsIntro: "Suivez ces 3 étapes pour ajouter un nouvel événement de domaine.",
      customEventsTitle: "Création d'Événements de Domaine Personnalisés",
      description:
        "Interface IDomainEvent, modèle Outbox, OutboxInterceptor, OutboxProcessor et livraison fiable des événements.",
      interfaceIntro:
        "Tous les événements de domaine implémentent l'interface IDomainEvent, qui hérite de INotification de AstraFlow mediator. Cela permet le modèle Pub/Sub en cours de processus.",
      interfaceTitle: "Interface IDomainEvent",
      intro:
        "Les événements de domaine représentent des occurrences significatives dans le domaine métier. SCRIPE utilise le modèle Outbox pour garantir une livraison fiable des événements.",
      outboxCleanupIntro:
        "Une tche récurrente Hangfire s'exécute quotidiennement pour purger les messages Outbox traités datant de plus de 7 jours.",
      outboxCleanupTitle: "Tche de Nettoyage de l'Outbox",
      outboxInterceptorIntro:
        "Un intercepteur EF Core qui collecte tous les événements de domaine et les sérialise avant de valider la transaction de la base de données.",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxIntro:
        "Le modèle Outbox résout le problème de la double écriture : comment mettre à jour atomiquement la base de données ET publier un événement de manière fiable.",
      outboxMessageTitle: "Entité OutboxMessage",
      outboxProcessorIntro:
        "Un service d'arrière-plan (BackgroundService) qui interroge la table OutboxMessage toutes les 5 secondes pour traiter les messages.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxTitle: "Modèle Outbox (Outbox Pattern)",
      outboxWarning:
        "Le modèle Outbox fournit une livraison 'au moins une fois' (at-least-once). Les gestionnaires d'événements doivent donc être idempotents.",
      publisherTitle: "IDomainEventPublisher",
      publishingIntro:
        "Les événements suivent un cycle de 6 étapes : déclenchement, capture par l'OutboxInterceptor, persistance dans la même transaction, sondage par l'OutboxProcessor, puis publication via AstraFlow mediator.",
      publishingTitle: "Flux de Publication et Traitement",
      reliabilityTitle: "Garanties de Fiabilité",
      step1Content: "Créez un record implémentant IDomainEvent dans Domain/Events/.",
      step1Title: "1. Définir l'événement",
      step2Content: "Appelez entity.RaiseDomainEvent(), puis SaveChangesAsync.",
      step2Title: "2. Déclencher depuis le Handler",
      step3Content: "Implémentez INotificationHandler<DomainEventNotification>.",
      step3Title: "3. Créer des Gestionnaires",
      title: "Événements de Domaine (Domain Events)",
      withOutboxTitle: "✅ Avec le Modèle Outbox",
      withoutOutboxTitle: "❌ Sans le Modèle Outbox",
    },
    domainModel: {
      auditableEntityIntro:
        "Ajoute 7 champs d'audit et de suppression logique à l'entité de base. Ces champs sont automatiquement remplis par l'AuditableEntityInterceptor.",
      auditableEntityTitle: "AuditableEntity",
      bestPracticesTitle: "Meilleures Pratiques",
      concreteEntitiesTitle: "Registre des Entités Concrètes",
      description:
        "Hiérarchie d'héritage des entités, AuditableEntity, ITenantAwareEntity, cycle de vie de la suppression logique (soft-delete) et filtres de requêtes globaux.",
      dontTitle: "❌ NE PAS FAIRE",
      doTitle: "✅ À FAIRE",
      entityBaseIntro:
        "Fournit l'égalité d'identité, la génération de code de hachage et le support des événements de domaine.",
      entityBaseTitle: "Classe de base Entity<TId>",
      entityDomainEventNote:
        "Les événements de domaine levés via RaiseDomainEvent() sont collectés par l'OutboxInterceptor lors du SaveChanges et stockés dans la même transaction.",
      entityHierarchyIntro:
        "Toutes les entités du domaine suivent une chaîne d'héritage à trois niveaux : IEntity -> Entity<TId> -> AuditableEntity. Les entités d'un locataire spécifique implémentent également l'interface ITenantAwareEntity.",
      entityHierarchyTitle: "Hiérarchie d'Héritage des Entités",
      ientityTitle: "Interface IEntity",
      ignoreFiltersTip:
        "Utilisez IgnoreQueryFilters() uniquement dans la corbeille (Recycle Bin) ou les opérations SuperAdmin inter-locataires, en ajoutant toujours un filtre explicite.",
      intro:
        "Le modèle de domaine de SCRIPE suit une hiérarchie d'héritage stricte où toutes les entités métier héritent de AuditableEntity. Les entités liées à un locataire implémentent en plus ITenantAwareEntity pour une isolation automatique des données.",
      queryFiltersIntro:
        "Les filtres EF Core s'appliquent automatiquement à chaque requête LINQ pour les entités héritant de AuditableEntity ou ITenantAwareEntity.",
      queryFiltersTitle: "Filtres de Requêtes Globaux",
      repositoryIntro:
        "SCRIPE définit trois interfaces : IReadRepository<T> pour les lectures, IWriteRepository<T> pour les écritures, et IRepository<T> qui combine les deux.",
      repositoryTitle: "Abstractions de Référentiels (Repositories)",
      softDeleteIntro:
        "Toutes les entités utilisent la suppression logique via l'indicateur IsDeleted. Un endpoint DELETE convertit la demande en suppression logique sans détruire physiquement l'enregistrement.",
      softDeleteTitle: "Cycle de vie de la Suppression Logique (Soft-Delete)",
      tenantAwareIntro:
        "Les entités qui implémentent ITenantAwareEntity sont automatiquement restreintes au locataire (tenant) actuel via les filtres de requête globaux d'EF Core.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantIsolationWarning:
        "Ne contournez jamais l'isolation du locataire sans autorisation explicite. L'utilisation d'IgnoreQueryFilters() supprime TOUS les filtres, y compris l'étendue du locataire.",
      title: "Modèle de Domaine (Domain Model)",
    },
    frontend: {
      connectorPatternIntro:
        "Le modèle connecteur sépare les pages du routeur d'application Next.js (Server Components) des Vues du module (Client Components). Les pages dans src/app/ sont de simples connecteurs qui importent et affichent les Vues du module. Elles ne gèrent que le routage, les métadonnées et les paramètres d'URL.",
      connectorPatternTitle: "Modèle Connecteur",
      connectorWarning:
        "Ne placez JAMAIS de logique métier, de requêtes de données, de formulaires ou de gestion d'état dans les fichiers src/app/. Ce sont des Server Components qui connectent uniquement les routes aux Vues du module.",
      description:
        "Modèle Vue/ViewModel SOLID, structure des modules et modèle connecteur pour l'intégration de Next.js.",
      intro:
        "Le frontend de SCRIPE est construit avec Next.js 16 (App Router) en suivant un modèle strict Vue/ViewModel SOLID. Chaque page est composée d'une Vue (UI pure) qui délègue toute la logique aux hooks du ViewModel. Cette séparation garantit la testabilité, la réutilisation et la maintenabilité.",
      moduleStructureTitle: "Structure de Fichiers du Module",
      solidPatternIntro:
        "Le modèle SOLID garantit que chaque composant de l'interface utilisateur a une responsabilité unique. Les Vues rendent le JSX, les ViewModels gèrent l'état et la logique, et les Composants fournissent des sections d'interface utilisateur réutilisables.",
      solidPatternTitle: "Modèle Vue/ViewModel SOLID",
      title: "Architecture du Frontend",
      viewDo: "Une Vue DOIT",
      viewDont: "Une Vue NE DOIT PAS",
      viewExampleTitle: "Exemple de Vue",
      viewModelRulesIntro:
        "Les ViewModels sont des hooks React qui contiennent toute la logique métier. Ils composent des ViewModels spécifiques aux sections (statistiques, filtres, tableaux) et renvoient des interfaces typées consommées par les Vues.",
      viewModelRulesTitle: "Règles du ViewModel",
      viewRulesTitle: "Règles de la Vue",
    },
    modules: {
      allowedImportsTitle: "Importations Autorisées",
      backendModuleIntro:
        "Chaque module backend suit la conception pilotée par le domaine (DDD) avec trois projets : Domaine, Application et Infrastructure. Le Domaine est du C# pur sans dépendances externes.",
      backendModuleTitle: "Modèle de Module Backend",
      boundaryWarning:
        "Les limites des modules sont une loi absolue. Si vous devez partager du code entre les modules, il DOIT aller dans @core/. Toute importation depuis @modules/{autre}/ est une violation et sera détectée lors de la revue de code.",
      communicationTitle: "Modèles de Communication Inter-Modules",
      description:
        "Règles d'isolation des modules, modèles backend/frontend, registre de modules et communication inter-modules.",
      forbiddenImportsTitle: "Importations Interdites",
      frontendModuleTitle: "Modèle de Module Frontend",
      intro:
        "SCRIPE utilise un système de modules strict où chaque module est une île isolée avec des limites claires. Les modules ne peuvent pas s'importer mutuellement : ils communiquent uniquement via des URL, des ID partagés ou le bus d'événements principal. Cela garantit l'indépendance, la testabilité et la capacité d'extraire les modules.",
      isolationRulesTitle: "Règles d'Isolation des Modules",
      pattern1Content:
        "Accédez à la page d'un autre module via des liens URL standards. Aucune importation nécessaire.",
      pattern1Title: "Modèle 1 : Navigation URL",
      pattern2Content:
        "Stockez uniquement l'ID d'entité du module étranger. N'intégrez jamais l'entité complète.",
      pattern2Title: "Modèle 2 : ID partagés uniquement",
      pattern3Content:
        "Publiez et abonnez-vous à des événements via un bus partagé dans @core/. (Modèle futur, pas encore implémenté).",
      pattern3Title: "Modèle 3 : Core Event Bus",
      registryIntro:
        "Le registre des modules suit tous les modules actifs au moment de l'exécution. Il est rempli lors du démarrage de l'application lorsque l'implémentation IModuleRegistration de chaque module est résolue et enregistrée.",
      registryTitle: "Registre des Modules",
      title: "Système de Modules",
    },
    overview: {
      backendArchIntro:
        "Le backend suit une architecture de pipeline de requêtes où chaque requête HTTP passe par des middlewares, des contrôleurs, des comportements (behaviors) AstraFlow mediator, puis le gestionnaire CQRS. Cela garantit une validation, un audit et une gestion des erreurs cohérents.",
      backendArchTitle: "Architecture du Backend",
      communicationPatternsTitle: "Communication Inter-Modules",
      crossModuleNote:
        "Le modèle de Bus d'Événements (Event Bus) est prévu pour les futures versions. Actuellement, les modules communiquent exclusivement par navigation URL et ID partagés.",
      description:
        "Couches Clean Architecture, pipeline backend, flux SOLID frontend et règles de limites de modules.",
      frontendArchIntro:
        "Le frontend utilise un modèle Vue/ViewModel SOLID où les Vues sont de la pure UI (sans état, sans logique) et les ViewModels contiennent toute la logique métier. Le modèle connecteur sépare le routage Next.js (Server Components) de la logique applicative (Client Components).",
      frontendArchTitle: "Architecture du Frontend",
      intro:
        "SCRIPE suit une Clean Architecture stricte avec quatre couches : Présentation, Application, Domaine et Infrastructure. La règle de dépendance garantit que les couches internes ne dépendent jamais des couches externes. Cette architecture s'applique au backend et au frontend.",
      layersTitle: "Couches de la Clean Architecture",
      moduleBoundariesIntro:
        "Les modules sont des îles isolées. Ils ne peuvent pas s'importer mutuellement. Cela permet un développement indépendant, l'isolation des pannes et la capacité d'extraire des modules dans des référentiels séparés.",
      moduleBoundariesTitle: "Limites des Modules",
      title: "Vue d'ensemble de l'Architecture",
      withBoundaries: "Avec Limites de Modules",
      withoutBoundaries: "Sans Limites de Modules",
    },
    solidPattern: {
      antiPatternWarning:
        "Anti-modèle : Placer useState, useEffect ou useQuery directement dans un composant Vue. TOUT l'état et la logique doivent vivre dans les ViewModels. Les Vues ne servent qu'à la composition d'interface utilisateur.",
      description:
        "Scénarios de types de pages : Listes CRUD, tableaux de bord, profils, paramètres, assistants (wizards) et créateurs de rapports.",
      intro:
        "Le modèle SOLID View/ViewModel est obligatoire pour toutes les pages dans src/modules/. Ce guide couvre 7 scénarios de types de pages avec leurs structures de répertoires exactes, les modèles ViewModel et des exemples de code.",
      principlesTitle: "Principes SOLID Appliqués",
      rulesTitle: "Règles d'Or",
      scenario1Intro:
        "Utilisé pour la gestion des collections d'entités (Utilisateurs, Produits, Commandes). L'orchestrateur compose les ViewModels des statistiques, des filtres et du tableau.",
      scenario1Title: "Scénario 1 : Page de Liste CRUD",
      scenario2Intro:
        "Utilisé pour les KPI, les graphiques et les métriques. Chaque section de graphique ou de carte obtient son propre ViewModel avec sélection de période et transformation des données.",
      scenario2Title: "Scénario 2 : Tableau de bord / Analytique",
      scenario3Intro:
        "Utilisé pour afficher une seule entité avec des onglets et des sections. L'orchestrateur récupère l'entité principale et compose les ViewModels des onglets.",
      scenario3Title: "Scénario 3 : Page de Détail / Profil",
      scenario4Intro:
        "Utilisé pour de multiples sections de formulaires enregistrables indépendamment. Chaque section de paramètres obtient son propre ViewModel avec l'état du formulaire et la mutation d'enregistrement.",
      scenario4Title: "Scénario 4 : Page des Paramètres",
      scenario5Intro:
        "Utilisé pour les flux complexes à plusieurs étapes comme l'intégration (onboarding) ou le paiement. Le ViewModel du wizard coordonne la navigation, les validations et la soumission combinée.",
      scenario5Title: "Scénario 5 : Assistant (Wizard) / Formulaire Multi-étapes",
      scenariosIntro:
        "Choisissez le scénario qui correspond à votre type de page. Chacun fournit une structure éprouvée qui garantit la cohérence dans toute l'application.",
      scenariosTitle: "Scénarios de Types de Pages",
      title: "SOLID View/ViewModel",
    },
    stateManagement: {
      antiPatternsTitle: "Anti-Modèles",
      decisionTitle: "Matrice de Décision",
      description:
        "TanStack Query pour l'état du serveur, Zustand pour l'état global de l'UI et LanguageProvider pour la localisation.",
      dontTitle: " NE PAS FAIRE",
      doTitle: " À FAIRE",
      intro:
        "SCRIPE utilise trois outils de gestion d'état, chacun pour une catégorie spécifique : TanStack Query pour les données du serveur (résultats de l'API), Zustand pour l'état global de l'interface utilisateur (auth, barre latérale, thème) et useState pour l'état local des composants.",
      localizationIntro:
        "La localisation utilise un LanguageProvider personnalisé avec persistance dans le localStorage plus un système de localisation étendu au module. Les clés partagées (~1 156) résident dans core/locales/. Les clés spécifiques au module sont co-localisées dans le répertoire locales/ de chaque module et importées de manière anticipée au moment de la construction via module-registry.ts pour des chargements de page sans flash.",
      localizationTitle: "Localisation (LanguageProvider)",
      noLocaleFoldersWarning:
        "N'utilisez PAS de dossiers [locale] dans src/app/ ! La localisation est gérée via le contexte LanguageProvider, et non par le routage basé sur des fichiers. Pas de next-intl, pas de next-i18next, pas de langues basées sur l'URL (/en/, /fr/).",
      tanstackIntro:
        "Utilisez TanStack Query pour toutes les données provenant de l'API. Il gère automatiquement la mise en cache, l'actualisation en arrière-plan, la pagination, les mises à jour optimistes et la déduplication des requêtes.",
      tanstackTitle: "TanStack Query (État du Serveur)",
      title: "Gestion de l'État (State Management)",
      zustandIntro:
        "Utilisez Zustand pour l'état global de l'interface utilisateur qui doit être partagé entre les composants mais qui ne provient pas du serveur. Il y a exactement 3 stores approuvés.",
      zustandTitle: "Zustand (État Global de l'UI)",
    },
  },
};
