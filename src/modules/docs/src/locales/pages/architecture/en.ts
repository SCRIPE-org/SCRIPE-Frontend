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
  },
};
