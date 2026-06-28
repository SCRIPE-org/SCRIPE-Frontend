// FILE-EXCEPTION: file length
/**
 * Docs page locale — FR
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const fr = {
  architecture: {
    overview: {
      title: "Vue d'ensemble de l'Architecture",
      description:
        "Couches Clean Architecture, pipeline backend, flux SOLID frontend et règles de limites de modules.",
      intro:
        "SCRIPE suit une Clean Architecture stricte avec quatre couches : Présentation, Application, Domaine et Infrastructure. La règle de dépendance garantit que les couches internes ne dépendent jamais des couches externes. Cette architecture s'applique au backend et au frontend.",
      layersTitle: "Couches de la Clean Architecture",
      backendArchTitle: "Architecture du Backend",
      backendArchIntro:
        "Le backend suit une architecture de pipeline de requêtes où chaque requête HTTP passe par des middlewares, des contrôleurs, des comportements (behaviors) SCRIPE mediator, pscripe le gestionnaire CQRS. Cela garantit une validation, un audit et une gestion des erreurs cohérents.",
      frontendArchTitle: "Architecture du Frontend",
      frontendArchIntro:
        "Le frontend utilise un modèle Vue/ViewModel SOLID où les Vues sont de la pure UI (sans état, sans logique) et les ViewModels contiennent toute la logique métier. Le modèle connecteur sépare le routage Next.js (Server Components) de la logique applicative (Client Components).",
      moduleBoundariesTitle: "Limites des Modules",
      moduleBoundariesIntro:
        "Les modules sont des îles isolées. Ils ne peuvent pas s'importer mutuellement. Cela permet un développement indépendant, l'isolation des pannes et la capacité d'extraire des modules dans des référentiels séparés.",
      withBoundaries: "Avec Limites de Modules",
      withoutBoundaries: "Sans Limites de Modules",
      communicationPatternsTitle: "Communication Inter-Modules",
      crossModuleNote:
        "Le modèle de Bus d'Événements (Event Bus) est prévu pour les futures versions. Actuellement, les modules communiquent exclusivement par navigation URL et ID partagés.",
    },
    backend: {
      title: "Architecture du Backend",
      description:
        "Anatomie de Program.cs, pipeline des middlewares, carte de l'injection de dépendances (DI), modèle d'enregistrement des modules et catalogue des contrôleurs.",
      intro:
        "Le backend de SCRIPE est un Monolithe Modulaire .NET 10 avec 288 lignes dans Program.cs qui relient 16 enregistrements de services, 10 composants middleware et 18 contrôleurs REST. Cette page décortique chaque couche de l'architecture du backend.",
      programCsTitle: "Anatomie de Program.cs",
      programCsIntro:
        "Program.cs est le point d'entrée de l'application et le centre de cblage. Il détecte le mode de déploiement, enregistre les services dans un ordre spécifique et construit le pipeline des middlewares. Le fichier suit une structure claire en 5 sections.",
      middlewarePipelineTitle: "Pipeline de Middlewares",
      middlewarePipelineIntro:
        "Le pipeline de middlewares traite chaque requête HTTP dans un ordre précis. Chaque middleware peut court-circuiter le pipeline (ex : le limiteur de débit renvoie 429, l'authentification renvoie 401). L'ordre compte : le modifier peut casser la sécurité.",
      diMapTitle: "Carte des Services DI",
      diMapIntro:
        "Le tableau suivant montre toutes les interfaces de services majeures, leurs implémentations, leurs cycles de vie (lifetimes) et où elles sont enregistrées. Comprendre cette carte est essentiel pour déboguer et étendre le système.",
      modulePatternTitle: "Modèle d'Enregistrement de Module",
      modulePatternIntro:
        "Chaque nouveau module suit le même modèle d'enregistrement DI. La méthode d'extension AddXxxModule() enregistre le DbContext du module, les dépôts (repositories), les services et le marqueur d'enregistrement du module.",
      controllersTitle: "Contrôleurs (Controllers)",
      controllerTip:
        "Tous les contrôleurs héritent d'un ApiController de base qui fournit un formatage de réponse standardisé Result<T>. Les contrôleurs doivent rester fins : ils ne font que valider le modèle de la requête et délèguent à SCRIPE mediator.",
    },
    frontend: {
      title: "Architecture du Frontend",
      description:
        "Modèle Vue/ViewModel SOLID, structure des modules et modèle connecteur pour l'intégration de Next.js.",
      intro:
        "Le frontend de SCRIPE est construit avec Next.js 16 (App Router) en suivant un modèle strict Vue/ViewModel SOLID. Chaque page est composée d'une Vue (UI pure) qui délègue toute la logique aux hooks du ViewModel. Cette séparation garantit la testabilité, la réutilisation et la maintenabilité.",
      solidPatternTitle: "Modèle Vue/ViewModel SOLID",
      solidPatternIntro:
        "Le modèle SOLID garantit que chaque composant de l'interface utilisateur a une responsabilité unique. Les Vues rendent le JSX, les ViewModels gèrent l'état et la logique, et les Composants fournissent des sections d'interface utilisateur réutilisables.",
      viewRulesTitle: "Règles de la Vue",
      viewDo: "Une Vue DOIT",
      viewDont: "Une Vue NE DOIT PAS",
      viewExampleTitle: "Exemple de Vue",
      viewModelRulesTitle: "Règles du ViewModel",
      viewModelRulesIntro:
        "Les ViewModels sont des hooks React qui contiennent toute la logique métier. Ils composent des ViewModels spécifiques aux sections (statistiques, filtres, tableaux) et renvoient des interfaces typées consommées par les Vues.",
      moduleStructureTitle: "Structure de Fichiers du Module",
      connectorPatternTitle: "Modèle Connecteur",
      connectorPatternIntro:
        "Le modèle connecteur sépare les pages du routeur d'application Next.js (Server Components) des Vues du module (Client Components). Les pages dans src/app/ sont de simples connecteurs qui importent et affichent les Vues du module. Elles ne gèrent que le routage, les métadonnées et les paramètres d'URL.",
      connectorWarning:
        "Ne placez JAMAIS de logique métier, de requêtes de données, de formulaires ou de gestion d'état dans les fichiers src/app/. Ce sont des Server Components qui connectent uniquement les routes aux Vues du module.",
    },
    cqrs: {
      title: "Modèle CQRS",
      description:
        "Séparation des Responsabilités de Commande et de Requête avec pipeline SCRIPE mediator, comportements, validation et mise en cache.",
      intro:
        "SCRIPE utilise le modèle CQRS (Command Query Responsibility Segregation) pour séparer les opérations de lecture et d'écriture. Les commandes mutent l'état et passent par des comportements de validation et d'audit. Les requêtes (Queries) lisent l'état et peuvent tirer parti de la mise en cache. SCRIPE mediator agit comme médiateur entre les contrôleurs et les gestionnaires.",
      whatIsCqrsTitle: "Qu'est-ce que CQRS ?",
      whatIsCqrsIntro:
        "CQRS sépare votre application en deux côtés : Commandes (écritures) et Requêtes (lectures). Chaque côté peut être optimisé indépendamment : les commandes se concentrent sur l'intégrité des données et la validation, tandis que les requêtes se concentrent sur les performances et la mise en cache.",
      commandSide: "Côté Commande (Écriture)",
      querySide: "Côté Requête (Lecture)",
      pipelineTitle: "Pipeline SCRIPE mediator",
      validationBehaviorTitle: "Comportement de Validation",
      commandExampleTitle: "Exemple de Commande",
      queryExampleTitle: "Exemple de Requête",
      cachingTip:
        "Les requêtes peuvent utiliser la mise en cache côté serveur pour éviter d'interroger la base de données à chaque demande. La clé de cache doit inclure tous les paramètres de requête pour garantir son unicité. Le cache est automatiquement invalidé lorsque les commandes associées réussissent.",
    },
    modules: {
      title: "Système de Modules",
      description:
        "Règles d'isolation des modules, modèles backend/frontend, registre de modules et communication inter-modules.",
      intro:
        "SCRIPE utilise un système de modules strict où chaque module est une île isolée avec des limites claires. Les modules ne peuvent pas s'importer mutuellement : ils communiquent uniquement via des URL, des ID partagés ou le bus d'événements principal. Cela garantit l'indépendance, la testabilité et la capacité d'extraire les modules.",
      isolationRulesTitle: "Règles d'Isolation des Modules",
      allowedImportsTitle: "Importations Autorisées",
      forbiddenImportsTitle: "Importations Interdites",
      backendModuleTitle: "Modèle de Module Backend",
      backendModuleIntro:
        "Chaque module backend suit la conception pilotée par le domaine (DDD) avec trois projets : Domaine, Application et Infrastructure. Le Domaine est du C# pur sans dépendances externes.",
      frontendModuleTitle: "Modèle de Module Frontend",
      registryTitle: "Registre des Modules",
      registryIntro:
        "Le registre des modules suit tous les modules actifs au moment de l'exécution. Il est rempli lors du démarrage de l'application lorsque l'implémentation IModuleRegistration de chaque module est résolue et enregistrée.",
      communicationTitle: "Modèles de Communication Inter-Modules",
      pattern1Title: "Modèle 1 : Navigation URL",
      pattern1Content:
        "Accédez à la page d'un autre module via des liens URL standards. Aucune importation nécessaire.",
      pattern2Title: "Modèle 2 : ID partagés uniquement",
      pattern2Content:
        "Stockez uniquement l'ID d'entité du module étranger. N'intégrez jamais l'entité complète.",
      pattern3Title: "Modèle 3 : Core Event Bus",
      pattern3Content:
        "Publiez et abonnez-vous à des événements via un bus partagé dans @core/. (Modèle futur, pas encore implémenté).",
      boundaryWarning:
        "Les limites des modules sont une loi absolue. Si vous devez partager du code entre les modules, il DOIT aller dans @core/. Toute importation depscripe @modules/{autre}/ est une violation et sera détectée lors de la revue de code.",
    },
    solidPattern: {
      title: "SOLID View/ViewModel",
      description:
        "Scénarios de types de pages : Listes CRUD, tableaux de bord, profils, paramètres, assistants (wizards) et créateurs de rapports.",
      intro:
        "Le modèle SOLID View/ViewModel est obligatoire pour toutes les pages dans src/modules/. Ce guide couvre 7 scénarios de types de pages avec leurs structures de répertoires exactes, les modèles ViewModel et des exemples de code.",
      principlesTitle: "Principes SOLID Appliqués",
      scenariosTitle: "Scénarios de Types de Pages",
      scenariosIntro:
        "Choisissez le scénario qui correspond à votre type de page. Chacun fournit une structure éprouvée qui garantit la cohérence dans toute l'application.",
      scenario1Title: "Scénario 1 : Page de Liste CRUD",
      scenario1Intro:
        "Utilisé pour la gestion des collections d'entités (Utilisateurs, Produits, Commandes). L'orchestrateur compose les ViewModels des statistiques, des filtres et du tableau.",
      scenario2Title: "Scénario 2 : Tableau de bord / Analytique",
      scenario2Intro:
        "Utilisé pour les KPI, les graphiques et les métriques. Chaque section de graphique ou de carte obtient son propre ViewModel avec sélection de période et transformation des données.",
      scenario3Title: "Scénario 3 : Page de Détail / Profil",
      scenario3Intro:
        "Utilisé pour afficher une seule entité avec des onglets et des sections. L'orchestrateur récupère l'entité principale et compose les ViewModels des onglets.",
      scenario4Title: "Scénario 4 : Page des Paramètres",
      scenario4Intro:
        "Utilisé pour de multiples sections de formulaires enregistrables indépendamment. Chaque section de paramètres obtient son propre ViewModel avec l'état du formulaire et la mutation d'enregistrement.",
      scenario5Title: "Scénario 5 : Assistant (Wizard) / Formulaire Multi-étapes",
      scenario5Intro:
        "Utilisé pour les flux complexes à plusieurs étapes comme l'intégration (onboarding) ou le paiement. Le ViewModel du wizard coordonne la navigation, les validations et la soumission combinée.",
      rulesTitle: "Règles d'Or",
      antiPatternWarning:
        "Anti-modèle : Placer useState, useEffect ou useQuery directement dans un composant Vue. TOUT l'état et la logique doivent vivre dans les ViewModels. Les Vues ne servent qu'à la composition d'interface utilisateur.",
    },
    stateManagement: {
      title: "Gestion de l'État (State Management)",
      description:
        "TanStack Query pour l'état du serveur, Zustand pour l'état global de l'UI et LanguageProvider pour la localisation.",
      intro:
        "SCRIPE utilise trois outils de gestion d'état, chacun pour une catégorie spécifique : TanStack Query pour les données du serveur (résultats de l'API), Zustand pour l'état global de l'interface utilisateur (auth, barre latérale, thème) et useState pour l'état local des composants.",
      decisionTitle: "Matrice de Décision",
      tanstackTitle: "TanStack Query (État du Serveur)",
      tanstackIntro:
        "Utilisez TanStack Query pour toutes les données provenant de l'API. Il gère automatiquement la mise en cache, l'actualisation en arrière-plan, la pagination, les mises à jour optimistes et la déduplication des requêtes.",
      zustandTitle: "Zustand (État Global de l'UI)",
      zustandIntro:
        "Utilisez Zustand pour l'état global de l'interface utilisateur qui doit être partagé entre les composants mais qui ne provient pas du serveur. Il y a exactement 3 stores approuvés.",
      antiPatternsTitle: "Anti-Modèles",
      doTitle: " À FAIRE",
      dontTitle: " NE PAS FAIRE",
      localizationTitle: "Localisation (LanguageProvider)",
      localizationIntro:
        "La localisation utilise un LanguageProvider personnalisé avec persistance dans le localStorage. Il prend en charge 7 langues, la détection automatique RTL/LTR et les clés de traduction à notation pointée avec interpolation.",
      noLocaleFoldersWarning:
        "N'utilisez PAS de dossiers [locale] dans src/app/ ! La localisation est gérée via le contexte LanguageProvider, et non par le routage basé sur des fichiers. Pas de next-intl, pas de next-i18next, pas de langues basées sur l'URL (/en/, /fr/).",
    },
    dataFlow: {
      title: "Flux de Données",
      description:
        "Diagrammes de flux de données de bout en bout : requête, mutation, pipeline backend, gestion des erreurs et stratégie de cache.",
      intro:
        "Comprendre comment les données circulent dans SCRIPE est essentiel pour déboguer et étendre le système. Cette page trace les données depscripe un clic dans l'interface utilisateur jusqu'à la base de données et retour.",
      queryFlowTitle: "Flux de Requête (Lecture)",
      queryFlowIntro:
        "Lorsqu'un utilisateur consulte des données, le flux commence à la Vue, traverse le ViewModel, TanStack Query, le Référentiel (Repository), le Service API et enfin l'API backend.",
      mutationFlowTitle: "Flux de Mutation (Écriture)",
      backendPipelineTitle: "Pipeline de Requêtes Backend",
      backendPipelineIntro:
        "Chaque requête backend passe par les middlewares pscripe les comportements du médiateur SCRIPE avant d'atteindre le gestionnaire. Cela garantit une journalisation, une authentification, une autorisation, une validation, un contrôle de fonctionnalités et une diffusion Webhook cohérents.",
      errorFlowTitle: "Gestion des Erreurs",
      errorFlowIntro:
        "Les erreurs sont gérées à plusieurs niveaux. Chaque source d'erreur possède un gestionnaire spécifique, un code de réponse et une stratégie de gestion front-end.",
      cachingFlowTitle: "Stratégie de Mise en Cache",
      cachingFlowIntro:
        "Le backend utilise une stratégie de cache à deux niveaux : L1 (IMemoryCache en cours de processus) et L2 (Redis distribué). Le frontend utilise le cache intégré de TanStack Query avec un staleTime configurable.",
      cacheTip:
        "Définissez staleTime à 5 minutes pour les données qui changent rarement (rôles, permissions). Utilisez 0 pour les données qui changent souvent. Invalidez toujours les requêtes liées après des mutations réussies.",
    },
    domainModel: {
      title: "Modèle de Domaine (Domain Model)",
      description:
        "Hiérarchie d'héritage des entités, AuditableEntity, ITenantAwareEntity, cycle de vie de la suppression logique (soft-delete) et filtres de requêtes globaux.",
      intro:
        "Le modèle de domaine de SCRIPE suit une hiérarchie d'héritage stricte où toutes les entités métier héritent de AuditableEntity. Les entités liées à un locataire implémentent en plus ITenantAwareEntity pour une isolation automatique des données.",
      entityHierarchyTitle: "Hiérarchie d'Héritage des Entités",
      entityHierarchyIntro:
        "Toutes les entités du domaine suivent une chaîne d'héritage à trois niveaux : IEntity -> Entity<TId> -> AuditableEntity. Les entités d'un locataire spécifique implémentent également l'interface ITenantAwareEntity.",
      ientityTitle: "Interface IEntity",
      entityBaseTitle: "Classe de base Entity<TId>",
      entityBaseIntro:
        "Fournit l'égalité d'identité, la génération de code de hachage et le support des événements de domaine.",
      entityDomainEventNote:
        "Les événements de domaine levés via RaiseDomainEvent() sont collectés par l'OutboxInterceptor lors du SaveChanges et stockés dans la même transaction.",
      auditableEntityTitle: "AuditableEntity",
      auditableEntityIntro:
        "Ajoute 7 champs d'audit et de suppression logique à l'entité de base. Ces champs sont automatiquement remplis par l'AuditableEntityInterceptor.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantAwareIntro:
        "Les entités qui implémentent ITenantAwareEntity sont automatiquement restreintes au locataire (tenant) actuel via les filtres de requête globaux d'EF Core.",
      tenantIsolationWarning:
        "Ne contournez jamais l'isolation du locataire sans autorisation explicite. L'utilisation d'IgnoreQueryFilters() supprime TOUS les filtres, y compris l'étendue du locataire.",
      softDeleteTitle: "Cycle de vie de la Suppression Logique (Soft-Delete)",
      softDeleteIntro:
        "Toutes les entités utilisent la suppression logique via l'indicateur IsDeleted. Un endpoint DELETE convertit la demande en suppression logique sans détruire physiquement l'enregistrement.",
      repositoryTitle: "Abstractions de Référentiels (Repositories)",
      repositoryIntro:
        "SCRIPE définit trois interfaces : IReadRepository<T> pour les lectures, IWriteRepository<T> pour les écritures, et IRepository<T> qui combine les deux.",
      concreteEntitiesTitle: "Registre des Entités Concrètes",
      queryFiltersTitle: "Filtres de Requêtes Globaux",
      queryFiltersIntro:
        "Les filtres EF Core s'appliquent automatiquement à chaque requête LINQ pour les entités héritant de AuditableEntity ou ITenantAwareEntity.",
      ignoreFiltersTip:
        "Utilisez IgnoreQueryFilters() uniquement dans la corbeille (Recycle Bin) ou les opérations SuperAdmin inter-locataires, en ajoutant toujours un filtre explicite.",
      bestPracticesTitle: "Meilleures Pratiques",
      doTitle: "✅ À FAIRE",
      dontTitle: "❌ NE PAS FAIRE",
    },
    domainEvents: {
      title: "Événements de Domaine (Domain Events)",
      description:
        "Interface IDomainEvent, modèle Outbox, OutboxInterceptor, OutboxProcessor et livraison fiable des événements.",
      intro:
        "Les événements de domaine représentent des occurrences significatives dans le domaine métier. SCRIPE utilise le modèle Outbox pour garantir une livraison fiable des événements.",
      interfaceTitle: "Interface IDomainEvent",
      interfaceIntro:
        "Tous les événements de domaine implémentent l'interface IDomainEvent, qui hérite de INotification de SCRIPE mediator. Cela permet le modèle Pub/Sub en cours de processus.",
      publishingTitle: "Flux de Publication et Traitement",
      publishingIntro:
        "Les événements suivent un cycle de 6 étapes : déclenchement, capture par l'OutboxInterceptor, persistance dans la même transaction, sondage par l'OutboxProcessor, pscripe publication via SCRIPE mediator.",
      publisherTitle: "IDomainEventPublisher",
      outboxTitle: "Modèle Outbox (Outbox Pattern)",
      outboxIntro:
        "Le modèle Outbox résout le problème de la double écriture : comment mettre à jour atomiquement la base de données ET publier un événement de manière fiable.",
      outboxWarning:
        "Le modèle Outbox fournit une livraison 'au moins une fois' (at-least-once). Les gestionnaires d'événements doivent donc être idempotents.",
      outboxMessageTitle: "Entité OutboxMessage",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxInterceptorIntro:
        "Un intercepteur EF Core qui collecte tous les événements de domaine et les sérialise avant de valider la transaction de la base de données.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxProcessorIntro:
        "Un service d'arrière-plan (BackgroundService) qui interroge la table OutboxMessage toutes les 5 secondes pour traiter les messages.",
      outboxCleanupTitle: "Tche de Nettoyage de l'Outbox",
      outboxCleanupIntro:
        "Une tche récurrente Hangfire s'exécute quotidiennement pour purger les messages Outbox traités datant de plus de 7 jours.",
      architectureSummaryTitle: "Résumé de l'Architecture Outbox",
      customEventsTitle: "Création d'Événements de Domaine Personnalisés",
      customEventsIntro: "Suivez ces 3 étapes pour ajouter un nouvel événement de domaine.",
      step1Title: "1. Définir l'événement",
      step1Content: "Créez un record implémentant IDomainEvent dans Domain/Events/.",
      step2Title: "2. Déclencher depscripe le Handler",
      step2Content: "Appelez entity.RaiseDomainEvent(), pscripe SaveChangesAsync.",
      step3Title: "3. Créer des Gestionnaires",
      step3Content: "Implémentez INotificationHandler<DomainEventNotification>.",
      reliabilityTitle: "Garanties de Fiabilité",
      withOutboxTitle: "✅ Avec le Modèle Outbox",
      withoutOutboxTitle: "❌ Sans le Modèle Outbox",
    },
    cqrsPipeline: {
      title: "Pipeline CQRS",
      description:
        "Comportements de la pipeline du médiateur SCRIPE : LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, modèle Result et catalogue complet commandes/requêtes.",
      intro:
        "Chaque commande et requête dans SCRIPE passe par une pipeline configurable du médiateur SCRIPE avec 5 comportements intégrés : LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior et CachingBehavior. L'ordre est géré depscripe appsettings ou les variables d'environnement et validé au démarrage.",
      overviewTitle: "Vue d'ensemble du Pipeline",
      overviewIntro:
        "L'ordre par défaut est Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. La validation et les contrôles de fonctionnalités précèdent volontairement la lecture du cache, tandis que l'invalidation du cache s'exécute avant l'envoi des webhooks après les mutations réussies.",
      separationTitle: "Séparation Commande vs Requête",
      separationIntro:
        "CQRS sépare l'application : les commandes (écritures) mutent l'état et valident, les requêtes (lectures) sont optimisées et mises en cache.",
      commandsTitle: "Commandes (Écriture)",
      queriesTitle: "Requêtes (Lecture)",
      resultPatternTitle: "Modèle de Résultat (Result Pattern)",
      resultPatternIntro:
        "Tous les gestionnaires renvoient un Result<T> au lieu de lever des exceptions pour les échecs attendus, éliminant les blocs try-catch dans les contrôleurs.",
      validationTitle: "ValidationBehavior",
      validationIntro:
        "ValidationBehavior s'exécute juste après le logging. Il collecte tous les validateurs IValidator<TRequest>, renvoie des échecs Result structurés pour les requêtes invalides et les empêche d'atteindre les handlers ou le cache.",
      validatorExampleTitle: "Exemples de Validateurs",
      loggingTitle: "LoggingBehavior",
      loggingIntro:
        "Journalise chaque requête SCRIPE mediator avec l'ID utilisateur, l'ID locataire et le temps d'exécution.",
      cachingTitle: "CachingBehavior",
      cachingIntro:
        "Le CachingBehavior intercepte les requêtes implémentant l'interface ICacheable, effectuant des recherches de cache délimitées par le locataire. Pour éviter le cache stampede concurrent sous charge élevée, il s'appuie sur des verrous SemaphoreSlim spécifiques aux clés pour sérialiser les lectures de base de données en cas d'échec. Il gère également l'invalidation des mutations via IInvalidatesCache, en nettoyant des clés précises ou des espaces de noms basés sur des préfixes. De plus, il intègre l'expulsion de clés pour limiter la croissance et lie les configurations de fonctionnalités à une source de jetons d'expulsion globale pour une invalidation instantanée et thread-safe.",
      cachingStampedeTitle: "Concurrence du Cache et Prévention du Cache Stampede",
      cachingStampedeIntro:
        "Pour éviter la dégradation des performances sous charge élevée, le système de cache implémente une atténuation du Cache Stampede. Des sémaphores spécifiques aux clés garantissent que si plusieurs requêtes concurrentes demandent une clé manquante ou expirée, seul le premier thread exécute la requête de base de données/API, tandis que les requêtes suivantes attendent le sémaphore et récupèrent la valeur fraîchement mise en cache. De plus, la croissance illimitée est évitée en suivant les clés de cache et en expulsant aléatoirement 50 % d'entre elles en cas de dépassement de 10 000 clés suivies. Les entrées de cache de fonctionnalités sont également liées à un jeton d'expulsion global pour un nettoyage instantané.",
      outboxTitle: "Événements de Domaine et Pipeline de l'Outbox",
      outboxIntro:
        "Pour garantir la cohérence transactionnelle et éviter le problème de double écriture, SCRIPE utilise le modèle Outbox. Les événements de domaine sont déclenchés dans les racines d'agrégation (Aggregate Roots), interceptés par le SaveChangesInterceptor d'EF Core, sérialisés en JSON et persistés sous forme d'entités OutboxMessage dans la même transaction de base de données. Une tâche en arrière-plan (OutboxProcessorJob) s'exécute chaque minute pour interroger les messages non traités et les publier localement (via le médiateur AstraFlow) ou en externe (via l'EventBus). Enfin, une tâche OutboxCleanupJob quotidienne s'exécute à 5h00 pour purger les messages traités datant de plus de 7 jours.",
      flowStampedeTitle: "Séquence de Verrouillage du Cache Stampede",
      flowStampedeRequest: "Requête Client\nGetOrCreateAsync(key)",
      flowStampedeMiss: "Cache Miss ?\nVérification InMemory/Redis",
      flowStampedeLock: "Acquérir le Verrou\nSemaphoreSlim(1,1)",
      flowStampedeCheck: "Double Vérification Cache\nValider à l'intérieur du verrou",
      flowStampedeFound: "Cache Hit\nValeur renseignée par un autre thread",
      flowStampedeFactory: "Exécuter l'Usine\nRequête BD / API",
      flowStampedeWrite: "Écrire dans le Cache\nAjouter PostEvictionCallback",
      flowStampedeRelease: "Libérer le Verrou\nRetourner la valeur à tous les threads",
      flowOutboxTitle: "Pipeline de Traitement des Messages Outbox",
      flowOutboxRaise: "Déclencher l'Événement\nAggregateRoot.AddDomainEvent()",
      flowOutboxIntercept: "Intercepter SaveChanges\nOutboxInterceptor scanne le ChangeTracker",
      flowOutboxSerialize:
        "Sérialiser l'Événement\nConvertir en JSON & envelopper dans OutboxMessage",
      flowOutboxCommit: "Transaction BD Atomique\nSauvegarde entités + OutboxMessage",
      flowOutboxPoll: "OutboxProcessorJob\nInterroger les non traités chaque minute",
      flowOutboxDispatch: "Publier l'Événement\nMédiateur Local + EventBus Externe",
      flowOutboxComplete: "Marquer Traité\nDéfinir ProcessedOnUtc = UtcNow",
      flowOutboxCleanup: "OutboxCleanupJob\nPurger les messages traités > 7 jours",
      connCacheQuery: "demande la clé",
      connCacheMiss: "cache miss",
      connAcquireLock: "acquires le verrou",
      connDoubleCheck: "cache hit",
      connCacheHit: "retourne la valeur",
      connDbQuery: "exécute la requête",
      connCacheWrite: "met à jour le cache",
      connLockRelease: "libère le verrou",
      connRaise: "déclenche l'intercepteur",
      connIntercept: "scanne les événements",
      connSerialize: "sérialise",
      connCommit: "valide atomiquement",
      connPoll: "interroge un lot de 50",
      connDispatch: "distribue l'événement",
      connComplete: "sauvegarde le statut",
      connCleanup: "purge quotidienne",
      commandMapTitle: "Catalogue des Commandes et Requêtes",
      commandMapIntro:
        "Le tableau suivant répertorie chaque commande, requête et validateur enregistré dans le système.",
      registrationTitle: "Enregistrement du Pipeline",
      registrationIntro:
        "AddCoreApplication() enregistre les comportements de pipeline depscripe les options Mediator. Le scan des handlers, la validation de couverture, la politique d'échec des notifications et l'ordre de pipeline sont contrôlés par configuration.",
      behaviorOrderTip:
        "La validation de sécurité par défaut rejette les ordres où Caching s'exécute avant Validation ou FeatureCheck. Ne désactivez WebhookDispatchBehavior que si vous maîtrisez entièrement le risque.",
      featureCheckTitle: "FeatureCheckBehavior",
      featureCheckIntro:
        "Le FeatureCheckBehavior intercepte les commandes implémentant IRequireFeature. Il vérifie si l'édition du locataire autorise la fonctionnalité demandée en appelant IFeatureChecker.IsEnabledAsync. Si la fonctionnalité est désactivée, il renvoie une erreur Forbidden sans exécuter le gestionnaire. Les opérations au niveau système (sans TenantId) contournent cette vérification.",
      featureCheckMarkerTitle: "Marqueur IRequireFeature",
      featureCheckMarkerIntro:
        "Les commandes optent pour le contrôle des fonctionnalités en implémentant l'interface IRequireFeature avec une propriété RequiredFeatureName. Lorsque le module Entitlements n'est pas déployé, NoOpFeatureChecker renvoie true pour toutes les vérifications, rendant ce comportement transparent.",
    },
    dependencyInjection: {
      title: "Injection de Dépendances (DI)",
      description:
        "Flux d'enregistrement Program.cs, modèle DI des modules, découverte de services, règles de durée de vie et passerelle YARP.",
      intro:
        "SCRIPE utilise le conteneur DI natif de .NET avec un modèle d'enregistrement structuré ordonné.",
      architectureTitle: "Architecture d'Enregistrement DI",
      architectureIntro:
        "Program.cs suit un ordre en 4 phases : (1) Infrastructure, (2) CORS, (3) Modules, (4) Couche Application (SCRIPE mediator).",
      moduleRegTitle: "Modèle d'Enregistrement de Module",
      moduleRegIntro:
        "Chaque module expose une méthode d'extension AddXxxModule() qui enregistre ses propres services en fonction de la variable MODULE_NAME.",
      monolithNote:
        "En mode monolithe, TOUS les modules sont chargés ensemble. En mode microservice, chaque processus charge uniquement le sien.",
      controllerProviderTitle: "Module Controller Feature Provider",
      controllerProviderIntro:
        "Filtre quels contrôleurs API sont chargés au démarrage selon le contexte du microservice.",
      serviceDiscoveryTitle: "Découverte de Services (Service Discovery)",
      serviceDiscoveryIntro:
        "SCRIPE utilise une découverte basée sur la configuration pour résoudre les noms de services en URL.",
      coreServicesTitle: "Services d'Infrastructure de Base",
      coreServicesIntro:
        "Enregistrés par AddCoreInfrastructure() et mis à la disposition de tous les modules.",
      identityModuleTitle: "Services du Module d'Identité",
      identityModuleIntro:
        "Le module Identité enregistre des dizaines de référentiels sous une durée de vie Scoped.",
      lifetimeTitle: "Règles de Durée de Vie (Lifetimes)",
      singletonTitle: "Durée de Vie Singleton",
      scopedTitle: "Durée de Vie Scoped (Par Requête HTTP)",
      gatewayTitle: "Configuration de la Passerelle YARP",
      gatewayIntro:
        "En mode Gateway, l'application agit comme un proxy inverse YARP routant vers les microservices.",
      bestPracticesTitle: "Meilleures Pratiques DI",
      captiveTip:
        "Évitez les dépendances captives (quand un service Singleton injecte un service Scoped). Utilisez IServiceScopeFactory à la place.",
    },
    moduleCollab: {
      title: "Collaboration Inter-Modules en Profondeur",
      description: "Analyse détaillée de la communication inter-modules dans le monolithe SCRIPE.",
      intro:
        "Les modules Identity et Entitlements ne peuvent pas s'importer mutuellement (dépendance circulaire). Ils collaborent via la couche Core — abstractions partagées, événements de domaine et pipeline Mediator.",
      coreBridgeTitle: "Le Pont de la Couche Core",
      coreBridgeIntro:
        "Toute collaboration inter-modules passe par Core.Application.Abstractions. Chaque module implémente les interfaces définies dans Core et consomme celles des autres modules via l'injection de dépendances.",
      catalogTitle: "Catalogue Complet des Interfaces",
      catalogIntro:
        "Ces interfaces sont le contrat complet entre modules. Toutes sont définies dans Core.Application.Abstractions, implémentées par les modules Infrastructure, et enregistrées par défaut avec des NoOp dans Core.Infrastructure.",
      noopTitle: "Le Modèle de Sécurité NoOp",
      noopIntro:
        "Chaque interface inter-modules a une implémentation NoOp dans Core.Infrastructure. Quand un module est absent, le NoOp garantit que le système continue de fonctionner en mode dégradé gracieux plutôt qu'en erreur.",
      noopWarning:
        "Les NoOp sont des filets de sécurité, pas des valeurs par défaut permanentes. En production avec tous les modules chargés, aucun NoOp ne doit être actif. Les diagnostics au démarrage détectent les NoOp actifs et journalisent une alerte critique.",
      noopRegistrationTitle: "Enregistrement NoOp — TryAddScoped vs AddScoped",
      noopRegistrationIntro:
        "Le mécanisme de remplacement NoOp repose sur une règle critique : Core.Infrastructure enregistre les NoOp avec TryAddScoped. Les vrais modules s'enregistrent avec AddScoped. Comme TryAddScoped n'enregistre que si aucun service n'existe déjà, appeler AddScoped ensuite le remplace inconditionnellement.",
      startupDiagnosticsTitle: "Diagnostics au Démarrage — Détection des NoOp",
      startupDiagnosticsIntro:
        "PostBuildInitialization.cs s'exécute après la construction du conteneur DI. Il vérifie le type résolu pour les interfaces critiques. Si le type résolu est encore un NoOp, il journalise un message LogCritical.",
      featureCheckTitle: "FeatureCheckBehavior — Analyse Approfondie",
      featureCheckIntro:
        "FeatureCheckBehavior est un comportement de pipeline AstraFlow qui intercepte toutes les commandes implémentant IRequireFeature. Il vérifie si la fonctionnalité reqscripee est activée pour le tenant avant d'atteindre le gestionnaire.",
      requireFeatureInterfaceTitle: "IRequireFeature — L'Interface Marqueur Opt-In",
      requireFeatureInterfaceIntro:
        "IRequireFeature est une interface marqueur sans surcharge. Les commandes qui l'implémentent optent pour le contrôle de fonctionnalité par édition via FeatureCheckBehavior. Les commandes qui ne l'implémentent pas passent sans surcharge.",
      subscriptionEventTitle: "SubscriptionChangedEvent",
      subscriptionEventIntro:
        "SubscriptionChangedEvent est l'événement de domaine le plus critique du système. Il est publié par Entitlements chaque fois que l'abonnement d'un tenant change, et déclenche la synchronisation des permissions dans Identity.",
      eventTriggersTitle: "Toutes les Commandes qui Publient SubscriptionChangedEvent",
      eventTriggersIntro:
        "SubscriptionChangedEvent est publié par toute commande ou service Entitlements qui modifie l'état d'abonnement d'un tenant.",
      permSyncTitle: "Cycle de Vie de la Synchronisation des Permissions",
      permSyncIntro:
        "Lorsqu'un SubscriptionChangedEvent est traité par Identity, une synchronisation complète des permissions est effectuée pour le tenant concerné.",
      permSyncStep1Title: "Étape 1 : Résolution de la Carte des Fonctionnalités",
      permSyncStep1Content:
        "Le gestionnaire Entitlements résout la carte complète des fonctionnalités effectives : fonctionnalités d'édition fusionnées avec les remplacements de tenant et les expansions de bundle.",
      permSyncStep2Title: "Étape 2 : Publication de l'Événement de Domaine",
      permSyncStep2Content:
        "SubscriptionChangedEvent est publié comme événement de domaine, capturé par OutboxInterceptor, persisté dans la table OutboxMessages, pscripe distribué après SaveChangesAsync.",
      permSyncStep3Title: "Étape 3 : Gestionnaire d'Événement Identity",
      permSyncStep3Content:
        "SubscriptionChangedEventHandler d'Identity reçoit l'événement et délègue à ITenantPermissionManager pour synchroniser les permissions.",
      permSyncStep4Title: "Étape 4 : Diff et Application des Permissions",
      permSyncStep4Content:
        "TenantPermissionManager lit les IDs de permission par module, diff avec les permissions actuelles du tenant, et ajoute/supprime selon les besoins.",
      permSyncStep5Title: "Étape 5 : Invalidation du Cache",
      permSyncStep5Content:
        "Après la synchronisation, tous les caches de permissions d'admin pour ce tenant sont invalidés. La prochaine requête recharge les permissions depscripe la base de données.",
      loginEnrichTitle: "Enrichissement de la Réponse de Connexion",
      loginEnrichIntro:
        "LoginCommandHandler d'Identity enrichit la réponse JWT avec le statut d'abonnement sans importer Entitlements directement.",
      loginEnrichNote:
        "Si Entitlements n'est pas chargé, ISubscriptionStatusProvider est le NoOp qui retourne null. Le token JWT est toujours émis, mais sans données d'abonnement.",
      deployTopologyTitle: "Impact de la Topologie de Déploiement",
      deployTopologyIntro:
        "Le modèle de collaboration inter-modules fonctionne différemment selon que vous déployez en mode monolithe ou microservice.",
      monolithMode: "Mode Monolithe",
      microserviceMode: "Mode Microservice",
      moduleNameEnvTitle: "Référence de la Variable MODULE_NAME",
      moduleNameEnvIntro:
        "La variable d'environnement MODULE_NAME est définie au démarrage du conteneur et détermine quels modules sont chargés dans le processus.",
      microserviceCaution:
        "Ne déployez JAMAIS Identity et Entitlements dans des processus séparés sans d'abord implémenter un bus de messages pour les événements de domaine. Sans cela, SubscriptionChangedEvent sera silencieusement perdu et les permissions des tenants ne se synchroniseront jamais.",
      coDependencyTitle: "Carte des Co-dépendances de Modules",
      coDependencyIntro:
        "Ce tableau documente chaque dépendance inter-modules dans le système, quelle interface est utilisée et dans quelle direction.",
      signupSagaTitle: "La Saga d'Inscription en Libre-Service",
      signupSagaIntro:
        "L'inscription en libre-service est l'exemple le plus complexe de collaboration inter-modules.",
      signupMonolithOnly:
        "L'inscription en libre-service n'est prise en charge QUE en mode monolithe. En mode microservice, la garde G15 dans PostBuildInitialization.cs bloque le démarrage si la configuration d'inscription est activée.",
      signupStep1Title: "Phase 1 : Provisionnement du Tenant (Identity)",
      signupStep1Content:
        "RegisterTenantSelfServiceCommand crée le tenant, l'admin, les rôles et publie SignupPhase1CompletedEvent dans une transaction atomique.",
      signupStep2Title: "Phase 2 : Liaison de l'Abonnement (Entitlements)",
      signupStep2Content:
        "SignupPhase1CompletedEventHandler crée l'abonnement. Pour les éditions gratuites, activation immédiate. Pour les payantes, création d'une session Stripe.",
      signupStep3Title: "Phase 3 : Confirmation du Paiement (Stripe)",
      signupStep3Content:
        "Le webhook Stripe traite la confirmation de paiement et active l'abonnement, publiant SubscriptionChangedEvent.",
      signupStep4Title: "Phase 4 : Compensation (si abandon)",
      signupStep4Content:
        "Si le checkout Stripe est abandonné, CompensatePhase1Async supprime le tenant et l'admin pour éviter les comptes orphelins.",
      signupEventChainTitle: "Chaîne d'Événements d'Inscription",
      signupEventChainIntro:
        "La saga d'inscription traverse les limites de modules via trois événements de domaine in-process.",
      bundleExpansionTitle: "Expansion de Bundle — Octrois de Permissions Fins",
      bundleExpansionIntro:
        "L'expansion de bundle permet à une édition d'octroyer ou de refuser des codes de permission spécifiques au-delà de l'activation au niveau module.",
      bundleExpansionNote:
        "Les expansions de bundle sont traitées APRÈS la synchronisation principale des permissions de module.",
      adminPermCacheTitle: "IAdminPermissionCache — Le Cache d'Autorisation",
      adminPermCacheIntro:
        "IAdminPermissionCache est le cache Redis côté serveur utilisé par AuthorizationBehavior pour vérifier les permissions sans accès à la base de données à chaque requête.",
      currentUserTitle: "ICurrentUser — L'Interface Transversale Universelle",
      currentUserIntro:
        "ICurrentUser est l'interface utilisée par tous les modules directement. Elle est peuplée par le middleware JWT d'Identity à chaque requête authentifiée.",
      currentUserNote:
        "ICurrentUser est différent des autres interfaces inter-modules. Il n'a pas besoin de fallback NoOp — il est toujours implémenté par le middleware JWT de Core.Infrastructure.",
      featureResolutionTitle: "Chaîne de Résolution de Valeur de Fonctionnalité",
      featureResolutionIntro:
        "Quand IFeatureChecker.IsEnabledAsync() est appelé, Entitlements résout la valeur via une chaîne de priorité.",
      devChecklistTitle: "Liste de Contrôle Développeur",
      devChecklistIntro:
        "Suivez ces étapes chaque fois que vous ajoutez une nouvelle dépendance inter-modules.",
      checkStep1Title: "Étape 1 : Définir l'Interface dans Core.Application",
      checkStep1Content:
        "Définissez le contrat dans Core.Application.Abstractions. Aucune logique d'implémentation, seulement la définition de l'interface.",
      checkStep2Title: "Étape 2 : Enregistrer un Fallback NoOp",
      checkStep2Content:
        "Créez une implémentation NoOp dans Core.Infrastructure et enregistrez-la avec TryAddScoped.",
      checkStep3Title: "Étape 3 : Implémenter dans le Module Propriétaire",
      checkStep3Content:
        "Créez la vraie implémentation dans le module propriétaire et enregistrez avec AddScoped (pas TryAddScoped).",
      checkStep4Title: "Étape 4 : Ajouter des Diagnostics au Démarrage",
      checkStep4Content:
        "Ajoutez une vérification dans PostBuildInitialization.cs pour détecter si le NoOp est encore actif.",
      addScopedTip:
        "Utilisez toujours AddScoped (sans Try) dans les modules réels pour garantir que l'implémentation réelle remplace le NoOp de Core.Infrastructure.",
      archRulesTitle: "Règles d'Architecture — Récapitulatif",
      archRulesIntro:
        "Ces règles contraignantes s'appliquent à toute communication inter-modules dans SCRIPE.",
      doTitle: "A Faire",
      dontTitle: "A Ne Jamais Faire",
      securityBoundaryTitle: "Application des Limites de Sécurité",
      securityBoundaryIntro:
        "Les règles d'isolation des modules ne sont pas seulement une préférence architecturale — ce sont des limites de sécurité.",
      archCheckCaution:
        "Exécutez scripe arch-check avant chaque PR touchant le code inter-modules. Le flag --json retourne le code 1 si des violations critiques sont trouvées.",
    },
  },
};
