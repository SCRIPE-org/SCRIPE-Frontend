// FILE-EXCEPTION: file length
/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  architecture: {
    overview: {
      title: "Architecture Overview",
      description:
        "Clean Architecture layers, backend pipeline, frontend SOLID flow, and module boundary rules.",
      intro:
        "SCRIPE follows a strict Clean Architecture with four layers: Presentation, Application, Domain, and Infrastructure. The dependency rule ensures inner layers never depend on outer layers. This architecture is applied consistently across both backend (.NET) and frontend (Next.js).",
      layersTitle: "Clean Architecture Layers",
      backendArchTitle: "Backend Architecture",
      backendArchIntro:
        "The backend follows a request pipeline architecture where every HTTP request flows through middleware, controllers, SCRIPE mediator behaviors, and finally the CQRS handler. This ensures consistent validation, auditing, and error handling.",
      frontendArchTitle: "Frontend Architecture",
      frontendArchIntro:
        "The frontend uses a SOLID View/ViewModel pattern where Views are pure UI (no state, no logic) and ViewModels contain all business logic. The connector pattern separates Next.js routing (Server Components) from application logic (Client Components).",
      moduleBoundariesTitle: "Module Boundaries",
      moduleBoundariesIntro:
        "Modules are isolated islands. They cannot import from each other. This enables independent development, isolated failures, and the ability to extract modules to separate repositories.",
      withBoundaries: " With Module Boundaries",
      withoutBoundaries: " Without Module Boundaries",
      communicationPatternsTitle: "Cross-Module Communication",
      crossModuleNote:
        "The Event Bus pattern is planned for future releases. Currently, modules communicate exclusively through URL navigation and shared IDs.",
    },
    backend: {
      title: "Backend Architecture",
      description:
        "Program.cs anatomy, middleware pipeline, DI service map, module registration pattern, and controller catalog.",
      intro:
        "The SCRIPE backend is a .NET 10 Modular Monolith with 288 lines in Program.cs that wire together 16 service registrations, 10 middleware components, and 18 REST controllers. This page dissects every layer of the backend architecture.",
      programCsTitle: "Program.cs Anatomy",
      programCsIntro:
        "Program.cs is the application's entry point and wiring center. It detects the deployment mode, registers services in a specific order, and builds the middleware pipeline. The file follows a clear 5-section structure.",
      middlewarePipelineTitle: "Middleware Pipeline",
      middlewarePipelineIntro:
        "The middleware pipeline processes every HTTP request in a specific order. Each middleware can short-circuit the pipeline (e.g., rate limiter returns 429, auth returns 401). Order matters  changing it can break security.",
      diMapTitle: "DI Service Map",
      diMapIntro:
        "The following table shows all major service interfaces, their implementations, lifetimes, and where they are registered. Understanding this map is essential for debugging and extending the system.",
      modulePatternTitle: "Module Registration Pattern",
      modulePatternIntro:
        "Every new module follows the same DI registration pattern. The AddXxxModule() extension method registers the module's DbContext, repositories, services, and module registration marker.",
      controllersTitle: "Controllers",
      controllerTip:
        "All controllers inherit from a base ApiController that provides standardized Result<T> response mapping. Controllers should be thin  they only validate the request model and delegate to SCRIPE mediator.",
    },
    frontend: {
      title: "Frontend Architecture",
      description:
        "SOLID View/ViewModel pattern, module structure, and the connector pattern for Next.js integration.",
      intro:
        "The SCRIPE frontend is built with Next.js 16 (App Router) following a strict SOLID View/ViewModel pattern. Every page is composed of a pure UI View that delegates all logic to ViewModel hooks. This separation ensures testability, reusability, and maintainability.",
      solidPatternTitle: "SOLID View/ViewModel Pattern",
      solidPatternIntro:
        "The SOLID pattern ensures each piece of the UI has a single responsibility. Views render JSX, ViewModels manage state and logic, and Components provide reusable UI sections.",
      viewRulesTitle: "View Rules",
      viewDo: " View SHOULD",
      viewDont: " View SHOULD NOT",
      viewExampleTitle: "View Example",
      viewModelRulesTitle: "ViewModel Rules",
      viewModelRulesIntro:
        "ViewModels are React hooks that contain all business logic. They compose section-specific ViewModels (statistics, filters, table) and return typed interfaces consumed by Views.",
      moduleStructureTitle: "Module File Structure",
      connectorPatternTitle: "Connector Pattern",
      connectorPatternIntro:
        "The connector pattern separates Next.js App Router pages (Server Components) from module Views (Client Components). Pages in src/app/ are thin connectors that import and render module Views. They handle routing, metadata, and URL params only.",
      connectorWarning:
        "NEVER put business logic, data fetching, forms, or state management in src/app/ files. These are Server Components that only connect routes to module Views.",
    },
    cqrs: {
      title: "CQRS Pattern",
      description:
        "Command/Query Responsibility Segregation with SCRIPE mediator pipeline, behaviors, validation, and caching.",
      intro:
        "SCRIPE uses the CQRS (Command Query Responsibility Segregation) pattern to separate read and write operations. Commands mutate state and go through validation + audit behaviors. Queries read state and can leverage caching. SCRIPE mediator acts as the mediator between controllers and handlers.",
      whatIsCqrsTitle: "What is CQRS?",
      whatIsCqrsIntro:
        "CQRS separates your application into two sides: Commands (writes) and Queries (reads). Each side can be optimized independently  commands focus on data integrity and validation, while queries focus on performance and caching.",
      commandSide: "Command Side (Write)",
      querySide: "Query Side (Read)",
      pipelineTitle: "SCRIPE Mediator Pipeline",
      validationBehaviorTitle: "Validation Behavior",
      commandExampleTitle: "Command Example",
      queryExampleTitle: "Query Example",
      cachingTip:
        "Queries can use server-side caching to avoid hitting the database on every request. The cache key should include all query parameters to ensure uniqueness. Cache is automatically invalidated when related commands succeed.",
    },
    modules: {
      title: "Module System",
      description:
        "Module isolation rules, backend/frontend templates, module registry, and cross-module communication.",
      intro:
        "SCRIPE uses a strict module system where each module is an isolated island with clear boundaries. Modules cannot import from each other  they communicate only through URLs, shared IDs, or the core event bus. This ensures independence, testability, and the ability to extract modules to separate repositories.",
      isolationRulesTitle: "Module Isolation Rules",
      allowedImportsTitle: " Allowed Imports",
      forbiddenImportsTitle: " Forbidden Imports",
      backendModuleTitle: "Backend Module Template",
      backendModuleIntro:
        "Every backend module follows DDD (Domain-Driven Design) with three projects: Domain, Application, and Infrastructure. The Domain is pure C# with no external dependencies.",
      frontendModuleTitle: "Frontend Module Template",
      registryTitle: "Module Registry",
      registryIntro:
        "The module registry tracks all active modules at runtime. It is populated during application startup when each module's IModuleRegistration implementation is resolved and registered.",
      communicationTitle: "Cross-Module Communication Patterns",
      pattern1Title: "Pattern 1: URL Navigation",
      pattern1Content:
        "Navigate to another module's page via standard URL links. No imports needed.",
      pattern2Title: "Pattern 2: Shared IDs Only",
      pattern2Content: "Store only the foreign module's entity ID. Never embed the whole entity.",
      pattern3Title: "Pattern 3: Core Event Bus",
      pattern3Content:
        "Publish and subscribe to events through a shared event bus in @core/. Future pattern  not yet implemented.",
      boundaryWarning:
        "Module boundaries are absolute law. If you need to share code between modules, it MUST go in @core/. Any import from @modules/{other}/ is a violation and will be caught in code review.",
    },
    solidPattern: {
      title: "SOLID View/ViewModel",
      description:
        "Page type scenarios  CRUD lists, dashboards, profiles, settings, wizards, and report builders.",
      intro:
        "The SOLID View/ViewModel pattern is mandatory for all pages in src/modules/. This guide covers 7 page type scenarios with their exact directory structures, ViewModel patterns, and code examples.",
      principlesTitle: "SOLID Principles Applied",
      scenariosTitle: "Page Type Scenarios",
      scenariosIntro:
        "Choose the scenario that matches your page type. Each provides a tried-and-tested structure that ensures consistency across the entire application.",
      scenario1Title: "Scenario 1: CRUD List Page",
      scenario1Intro:
        "Use for managing entity collections (Users, Products, Orders). The orchestrator composes statistics, filters, and table ViewModels.",
      scenario2Title: "Scenario 2: Dashboard / Analytics",
      scenario2Intro:
        "Use for KPIs, charts, and metrics. Each chart or card section gets its own ViewModel with period selection and data transformation.",
      scenario3Title: "Scenario 3: Detail / Profile Page",
      scenario3Intro:
        "Use for viewing a single entity with tabs and sections. The orchestrator fetches the main entity and composes tab ViewModels.",
      scenario4Title: "Scenario 4: Settings Page",
      scenario4Intro:
        "Use for multiple independently-saveable form sections. Each settings section gets its own ViewModel with form state and save mutation.",
      scenario5Title: "Scenario 5: Wizard / Multi-Step Form",
      scenario5Intro:
        "Use for complex multi-step flows like onboarding or checkout. The wizard ViewModel coordinates step navigation, validation gates, and combined submission.",
      rulesTitle: "Golden Rules",
      antiPatternWarning:
        "Anti-pattern: Putting useState, useEffect, or useQuery directly in a View component. ALL state and logic must live in ViewModels. Views are pure UI composition only.",
    },
    stateManagement: {
      title: "State Management",
      description:
        "TanStack Query for server state, Zustand for global UI state, and LanguageProvider for localization.",
      intro:
        "SCRIPE uses three state management tools, each for a specific category: TanStack Query for server data (API results), Zustand for global UI state (auth, sidebar, theme), and useState for component-local state (forms, toggles).",
      decisionTitle: "Decision Matrix",
      tanstackTitle: "TanStack Query (Server State)",
      tanstackIntro:
        "Use TanStack Query for any data that comes from the API. It handles caching, background refetching, pagination, optimistic updates, and request deduplication automatically.",
      zustandTitle: "Zustand (Global UI State)",
      zustandIntro:
        "Use Zustand for global UI state that needs to be shared across components but doesn't come from the server. There are exactly 3 approved stores.",
      antiPatternsTitle: "Anti-Patterns",
      doTitle: " DO",
      dontTitle: " DON'T",
      localizationTitle: "Localization (LanguageProvider + Module Locales)",
      localizationIntro:
        "Localization uses a custom LanguageProvider with localStorage persistence plus a module-scoped locale system. Shared keys (~1,156) live in core/locales/. Module-specific keys are co-located in each module's locales/ directory and loaded lazily via useModuleLocales().",
      noLocaleFoldersWarning:
        "Do NOT use [locale] folders in src/app/! Localization is handled via LanguageProvider context, not file-based routing. No next-intl, no next-i18next, no URL-based language (/en/, /ar/).",
    },
    dataFlow: {
      title: "Data Flow",
      description:
        "End-to-end data flow diagrams  query, mutation, backend pipeline, error handling, and caching strategy.",
      intro:
        "Understanding how data flows through SCRIPE is essential for debugging and extending the system. This page traces data from a button click in the UI all the way to the database and back.",
      queryFlowTitle: "Query Flow (Read)",
      queryFlowIntro:
        "When a user views data (e.g., opening the Users page), the flow starts at the View, goes through the ViewModel, TanStack Query, Repository, API Service, and finally the backend API.",
      mutationFlowTitle: "Mutation Flow (Write)",
      backendPipelineTitle: "Backend Request Pipeline",
      backendPipelineIntro:
        "Every backend request passes through 10 middleware components and 4 SCRIPE mediator pipeline behaviors before reaching the handler. This ensures consistent logging, authentication, authorization, validation, feature gating, and auditing.",
      errorFlowTitle: "Error Handling",
      errorFlowIntro:
        "Errors are handled at multiple levels. Each error source has a specific handler, response code, and frontend handling strategy.",
      cachingFlowTitle: "Caching Strategy",
      cachingFlowIntro:
        "The backend uses a two-level caching strategy: L1 (in-process IMemoryCache) and L2 (distributed Redis). The frontend uses TanStack Query's built-in cache with configurable staleTime.",
      cacheTip:
        "Set staleTime to 5 minutes for data that changes infrequently (roles, permissions). Use 0 for data that changes often (audit logs, notifications). Always invalidate related queries after successful mutations.",
    },
    domainModel: {
      title: "Domain Model",
      description:
        "Entity inheritance hierarchy, AuditableEntity, ITenantAwareEntity, soft-delete lifecycle, repository abstractions, and global query filters.",
      intro:
        "SCRIPE's domain model follows a strict inheritance hierarchy where all business entities inherit from AuditableEntity, which provides audit fields (CreatedBy, CreatedAt, ModifiedBy, ModifiedAt) and soft-delete support (IsDeleted, DeletedAt, DeletedBy). Tenant-scoped entities additionally implement ITenantAwareEntity for automatic row-level isolation.",
      entityHierarchyTitle: "Entity Inheritance Hierarchy",
      entityHierarchyIntro:
        "All domain entities follow a three-level inheritance chain: IEntity (marker interface) → Entity<TId> (identity + equality + domain events) → AuditableEntity (audit fields + soft-delete). Entities that belong to a specific tenant also implement the ITenantAwareEntity interface.",
      ientityTitle: "IEntity Interface",
      entityBaseTitle: "Entity<TId> Base Class",
      entityBaseIntro:
        "The Entity<TId> base class provides identity equality (two entities are equal if they share the same Id), hash code generation, and domain event support. Every entity can raise domain events that are captured by the OutboxInterceptor and published asynchronously.",
      entityDomainEventNote:
        "Domain events raised via RaiseDomainEvent() are collected by the OutboxInterceptor during SaveChanges and persisted in the same transaction. They are later published asynchronously by the OutboxProcessor background service.",
      auditableEntityTitle: "AuditableEntity",
      auditableEntityIntro:
        "AuditableEntity adds 7 audit and soft-delete fields to the base Entity. These fields are automatically populated by the AuditableEntityInterceptor during SaveChanges — you never set them manually in your code.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantAwareIntro:
        "Entities that implement ITenantAwareEntity are automatically scoped to the current tenant via EF Core global query filters. The TenantId is set by the TenantContextMiddleware when the entity is created, and all subsequent queries are automatically filtered by tenant.",
      tenantIsolationWarning:
        "Never bypass tenant isolation without explicit authorization. Using IgnoreQueryFilters() removes ALL filters including tenant scoping. Always add a manual .Where(e => e.TenantId == tenantId) when bypassing filters.",
      softDeleteTitle: "Soft-Delete Lifecycle",
      softDeleteIntro:
        "All entities use soft-delete via the IsDeleted flag. When a DELETE endpoint is called, the AuditableEntityInterceptor converts the hard delete into a soft-delete by setting IsDeleted=true, DeletedAt, and DeletedBy. The entity remains in the database but is hidden from normal queries by the global query filter.",
      repositoryTitle: "Repository Abstractions",
      repositoryIntro:
        "SCRIPE defines three repository interfaces in the Domain layer: IReadRepository<T> for queries, IWriteRepository<T> for mutations, and IRepository<T> that combines both with a SaveChangesAsync method. All repository implementations live in the Infrastructure layer.",
      concreteEntitiesTitle: "Concrete Entity Registry",
      queryFiltersTitle: "Global Query Filters",
      queryFiltersIntro:
        "EF Core global query filters are applied to every entity that inherits from AuditableEntity (soft-delete filter) and implements ITenantAwareEntity (tenant isolation filter). These filters are registered once in OnModelCreating and apply to every LINQ query automatically.",
      ignoreFiltersTip:
        "Use IgnoreQueryFilters() only in RecycleBin operations (to see soft-deleted items) and SuperAdmin cross-tenant queries. Always pair it with an explicit tenant filter to prevent data leaks.",
      bestPracticesTitle: "Best Practices",
      doTitle: "✅ DO",
      dontTitle: "❌ DON'T",
    },
    domainEvents: {
      title: "Domain Events",
      description:
        "IDomainEvent interface, outbox pattern, OutboxInterceptor, OutboxProcessor, and reliable event delivery.",
      intro:
        "Domain events represent significant occurrences in the business domain. SCRIPE uses the Outbox Pattern to guarantee reliable event delivery — events are persisted in the same database transaction as entity changes and published asynchronously by a background processor.",
      interfaceTitle: "IDomainEvent Interface",
      interfaceIntro:
        "All domain events implement the IDomainEvent interface, which inherits from SCRIPE mediator's INotification. This enables in-process pub/sub where multiple handlers can subscribe to the same event type. Each event carries a unique EventId and OccurredAt timestamp.",
      publishingTitle: "Publishing & Handling Flow",
      publishingIntro:
        "Domain events follow a 6-step lifecycle: the entity raises an event via RaiseDomainEvent(), the OutboxInterceptor captures it during SaveChanges, the event is persisted as an OutboxMessage in the same transaction, the OutboxProcessor polls for unprocessed messages, deserializes the event, and publishes it via SCRIPE mediator.",
      publisherTitle: "IDomainEventPublisher",
      outboxTitle: "Outbox Pattern",
      outboxIntro:
        "The Outbox Pattern solves the dual-write problem: how to atomically update the database AND publish an event. By persisting events in the same transaction as entity changes, we guarantee that events are never lost — even if the application crashes immediately after SaveChanges.",
      outboxWarning:
        "The Outbox Pattern provides at-least-once delivery, not exactly-once. Event handlers must be idempotent — they should produce the same result whether invoked once or multiple times with the same event.",
      outboxMessageTitle: "OutboxMessage Entity",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxInterceptorIntro:
        "The OutboxInterceptor is an EF Core SaveChanges interceptor that runs BEFORE the transaction is committed. It collects all domain events from tracked entities, serializes them as OutboxMessage records, and adds them to the same database context — ensuring atomicity.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxProcessorIntro:
        "The OutboxProcessor is a BackgroundService that polls the OutboxMessage table every 5 seconds for unprocessed messages. It processes them in batches of 20, deserializing each event and publishing it via SCRIPE mediator. Failed events are retried with an incrementing RetryCount.",
      outboxCleanupTitle: "Outbox Cleanup Job",
      outboxCleanupIntro:
        "A background recurring job (e.g., via Hangfire) runs daily at 2:00 AM UTC to delete processed outbox messages older than 7 days. This prevents unbounded table growth while keeping recent messages for debugging.",
      architectureSummaryTitle: "Outbox Architecture Summary",
      customEventsTitle: "Creating Custom Domain Events",
      customEventsIntro:
        "Follow these 3 steps to add a new domain event to SCRIPE. The outbox infrastructure handles persistence and delivery automatically.",
      step1Title: "1. Define the Event",
      step1Content:
        "Create a record implementing IDomainEvent in the module's Domain/Events/ directory. Include all contextual data that handlers will need.",
      step2Title: "2. Raise from Command Handler",
      step2Content:
        "Call entity.RaiseDomainEvent(new YourEvent(...)) in the command handler, then call SaveChangesAsync. The OutboxInterceptor captures the event automatically.",
      step3Title: "3. Create Event Handlers",
      step3Content:
        "Implement INotificationHandler<DomainEventNotification> to react to the event. Multiple handlers can subscribe to the same event for different side-effects (email, audit, webhook, etc.).",
      reliabilityTitle: "Reliability Guarantees",
      withOutboxTitle: "✅ With Outbox Pattern",
      withoutOutboxTitle: "❌ Without Outbox Pattern",
    },
    cqrsPipeline: {
      title: "CQRS Pipeline",
      description:
        "SCRIPE mediator pipeline behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, Result pattern, and full command/query map.",
      intro:
        "Every command and query in SCRIPE flows through a configurable SCRIPE mediator pipeline with 5 built-in behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, and CachingBehavior. The order is managed from appsettings or environment variables and validated at startup.",
      overviewTitle: "Pipeline Overview",
      overviewIntro:
        "The default SCRIPE mediator order is Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. Validation and feature checks intentionally run before cache lookup, while cache invalidation unwinds before webhook dispatch after successful mutations.",
      separationTitle: "Command vs Query Separation",
      separationIntro:
        "CQRS separates the application into two distinct paths: Commands (writes) mutate state and go through full validation + audit, while Queries (reads) are optimized for performance with caching and AsNoTracking.",
      commandsTitle: "Commands (Write)",
      queriesTitle: "Queries (Read)",
      resultPatternTitle: "Result Pattern",
      resultPatternIntro:
        "All handlers return Result<T> instead of throwing exceptions for expected failures. Result<T> is a discriminated union with IsSuccess/IsFailure, Value (on success), and AppError (on failure). This eliminates try-catch blocks in controllers and enables pattern matching.",
      validationTitle: "ValidationBehavior",
      validationIntro:
        "The ValidationBehavior runs immediately after logging. It collects all IValidator<TRequest> validators, returns structured Result failures for invalid requests, and prevents invalid requests from reaching handlers or caches.",
      validatorExampleTitle: "Validator Examples",
      loggingTitle: "LoggingBehavior",
      loggingIntro:
        "The LoggingBehavior logs every SCRIPE mediator request with the user ID, tenant ID, request type, and execution time. Requests exceeding 500ms are logged as warnings for performance monitoring.",
      cachingTitle: "CachingBehavior",
      cachingIntro:
        "The CachingBehavior intercepts queries that implement the ICacheable interface, performing tenant-scoped cache lookups. To prevent concurrent cache stampedes under high load, it relies on key-specific SemaphoreSlim locks to serialize database reads on miss. It also handles mutation invalidation via IInvalidatesCache, clearing exact keys or prefix-based namespaces. Furthermore, it incorporates key eviction to limit growth and links feature configurations to a global eviction token source for instant, thread-safe cache invalidation.",
      cachingStampedeTitle: "Cache Concurrency & Stampede Prevention",
      cachingStampedeIntro:
        "To prevent performance degradation during heavy load, the caching system implements Cache Stampede mitigation. Key-specific semaphores ensure that if multiple concurrent requests ask for a missing or expired key, only the first thread executes the database/API query, while subsequent requests await the semaphore and retrieve the newly cached value. Additionally, unbounded growth is prevented by tracking cache keys and randomly evicting 50% of them when exceeding 10,000 tracked keys. Feature cache entries are also bound to a global eviction token for instant cache clearing.",
      outboxTitle: "Domain Events & Outbox System Pipeline",
      outboxIntro:
        "To guarantee transactional consistency and prevent the dual-write problem, SCRIPE uses an Outbox pattern. Domain events are raised inside Aggregate Roots, intercepted by EF Core SaveChangesInterceptor, serialized to JSON, and persisted as OutboxMessage entities in the same database transaction. A background job (OutboxProcessorJob) runs every minute to poll unprocessed messages and publish them locally (via AstraFlow Mediator) or externally (via EventBus). Finally, a daily OutboxCleanupJob runs at 5:00 AM to purge processed messages older than 7 days.",
      flowStampedeTitle: "Cache Stampede Lock Sequence",
      flowStampedeRequest: "Client Request\nGetOrCreateAsync(key)",
      flowStampedeMiss: "Cache Miss?\nCheck InMemory/Redis",
      flowStampedeLock: "Acquire Lock\nSemaphoreSlim(1,1)",
      flowStampedeCheck: "Double-Check Cache\nValidate inside lock",
      flowStampedeFound: "Cache Hit\nValue populated by other thread",
      flowStampedeFactory: "Execute Factory\nRun Database / API Query",
      flowStampedeWrite: "Write to Cache\nAdd PostEvictionCallback",
      flowStampedeRelease: "Release Lock\nReturn cached value to all threads",
      flowOutboxTitle: "Outbox Message Processing Pipeline",
      flowOutboxRaise: "Raise Domain Event\nAggregateRoot.AddDomainEvent()",
      flowOutboxIntercept: "Intercept SaveChanges\nOutboxInterceptor scans ChangeTracker",
      flowOutboxSerialize: "Serialize Event\nConvert to JSON & wrap in OutboxMessage",
      flowOutboxCommit: "Atomic DB Transaction\nSave entity updates + OutboxMessage",
      flowOutboxPoll: "OutboxProcessorJob\nPoll unprocessed every minute",
      flowOutboxDispatch: "Publish Event\nLocal Mediator + External EventBus",
      flowOutboxComplete: "Mark Processed\nSet ProcessedOnUtc = UtcNow",
      flowOutboxCleanup: "OutboxCleanupJob\nPurge processed records > 7 days",
      connCacheQuery: "requests key",
      connCacheMiss: "cache miss",
      connAcquireLock: "acquires lock",
      connDoubleCheck: "cache hit",
      connCacheHit: "returns value",
      connDbQuery: "executes query",
      connCacheWrite: "updates cache",
      connLockRelease: "releases lock",
      connRaise: "triggers interceptor",
      connIntercept: "scans events",
      connSerialize: "serializes",
      connCommit: "commits atomically",
      connPoll: "polls batch of 50",
      connDispatch: "dispatches event",
      connComplete: "saves status",
      connCleanup: "daily purges",
      commandMapTitle: "Command & Query Catalog",
      commandMapIntro:
        "The following table lists every command, query, and validator registered in the system, organized by domain area. This is the complete CQRS surface area of SCRIPE.",
      registrationTitle: "Pipeline Registration",
      registrationIntro:
        "Pipeline behaviors are registered by AddCoreApplication() from Mediator options. Handler scanning, request coverage validation, notification failure policy, and pipeline order are controlled from configuration.",
      behaviorOrderTip:
        "Default safety validation rejects pipeline orders where Caching runs before Validation or FeatureCheck. Override Mediator__EnforceSecurityPipelineOrder only when you fully own the risk.",
      featureCheckTitle: "FeatureCheckBehavior",
      featureCheckIntro:
        "The FeatureCheckBehavior intercepts commands that implement IRequireFeature. It checks whether the tenant's Edition allows the requested feature by calling IFeatureChecker.IsEnabledAsync. If the feature is disabled, it returns a Forbidden error without executing the handler. System-level operations (no TenantId) bypass this check.",
      featureCheckMarkerTitle: "IRequireFeature Marker",
      featureCheckMarkerIntro:
        "Commands opt-in to feature gating by implementing the IRequireFeature interface with a RequiredFeatureName property. When the Entitlements module is not deployed, NoOpFeatureChecker returns true for all checks — making this behavior a silent pass-through.",
    },
    dependencyInjection: {
      title: "Dependency Injection",
      description:
        "Program.cs registration flow, module DI pattern, service discovery, core + identity service maps, lifetime rules, and YARP gateway.",
      intro:
        "SCRIPE uses .NET's built-in Dependency Injection container with a structured registration pattern. Program.cs orchestrates all registrations: core infrastructure first, then modules conditionally based on MODULE_NAME, and finally the application layer with SCRIPE mediator. This page documents every service registration, lifetime decision, and the module DI pattern.",
      architectureTitle: "DI Registration Architecture",
      architectureIntro:
        "Program.cs follows a strict 4-phase registration order: (1) Core Infrastructure — cache, blob storage, audit, etc. (2) CORS & Rate Limiting. (3) Modules — each module registers its own DbContext, repositories, and services. (4) Application Layer — SCRIPE mediator, behaviors, validators.",
      moduleRegTitle: "Module Registration Pattern",
      moduleRegIntro:
        "Each module exposes an AddXxxModule() extension method that registers all its services. The MODULE_NAME environment variable controls which modules are loaded: empty = monolith (all modules), 'Identity' = only Identity module, 'Gateway' = API gateway mode.",
      monolithNote:
        "In monolith mode (MODULE_NAME not set), ALL modules are loaded into a single process. In microservice mode, each module runs as an independent process with its own port. The same codebase supports both deployment models.",
      controllerProviderTitle: "Module Controller Feature Provider",
      controllerProviderIntro:
        "The ModuleControllerFeatureProvider filters which controllers are loaded at startup based on the MODULE_NAME. In monolith mode, all controllers are loaded. In microservice mode, only controllers tagged with the matching [BelongsToModule] attribute are loaded.",
      serviceDiscoveryTitle: "Service Discovery",
      serviceDiscoveryIntro:
        "In microservice mode, services need to discover each other's URLs. SCRIPE uses configuration-based service discovery (from appsettings.json) to resolve service names to URLs.",
      coreServicesTitle: "Core Infrastructure Services",
      coreServicesIntro:
        "The following services are registered by AddCoreInfrastructure() and are available to all modules. They provide cross-cutting concerns like caching, file storage, auditing, email, webhooks, and data scoping.",
      identityModuleTitle: "Identity Module Services",
      identityModuleIntro:
        "The Identity module registers 24 repository interfaces and 10 service interfaces. All repositories are registered as Scoped (one instance per HTTP request) to match the DbContext lifetime.",
      lifetimeTitle: "Service Lifetime Rules",
      singletonTitle: "Singleton Lifetime",
      scopedTitle: "Scoped Lifetime",
      gatewayTitle: "YARP Gateway Configuration",
      gatewayIntro:
        "When MODULE_NAME=Gateway, the application acts as a YARP reverse proxy. It routes requests to backend microservices based on URL path prefix matching. The gateway handles SSL termination, request buffering, and can be extended with custom middleware.",
      bestPracticesTitle: "DI Best Practices",
      captiveTip:
        "A captive dependency occurs when a Singleton service injects a Scoped service — the Scoped service becomes a de-facto Singleton, causing stale data and memory leaks. Use IServiceScopeFactory to create a new scope inside Singleton services when you need Scoped dependencies.",
    },
    moduleCollab: {
      title: "Module Collaboration Deep Dive",
      description:
        "How Identity and Entitlements collaborate via Core abstractions, the NoOp safety pattern, SubscriptionChangedEvent lifecycle, and deployment topology impact.",
      intro:
        "SCRIPE has 5 modules (Identity, Entitlements, Compliance, Plugins, Marketplace). They are hermetically sealed — no cross-imports allowed. Yet they must collaborate to drive permissions, subscription features, and billing. The solution: the Core.Application.Abstractions layer acts as a typed, interface-based bridge. Every cross-module interaction flows through this bridge — never through direct module-to-module imports. This page documents every interface, pattern, and runtime flow that makes this work.",

      // Core Bridge
      coreBridgeTitle: "The Core Layer Bridge",
      coreBridgeIntro:
        "Core.Application.Abstractions is the heart of cross-module communication. It defines 32+ interface contracts. Identity.Infrastructure and Entitlements.Infrastructure each implement their respective side of these contracts. The AstraFlow pipeline behaviors and module handlers consume only the interfaces — never the concrete implementations. This means the system compiles and runs identically whether Entitlements is deployed or not.",

      // Interface catalog
      catalogTitle: "Complete Cross-Module Interface Catalog",
      catalogIntro:
        "The following table documents every interface that crosses module boundaries. Defined in Core.Application, these interfaces are the only legal way for modules to communicate with each other.",

      // NoOp pattern
      noopTitle: "The NoOp Safety Pattern",
      noopIntro:
        "Core.Infrastructure registers a NoOp (no-operation) implementation for every cross-module interface. These are registered with TryAddScoped, meaning real module implementations override them when deployed. If a module fails to load, the NoOp silently keeps the system alive. Startup diagnostics detect when critical interfaces are still NoOp and emit LogCritical warnings.",
      noopWarning:
        "SAFETY CRITICAL: If IFeatureChecker remains as NoOpFeatureChecker in production, ALL edition features appear enabled and ALL quotas are unlimited for every tenant. The startup diagnostic emits a LogCritical log, but this does NOT stop the server. Always verify the Entitlements module is loaded when using subscription-based feature gating.",
      noopTableTitle: "NoOp Implementation Registry",

      // FeatureCheckBehavior
      featureCheckTitle: "FeatureCheckBehavior — The Gating Point",
      featureCheckIntro:
        "FeatureCheckBehavior is an AstraFlow pipeline behavior that intercepts commands implementing IRequireFeature. It resolves the tenant ID from the current user context, calls IFeatureChecker.IsEnabledAsync, and either passes the request through or returns a 403 Forbidden result. Because it uses IFeatureChecker (not a concrete class), it works transparently whether Entitlements is deployed or not. When Entitlements is absent, NoOpFeatureChecker returns true for every check, making the behavior a transparent pass-through with zero overhead.",
      featureCheckFlowTitle: "FeatureCheck Decision Flow",
      featureCheckCodeTitle: "Opting a Command into Feature Gating",

      // SubscriptionChangedEvent
      subscriptionEventTitle: "SubscriptionChangedEvent — The Permission Sync Backbone",
      subscriptionEventIntro:
        "SubscriptionChangedEvent is the most critical cross-module domain event in SCRIPE. Published by Entitlements, handled by Identity. It carries the complete effective feature set, the subscription status, and pre-expanded bundle data. Identity uses this event to rebuild the tenant's entire permission pool — adding permissions for newly enabled modules and removing permissions for disabled ones. This is how a billing change in Entitlements becomes a permission change in Identity without any direct module coupling.",
      subscriptionEventDefTitle: "Event Definition",
      subscriptionEventTriggersTitle: "All Commands That Publish This Event",

      // Permission sync lifecycle
      permSyncTitle: "Permission Sync Lifecycle — Step by Step",
      permSyncIntro:
        "When a tenant's subscription changes, a precise 5-step lifecycle executes to rebuild their permission pool. Understanding this lifecycle is essential for debugging permission issues and for designing new subscription-driven features.",
      permSyncStep1Title: "Step 1 — Entitlements Resolves Edition Features",
      permSyncStep1Content:
        "The Entitlements command handler (e.g., AssignEditionCommandHandler) resolves the full effective feature map for the tenant. This merges the Edition's base features, any TenantFeatureOverrides, and BundleExpansion feature additions. The result is a flat dictionary of feature name to value (e.g., 'Communication.Enabled' → 'true'). From this, it derives which module names are enabled.",
      permSyncStep2Title: "Step 2 — Event Published via Outbox",
      permSyncStep2Content:
        "The SubscriptionChangedEvent is raised on the entity as a domain event. The EF Core OutboxInterceptor captures it before SaveChangesAsync. The event is persisted to the OutboxMessages table in the same database transaction as the subscription change. After commit, the OutboxProcessor dispatches the event to all registered handlers. This guarantees exactly-once delivery even if the process crashes mid-execution.",
      permSyncStep3Title: "Step 3 — Identity Handler Processes the Event",
      permSyncStep3Content:
        "Identity.Application's SubscriptionChangedEventHandler receives the event. If IsRevocation is true (subscription canceled/expired/suspended), it calls SyncPermissionsForModulesAsync with an empty module list — which removes all edition-based permissions. If not a revocation, it syncs permissions for all enabled modules and processes each BundleExpansion (grant and deny codes).",
      permSyncStep4Title: "Step 4 — ITenantPermissionManager Syncs the Pool",
      permSyncStep4Content:
        "Identity.Infrastructure.TenantPermissionManager implements ITenantPermissionManager. It uses IPermissionReader to get all permission IDs for the enabled modules from the Identity database. It filters these by RequiredFeature (permissions gated on specific features are only granted if that feature is enabled). It diffs against the current TenantPermission records, adding missing and removing excess entries atomically.",
      permSyncStep5Title: "Step 5 — Admin Permission Cache Invalidated",
      permSyncStep5Content:
        "After the permission pool is synced, IAdminPermissionCache.InvalidateAll() is called for the tenant. Every admin's cached permission set is cleared from the in-memory + Redis cache. On their next API request, the AuthorizationBehavior will reload their permissions from the database and re-populate the cache. The frontend receives updated permissions on the next token refresh cycle.",

      // Login enrichment
      loginEnrichTitle: "Login Response Enrichment — ISubscriptionStatusProvider",
      loginEnrichIntro:
        "Identity's login handler needs to return the tenant's subscription status so the frontend can display grace period warnings, upgrade prompts, and edition badges. But Identity cannot import Entitlements. The solution: ISubscriptionStatusProvider is injected into the login handler. Entitlements.Infrastructure implements this interface, returning TenantSubscriptionInfo with status, edition name, grace phase, and expiry date.",
      loginEnrichNote:
        "If Entitlements is not deployed, the NoOp implementation returns null for subscription info. The login response will have null subscription fields, and the frontend will show no subscription status — a safe, correct behavior for deployments without billing.",

      // Deployment topology
      deployTopologyTitle: "Deployment Topology Impact",
      deployTopologyIntro:
        "The MODULE_NAME environment variable controls which modules are loaded. This fundamentally changes how cross-module communication works. Monolith mode supports all collaboration patterns. Microservice mode has critical limitations you must understand before extracting modules.",
      monolithMode: 'Monolith Mode (MODULE_NAME="")',
      microserviceMode: 'Microservice Mode (MODULE_NAME="Identity")',
      microserviceCaution:
        "CRITICAL: Self-service signup is blocked at startup in microservice mode. PostBuildInitialization.cs contains a G15 guard that throws InvalidOperationException if Signup:Enabled=true AND a specific MODULE_NAME is set (non-gateway). The signup saga relies on SignupCheckoutCompletedEvent and SubscriptionChangedEvent being dispatched in-process. In microservice mode, these events are silently lost — paid tenants would never activate and would have zero permissions. v2 roadmap: outbox + message bus will bridge this gap.",

      // Co-dependency map
      coDependencyTitle: "Module Co-Dependency Map",
      coDependencyIntro:
        "This table documents every formal dependency between modules, showing exactly what each module needs from another and how that need is satisfied via Core interfaces. Use this as a reference when planning microservice extraction or when debugging cross-module data flow issues.",

      // Signup saga
      signupSagaTitle: "The Self-Service Signup Cross-Module Saga",
      signupSagaIntro:
        "The self-service B2B2C tenant signup is the most complex cross-module saga in SCRIPE. It spans Identity (tenant provisioning), Entitlements (subscription linking and billing), and Stripe (payment processing). Understanding this flow is critical for supporting customers and for maintaining the signup infrastructure.",
      signupMonolithOnly:
        "MONOLITH ONLY: The signup saga uses in-process domain events (SignupPhase1CompletedEvent, SignupCheckoutCompletedEvent, SubscriptionChangedEvent) that cross the Identity ↔ Entitlements boundary. This only works when both modules run in the same process. Microservice mode blocks signup at startup via the G15 guard in PostBuildInitialization.cs.",
      signupStep1Title: "Phase 1 — Identity Provisions Tenant",
      signupStep1Content:
        "RegisterTenantSelfServiceCommand (in Identity module) executes in a single atomic database transaction. It creates the Tenant entity, sets up the default subdomain and branding, provisions default security roles (Admin, User), creates the tenant owner Admin account, and verifies the email verification ticket. On success, it publishes SignupPhase1CompletedEvent.",
      signupStep2Title: "Phase 2 — Entitlements Links Subscription",
      signupStep2Content:
        "The SignupPhase1CompletedEventHandler (in Entitlements module) handles SignupPhase1CompletedEvent. It creates a TenantSubscription record for the chosen edition. If the edition is free, it immediately activates and publishes SubscriptionChangedEvent to grant permissions. If the edition is paid, it creates a Stripe Checkout session and returns the payment URL.",
      signupStep3Title: "Phase 3 — Stripe Confirms, Entitlements Activates",
      signupStep3Content:
        "When the user completes Stripe checkout, Stripe sends a checkout.session.completed webhook. StripeWebhookHelper (in Entitlements) processes this event, finds the matching SignupSession, activates the subscription, and publishes SubscriptionChangedEvent. Identity's handler grants all edition permissions to the new tenant's permission pool.",
      signupStep4Title: "Compensation — If Checkout Abandoned",
      signupStep4Content:
        "If the user abandons the Stripe checkout (or Stripe fails to initialize), CompensatePhase1Async is called. This deletes the provisioned tenant and the tenant admin account, preventing orphaned accounts with no active subscription. A daily SignupReconciliationSweepJob also sweeps for stale incomplete signups and cleans them up.",

      // Developer checklist
      devChecklistTitle: "Developer Checklist — Adding a New Cross-Module Dependency",
      devChecklistIntro:
        "When you need two modules to share data, follow this exact pattern. Never import one module from another. Always go through Core.Application.Abstractions.",
      checkStep1Title: "1. Define the contract in Core.Application.Abstractions",
      checkStep1Content:
        "Create a new interface file in Core.Application/Abstractions/. The interface should be minimal — only what the consuming module actually needs. Add XML documentation explaining which module implements it and which module consumes it.",
      checkStep2Title: "2. Register a NoOp in Core.Infrastructure",
      checkStep2Content:
        "Create a NoOp implementation in Core.Infrastructure/Services/ (or appropriate subfolder). Register it with TryAddScoped in Core.Infrastructure/DependencyInjection.cs. The NoOp should return a safe, neutral value (null, empty, false, -1 for unlimited). Never throw NotImplementedException in a NoOp.",
      checkStep3Title: "3. Implement in the target module's Infrastructure",
      checkStep3Content:
        "Create the real implementation in {Module}.Infrastructure/CrossModule/ or {Module}.Infrastructure/Services/. Register it with AddScoped (NOT TryAddScoped) in the module's DependencyInjection.cs. Using AddScoped ensures the real implementation OVERRIDES the NoOp that Core registered first.",
      checkStep4Title: "4. Add startup diagnostic in PostBuildInitialization.cs",
      checkStep4Content:
        "Add a check in PostBuildInitialization.cs to detect if the interface is still resolved as the NoOp. Log a LogCritical warning if so. This is the safety net that alerts developers to misconfigured deployments in production without crashing the server.",
      addScopedTip:
        "Always use AddScoped (not TryAddScoped) when registering real module implementations. TryAddScoped only registers if no registration exists — and Core.Infrastructure already registered the NoOp with TryAddScoped first. To override, you need the unconditional AddScoped.",

      // NoOp Registration
      noopRegistrationTitle: "NoOp Registration — TryAddScoped vs AddScoped",
      noopRegistrationIntro:
        "The entire NoOp override mechanism depends on one critical rule: Core.Infrastructure registers NoOps with TryAddScoped. Real module implementations register with AddScoped. Because TryAddScoped only registers if no service is registered yet, calling AddScoped afterward unconditionally overrides it. The order matters: Core.Infrastructure always loads first (it's a transitive dependency of all module Infrastructure projects), so the NoOp is always registered first, and the module's real implementation always wins.",

      // Startup Diagnostics
      startupDiagnosticsTitle: "Startup Diagnostics — Detecting NoOp Leakage",
      startupDiagnosticsIntro:
        "PostBuildInitialization.cs runs after the DI container is built and all modules are registered. It checks the resolved type for critical interfaces. If the resolved type is still a NoOp implementation, it logs a LogCritical message. This is the production safety net — it doesn't crash the server, but it produces a visible alert in logs and monitoring dashboards that operators can act on immediately.",

      // IRequireFeature Interface
      requireFeatureInterfaceTitle: "IRequireFeature — The Opt-In Marker Interface",
      requireFeatureInterfaceIntro:
        "IRequireFeature is a zero-overhead marker interface. Commands that implement it opt into edition-based feature gating via FeatureCheckBehavior. Commands that don't implement it pass through the behavior with zero overhead. This design means feature gating is explicit and opt-in — existing commands are never accidentally gated, and new commands consciously declare their feature requirements.",

      // Event Triggers
      eventTriggersTitle: "All Commands That Publish SubscriptionChangedEvent",
      eventTriggersIntro:
        "SubscriptionChangedEvent is published by any Entitlements command or service that changes a tenant's subscription state. The following table documents every trigger point in the system. Understanding this list is essential for debugging permission sync issues — if a tenant's permissions are wrong, one of these triggers is the source of the last sync.",

      // Signup Event Chain
      signupEventChainTitle: "Signup Event Chain — Cross-Module Event Flow",
      signupEventChainIntro:
        "The signup saga crosses module boundaries via three in-process domain events. SignupPhase1CompletedEvent flows from Identity to Entitlements. SignupCheckoutCompletedEvent flows within Entitlements (Stripe webhook to activation). SubscriptionChangedEvent flows from Entitlements back to Identity. This bidirectional event chain is why signup ONLY works in monolith mode — all three events require both modules in the same process.",

      // Bundle Expansion
      bundleExpansionTitle: "Bundle Expansion — Fine-Grained Permission Grants",
      bundleExpansionIntro:
        "Bundle Expansion allows an edition to grant or deny specific permission codes beyond the module-level enablement that SubscriptionChangedEvent carries. When a subscription includes bundles, the SubscriptionChangedEvent carries pre-expanded BundleExpansionDto entries. Identity's event handler processes each bundle separately via ITenantPermissionManager.SyncBundlePermissionsAsync, which diffs grant and deny codes against the current tenant permission set.",
      bundleExpansionNote:
        "Bundle expansions are processed AFTER the main module permission sync. If a bundle's grant code conflicts with a module permission removal (i.e., the module is disabled but the bundle tries to grant a permission from it), the module revocation takes precedence. Bundle expansions cannot re-grant permissions from disabled modules.",

      // IAdminPermissionCache
      adminPermCacheTitle: "IAdminPermissionCache — The Authorization Cache",
      adminPermCacheIntro:
        "IAdminPermissionCache is the server-side Redis cache that AuthorizationBehavior uses to check permissions without hitting the database on every request. It stores a denormalized snapshot of each admin's permissions, roles, and field projections. The cache entry is populated lazily on the first request after a cache miss. InvalidateAll() is called after bulk permission sync operations (SubscriptionChangedEvent handling) to force all admins to reload on their next request.",

      // ICurrentUser
      currentUserTitle: "ICurrentUser — The Ubiquitous Cross-Cutting Interface",
      currentUserIntro:
        "ICurrentUser is the one interface that every module uses directly — it's not a cross-module bridge like the others, it's a fundamental cross-cutting concern available everywhere. It's populated by Identity's JWT middleware on every authenticated request and provides the current admin/user context to any handler in any module. Every module depends on Core.Application which defines ICurrentUser, so it's always available without any cross-module ceremony.",
      currentUserNote:
        "ICurrentUser is different from the other cross-module interfaces. It is populated by Identity middleware and consumed universally. It does NOT need a NoOp fallback — it's always implemented by the Core.Infrastructure JWT middleware regardless of which modules are loaded. It's the single exception to the NoOp pattern.",

      // Feature Resolution
      featureResolutionTitle: "Feature Value Resolution Chain",
      featureResolutionIntro:
        "When IFeatureChecker.IsEnabledAsync() is called for a tenant and feature, Entitlements resolves the value through a priority chain. TenantFeatureOverride (per-tenant manual override) always wins. If no override exists, the EditionFeature value is used. If the edition doesn't define the feature, the Feature.DefaultValue is used. For numeric features with multiple active subscriptions (trial + base plan), the MAX value wins. For boolean features, true wins. For string features, the Base subscription wins.",

      // Architecture Rules
      archRulesTitle: "Module Collaboration — Architecture Rules Summary",
      archRulesIntro:
        "These are the binding rules for all cross-module communication in SCRIPE. They are enforced by scripe arch-check (30-rule deep scan), project reference constraints in the .sln file, and code review. Violations of these rules create circular dependencies, deployment coupling, and testing impossibility.",
      doTitle: "✅ Do This",
      dontTitle: "❌ Never Do This",

      // Security Boundary
      securityBoundaryTitle: "Security Boundary Enforcement",
      securityBoundaryIntro:
        "The module isolation rules are not just an architectural preference — they are security boundaries. Cross-module isolation ensures that a bug or compromise in one module cannot directly access another module's data store. These rules are enforced at multiple levels: project reference constraints, architecture lint rules, and code review checklists.",
      archCheckCaution:
        "Run scripe arch-check before every PR that touches cross-module code. The --json flag exits with code 1 if any critical violations are found, making it suitable as a CI gate. Architecture violations are much cheaper to fix at PR review time than after a deployment.",

      // MODULE_NAME env
      moduleNameEnvTitle: "MODULE_NAME Environment Variable Reference",
      moduleNameEnvIntro:
        "The MODULE_NAME environment variable is set at container startup and determines which modules are loaded into the process. The ModuleRegistration.cs file in Host/API reads this variable and conditionally registers only the specified module's DI registrations and EF Core DbContext. When empty (the default), all modules are registered — this is the monolith mode that supports all cross-module collaboration patterns.",
    },
    crossModule: {
      title: "Cross-Module Collaboration Deep Dive",
      description:
        "How Identity and Entitlements collaborate without importing each other — via Core.Application abstractions, IRequireFeature, and AstraFlow pipeline behaviors.",
      intro:
        "SCRIPE's Identity and Entitlements modules must collaborate closely: Entitlements gates features that Identity commands consume; Identity holds the permissions that Entitlements must sync on subscription change. Yet they cannot import each other — doing so would create a circular dependency. The solution is the Core.Application layer: a neutral bridge that defines typed interface contracts both modules depend on, but neither owns.",
      bridgeTitle: "The Three-Layer Bridge",
      bridgeContent:
        "The Core.Application.Abstractions namespace is the heart of cross-module communication. It defines over 32 interface contracts. Identity.Infrastructure and Entitlements.Infrastructure each implement their respective side. AstraFlow pipeline behaviors and module handlers consume only these interfaces — never the concrete implementations. This means the system compiles and runs identically whether Entitlements is deployed or not.",
      gridCoreTitle: "Core.Application Abstractions",
      gridCoreDesc:
        "32+ typed interface contracts (IFeatureChecker, ITenantPermissionManager, ICurrentUser) that both modules depend on but neither owns.",
      gridEventsTitle: "Domain Events",
      gridEventsDesc:
        "Entities raise domain events (AdminCreatedEvent, SubscriptionChangedEvent). Other modules handle them via INotificationHandler without any direct import.",
      gridPipelineTitle: "AstraFlow Pipeline",
      gridPipelineDesc:
        "FeatureCheckBehavior and AuthorizationBehavior enforce cross-module policies automatically for every command — zero boilerplate in handlers.",
      coreAbstractionsTitle: "Core.Application Abstractions",
      coreAbstractionsContent:
        "IFeatureChecker, ITenantPermissionManager, and ITenantContext all live in Core.Application — a project that both Identity and Entitlements depend on. Neither module imports the other. Instead, both depend on this shared contract layer. Core.Infrastructure registers NoOp implementations with TryAddScoped; real module implementations override them with AddScoped.",
      requireFeatureTitle: "IRequireFeature: Feature Gating in Commands",
      requireFeatureContent:
        "Commands implement IRequireFeature to declare that they require a specific feature to be enabled for the current tenant. The FeatureCheckBehavior in the AstraFlow pipeline automatically intercepts these commands at position 4, calls IFeatureChecker.CheckQuotaAsync, and returns a Forbidden Result if the check fails — before the handler ever runs. This means zero feature-check boilerplate in any handler.",
      pipelineTitle: "AstraFlow Pipeline Execution Order",
      pipelineContent:
        "Every command and query in SCRIPE flows through 7 pipeline behaviors in strict order. The order is not arbitrary — Validation must run before Authorization (bad input should not reach auth checks), and FeatureCheck must run after Authorization (only authenticated requests should incur the feature check overhead). The Handler only runs if all 6 preceding behaviors pass.",
      eventFlowTitle: "Domain Event Flow: Cross-Module Notification",
      eventFlowContent:
        "When a command handler completes, it raises domain events via entity.AddDomainEvent(). The EF Core OutboxInterceptor captures these events in the same transaction as the entity mutation. The OutboxProcessor later dispatches them to registered INotificationHandler implementations. An Entitlements handler can subscribe to AdminCreatedEvent (raised by Identity) without Identity importing Entitlements at all.",
      realWorldTitle: "Real-World: Identity ↔ Entitlements",
      realWorldContent:
        "The following table shows who owns what in the Identity–Entitlements relationship and how the other module accesses it. No module ever accesses another module's data store directly. All access goes through the Core.Application interfaces, which are resolved by the DI container to the appropriate implementation at runtime.",
      keyInsightTip:
        "The key insight: Identity never imports Entitlements, and Entitlements never imports Identity. They only both depend on Core.Application — the neutral common ground. This enables independent deployment, isolated testing, and zero circular dependency risk.",
    },
  },
};
