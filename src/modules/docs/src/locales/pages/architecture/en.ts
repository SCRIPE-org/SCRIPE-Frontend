export const en = {
  architecture: {
    backend: {
      controllersTitle: "Controllers",
      controllerTip:
        "All controllers inherit from a base ApiController that provides standardized Result<T> response mapping. Controllers should be thin  they only validate the request model and delegate to AstraFlow mediator.",
      description:
        "Program.cs anatomy, middleware pipeline, DI service map, module registration pattern, and controller catalog.",
      diMapIntro:
        "The following table shows all major service interfaces, their implementations, lifetimes, and where they are registered. Understanding this map is essential for debugging and extending the system.",
      diMapTitle: "DI Service Map",
      intro:
        "The SCRIPE backend is a .NET 10 Modular Monolith with 30 lines in Program.cs that delegate startup configuration to dedicated extensions. This page dissects every layer of the backend architecture.",
      middlewarePipelineIntro:
        "The middleware pipeline processes every HTTP request in a specific order. Each middleware can short-circuit the pipeline (e.g., rate limiter returns 429, auth returns 401). Order matters  changing it can break security.",
      middlewarePipelineTitle: "Middleware Pipeline",
      modulePatternIntro:
        "Every new module follows the same DI registration pattern. The AddXxxModule() extension method registers the module's DbContext, repositories, services, and module registration marker.",
      modulePatternTitle: "Module Registration Pattern",
      programCsIntro:
        "Program.cs is the application's entry point and wiring center. It detects the deployment mode, registers services in a specific order, and builds the middleware pipeline. The file follows a clear 5-section structure.",
      programCsTitle: "Program.cs Anatomy",
      title: "Backend Architecture",
    },
    cqrs: {
      cachingTip:
        "Queries can use server-side caching to avoid hitting the database on every request. The cache key should include all query parameters to ensure uniqueness. Cache is automatically invalidated when related commands succeed.",
      commandExampleTitle: "Command Example",
      commandSide: "Command Side (Write)",
      description:
        "Command/Query Responsibility Segregation with AstraFlow mediator pipeline, behaviors, validation, and caching.",
      intro:
        "SCRIPE uses the CQRS (Command Query Responsibility Segregation) pattern to separate read and write operations. Commands mutate state and go through validation + audit behaviors. Queries read state and can leverage caching. AstraFlow mediator acts as the mediator between controllers and handlers.",
      pipelineTitle: "AstraFlow Mediator Pipeline",
      queryExampleTitle: "Query Example",
      querySide: "Query Side (Read)",
      title: "CQRS Pattern",
      validationBehaviorTitle: "Validation Behavior",
      whatIsCqrsIntro:
        "CQRS separates your application into two sides: Commands (writes) and Queries (reads). Each side can be optimized independently  commands focus on data integrity and validation, while queries focus on performance and caching.",
      whatIsCqrsTitle: "What is CQRS?",
    },
    cqrsPipeline: {
      behaviorOrderTip:
        "Default safety validation rejects pipeline orders where Caching runs before Validation or FeatureCheck. Override Mediator__EnforceSecurityPipelineOrder only when you fully own the risk.",
      cachingIntro:
        "The CachingBehavior intercepts queries that implement the ICacheable interface. It checks the cache for existing results before executing the handler. On cache miss, it executes the handler and stores the result with a configurable duration (default: 5 minutes).",
      cachingTitle: "CachingBehavior",
      commandMapIntro:
        "The following table lists every command, query, and validator registered in the system, organized by domain area. This is the complete CQRS surface area of SCRIPE.",
      commandMapTitle: "Command & Query Catalog",
      commandsTitle: "Commands (Write)",
      description:
        "AstraFlow mediator pipeline behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, CachingBehavior, Result pattern, and full command/query map.",
      featureCheckIntro:
        "The FeatureCheckBehavior intercepts commands that implement IRequireFeature. It checks whether the tenant's Edition allows the requested feature by calling IFeatureChecker.IsEnabledAsync. If the feature is disabled, it returns a Forbidden error without executing the handler. System-level operations (no TenantId) bypass this check.",
      featureCheckMarkerIntro:
        "Commands opt-in to feature gating by implementing the IRequireFeature interface with a RequiredFeatureName property. When the Entitlements module is not deployed, NoOpFeatureChecker returns true for all checks — making this behavior a silent pass-through.",
      featureCheckMarkerTitle: "IRequireFeature Marker",
      featureCheckTitle: "FeatureCheckBehavior",
      intro:
        "Every command and query in SCRIPE flows through a configurable AstraFlow mediator pipeline with 5 built-in behaviors: LoggingBehavior, ValidationBehavior, FeatureCheckBehavior, WebhookDispatchBehavior, and CachingBehavior. The order is managed from appsettings or environment variables and validated at startup.",
      loggingIntro:
        "The LoggingBehavior logs every AstraFlow mediator request with the user ID, tenant ID, request type, and execution time. Requests exceeding 500ms are logged as warnings for performance monitoring.",
      loggingTitle: "LoggingBehavior",
      overviewIntro:
        "The default AstraFlow mediator order is Logging -> Validation -> FeatureCheck -> WebhookDispatch -> Caching -> Handler. Validation and feature checks intentionally run before cache lookup, while cache invalidation unwinds before webhook dispatch after successful mutations.",
      overviewTitle: "Pipeline Overview",
      queriesTitle: "Queries (Read)",
      registrationIntro:
        "Pipeline behaviors are registered by AddCoreApplication() from Mediator options. Handler scanning, request coverage validation, notification failure policy, and pipeline order are controlled from configuration.",
      registrationTitle: "Pipeline Registration",
      resultPatternIntro:
        "All handlers return Result<T> instead of throwing exceptions for expected failures. Result<T> is a discriminated union with IsSuccess/IsFailure, Value (on success), and AppError (on failure). This eliminates try-catch blocks in controllers and enables pattern matching.",
      resultPatternTitle: "Result Pattern",
      separationIntro:
        "CQRS separates the application into two distinct paths: Commands (writes) mutate state and go through full validation + audit, while Queries (reads) are optimized for performance with caching and AsNoTracking.",
      separationTitle: "Command vs Query Separation",
      title: "CQRS Pipeline",
      validationIntro:
        "The ValidationBehavior runs immediately after logging. It collects all IValidator<TRequest> validators, returns structured Result failures for invalid requests, and prevents invalid requests from reaching handlers or caches.",
      validationTitle: "ValidationBehavior",
      validatorExampleTitle: "Validator Examples",
    },
    dataFlow: {
      backendPipelineIntro:
        "Every backend request passes through 10 middleware components and 4 AstraFlow mediator pipeline behaviors before reaching the handler. This ensures consistent logging, authentication, authorization, validation, feature gating, and auditing.",
      backendPipelineTitle: "Backend Request Pipeline",
      cacheTip:
        "Set staleTime to 5 minutes for data that changes infrequently (roles, permissions). Use 0 for data that changes often (audit logs, notifications). Always invalidate related queries after successful mutations.",
      cachingFlowIntro:
        "The backend uses a two-level caching strategy: L1 (in-process IMemoryCache) and L2 (distributed Redis). The frontend uses TanStack Query's built-in cache with configurable staleTime.",
      cachingFlowTitle: "Caching Strategy",
      description:
        "End-to-end data flow diagrams  query, mutation, backend pipeline, error handling, and caching strategy.",
      errorFlowIntro:
        "Errors are handled at multiple levels. Each error source has a specific handler, response code, and frontend handling strategy.",
      errorFlowTitle: "Error Handling",
      intro:
        "Understanding how data flows through SCRIPE is essential for debugging and extending the system. This page traces data from a button click in the UI all the way to the database and back.",
      mutationFlowTitle: "Mutation Flow (Write)",
      queryFlowIntro:
        "When a user views data (e.g., opening the Users page), the flow starts at the View, goes through the ViewModel, TanStack Query, Repository, API Service, and finally the backend API.",
      queryFlowTitle: "Query Flow (Read)",
      title: "Data Flow",
    },
    dependencyInjection: {
      architectureIntro:
        "Program.cs follows a strict 4-phase registration order: (1) Core Infrastructure — cache, blob storage, audit, etc. (2) CORS & Rate Limiting. (3) Modules — each module registers its own DbContext, repositories, and services. (4) Application Layer — AstraFlow mediator, behaviors, validators.",
      architectureTitle: "DI Registration Architecture",
      bestPracticesTitle: "DI Best Practices",
      captiveTip:
        "A captive dependency occurs when a Singleton service injects a Scoped service — the Scoped service becomes a de-facto Singleton, causing stale data and memory leaks. Use IServiceScopeFactory to create a new scope inside Singleton services when you need Scoped dependencies.",
      controllerProviderIntro:
        "The ModuleControllerFeatureProvider filters which controllers are loaded at startup based on the MODULE_NAME. In monolith mode, all controllers are loaded. In microservice mode, only controllers tagged with the matching [BelongsToModule] attribute are loaded.",
      controllerProviderTitle: "Module Controller Feature Provider",
      coreServicesIntro:
        "The following services are registered by AddCoreInfrastructure() and are available to all modules. They provide cross-cutting concerns like caching, file storage, auditing, email, webhooks, and data scoping.",
      coreServicesTitle: "Core Infrastructure Services",
      description:
        "Program.cs registration flow, module DI pattern, service discovery, core + identity service maps, lifetime rules, and YARP gateway.",
      gatewayIntro:
        "When MODULE_NAME=Gateway, the application acts as a YARP reverse proxy. It routes requests to backend microservices based on URL path prefix matching. The gateway handles SSL termination, request buffering, and can be extended with custom middleware.",
      gatewayTitle: "YARP Gateway Configuration",
      identityModuleIntro:
        "The Identity module registers 24 repository interfaces and 10 service interfaces. All repositories are registered as Scoped (one instance per HTTP request) to match the DbContext lifetime.",
      identityModuleTitle: "Identity Module Services",
      intro:
        "SCRIPE uses .NET's built-in Dependency Injection container with a structured registration pattern. Program.cs orchestrates all registrations: core infrastructure first, then modules conditionally based on MODULE_NAME, and finally the application layer with AstraFlow mediator. This page documents every service registration, lifetime decision, and the module DI pattern.",
      lifetimeTitle: "Service Lifetime Rules",
      moduleRegIntro:
        "Each module exposes an AddXxxModule() extension method that registers all its services. The MODULE_NAME environment variable controls which modules are loaded: empty = monolith (all modules), 'Identity' = only Identity module, 'Gateway' = API gateway mode.",
      moduleRegTitle: "Module Registration Pattern",
      monolithNote:
        "In monolith mode (MODULE_NAME not set), ALL modules are loaded into a single process. In microservice mode, each module runs as an independent process with its own port. The same codebase supports both deployment models.",
      scopedTitle: "Scoped Lifetime",
      serviceDiscoveryIntro:
        "In microservice mode, services need to discover each other's URLs. SCRIPE uses configuration-based service discovery (from appsettings.json) to resolve service names to URLs.",
      serviceDiscoveryTitle: "Service Discovery",
      singletonTitle: "Singleton Lifetime",
      title: "Dependency Injection",
    },
    domainEvents: {
      architectureSummaryTitle: "Outbox Architecture Summary",
      customEventsIntro:
        "Follow these 3 steps to add a new domain event to SCRIPE. The outbox infrastructure handles persistence and delivery automatically.",
      customEventsTitle: "Creating Custom Domain Events",
      description:
        "IDomainEvent interface, outbox pattern, OutboxInterceptor, OutboxProcessor, and reliable event delivery.",
      interfaceIntro:
        "All domain events implement the IDomainEvent interface, which inherits from AstraFlow mediator's INotification. This enables in-process pub/sub where multiple handlers can subscribe to the same event type. Each event carries a unique EventId and OccurredAt timestamp.",
      interfaceTitle: "IDomainEvent Interface",
      intro:
        "Domain events represent significant occurrences in the business domain. SCRIPE uses the Outbox Pattern to guarantee reliable event delivery — events are persisted in the same database transaction as entity changes and published asynchronously by a background processor.",
      outboxCleanupIntro:
        "A background recurring job (e.g., via Hangfire) runs daily at 2:00 AM UTC to delete processed outbox messages older than 7 days. This prevents unbounded table growth while keeping recent messages for debugging.",
      outboxCleanupTitle: "Outbox Cleanup Job",
      outboxInterceptorIntro:
        "The OutboxInterceptor is an EF Core SaveChanges interceptor that runs BEFORE the transaction is committed. It collects all domain events from tracked entities, serializes them as OutboxMessage records, and adds them to the same database context — ensuring atomicity.",
      outboxInterceptorTitle: "OutboxInterceptor",
      outboxIntro:
        "The Outbox Pattern solves the dual-write problem: how to atomically update the database AND publish an event. By persisting events in the same transaction as entity changes, we guarantee that events are never lost — even if the application crashes immediately after SaveChanges.",
      outboxMessageTitle: "OutboxMessage Entity",
      outboxProcessorIntro:
        "The OutboxProcessor is a BackgroundService that polls the OutboxMessage table every 5 seconds for unprocessed messages. It processes them in batches of 20, deserializing each event and publishing it via AstraFlow mediator. Failed events are retried with an incrementing RetryCount.",
      outboxProcessorTitle: "OutboxProcessor",
      outboxTitle: "Outbox Pattern",
      outboxWarning:
        "The Outbox Pattern provides at-least-once delivery, not exactly-once. Event handlers must be idempotent — they should produce the same result whether invoked once or multiple times with the same event.",
      publisherTitle: "IDomainEventPublisher",
      publishingIntro:
        "Domain events follow a 6-step lifecycle: the entity raises an event via RaiseDomainEvent(), the OutboxInterceptor captures it during SaveChanges, the event is persisted as an OutboxMessage in the same transaction, the OutboxProcessor polls for unprocessed messages, deserializes the event, and publishes it via AstraFlow mediator.",
      publishingTitle: "Publishing & Handling Flow",
      reliabilityTitle: "Reliability Guarantees",
      step1Content:
        "Create a record implementing IDomainEvent in the module's Domain/Events/ directory. Include all contextual data that handlers will need.",
      step1Title: "1. Define the Event",
      step2Content:
        "Call entity.RaiseDomainEvent(new YourEvent(...)) in the command handler, then call SaveChangesAsync. The OutboxInterceptor captures the event automatically.",
      step2Title: "2. Raise from Command Handler",
      step3Content:
        "Implement INotificationHandler<DomainEventNotification> to react to the event. Multiple handlers can subscribe to the same event for different side-effects (email, audit, webhook, etc.).",
      step3Title: "3. Create Event Handlers",
      title: "Domain Events",
      withOutboxTitle: "✅ With Outbox Pattern",
      withoutOutboxTitle: "❌ Without Outbox Pattern",
    },
    domainModel: {
      auditableEntityIntro:
        "AuditableEntity adds 7 audit and soft-delete fields to the base Entity. These fields are automatically populated by the AuditableEntityInterceptor during SaveChanges — you never set them manually in your code.",
      auditableEntityTitle: "AuditableEntity",
      bestPracticesTitle: "Best Practices",
      concreteEntitiesTitle: "Concrete Entity Registry",
      description:
        "Entity inheritance hierarchy, AuditableEntity, ITenantAwareEntity, soft-delete lifecycle, repository abstractions, and global query filters.",
      dontTitle: "❌ DON'T",
      doTitle: "✅ DO",
      entityBaseIntro:
        "The Entity<TId> base class provides identity equality (two entities are equal if they share the same Id), hash code generation, and domain event support. Every entity can raise domain events that are captured by the OutboxInterceptor and published asynchronously.",
      entityBaseTitle: "Entity<TId> Base Class",
      entityDomainEventNote:
        "Domain events raised via RaiseDomainEvent() are collected by the OutboxInterceptor during SaveChanges and persisted in the same transaction. They are later published asynchronously by the OutboxProcessor background service.",
      entityHierarchyIntro:
        "All domain entities follow a three-level inheritance chain: IEntity (marker interface) → Entity<TId> (identity + equality + domain events) → AuditableEntity (audit fields + soft-delete). Entities that belong to a specific tenant also implement the ITenantAwareEntity interface.",
      entityHierarchyTitle: "Entity Inheritance Hierarchy",
      ientityTitle: "IEntity Interface",
      ignoreFiltersTip:
        "Use IgnoreQueryFilters() only in RecycleBin operations (to see soft-deleted items) and SuperAdmin cross-tenant queries. Always pair it with an explicit tenant filter to prevent data leaks.",
      intro:
        "SCRIPE's domain model follows a strict inheritance hierarchy where all business entities inherit from AuditableEntity, which provides audit fields (CreatedBy, CreatedAt, ModifiedBy, ModifiedAt) and soft-delete support (IsDeleted, DeletedAt, DeletedBy). Tenant-scoped entities additionally implement ITenantAwareEntity for automatic row-level isolation.",
      queryFiltersIntro:
        "EF Core global query filters are applied to every entity that inherits from AuditableEntity (soft-delete filter) and implements ITenantAwareEntity (tenant isolation filter). These filters are registered once in OnModelCreating and apply to every LINQ query automatically.",
      queryFiltersTitle: "Global Query Filters",
      repositoryIntro:
        "SCRIPE defines three repository interfaces in the Domain layer: IReadRepository<T> for queries, IWriteRepository<T> for mutations, and IRepository<T> that combines both with a SaveChangesAsync method. All repository implementations live in the Infrastructure layer.",
      repositoryTitle: "Repository Abstractions",
      softDeleteIntro:
        "All entities use soft-delete via the IsDeleted flag. When a DELETE endpoint is called, the AuditableEntityInterceptor converts the hard delete into a soft-delete by setting IsDeleted=true, DeletedAt, and DeletedBy. The entity remains in the database but is hidden from normal queries by the global query filter.",
      softDeleteTitle: "Soft-Delete Lifecycle",
      tenantAwareIntro:
        "Entities that implement ITenantAwareEntity are automatically scoped to the current tenant via EF Core global query filters. The TenantId is set by the TenantContextMiddleware when the entity is created, and all subsequent queries are automatically filtered by tenant.",
      tenantAwareTitle: "ITenantAwareEntity",
      tenantIsolationWarning:
        "Never bypass tenant isolation without explicit authorization. Using IgnoreQueryFilters() removes ALL filters including tenant scoping. Always add a manual .Where(e => e.TenantId == tenantId) when bypassing filters.",
      title: "Domain Model",
    },
    frontend: {
      connectorPatternIntro:
        "The connector pattern separates Next.js App Router pages (Server Components) from module Views (Client Components). Pages in src/app/ are thin connectors that import and render module Views. They handle routing, metadata, and URL params only.",
      connectorPatternTitle: "Connector Pattern",
      connectorWarning:
        "NEVER put business logic, data fetching, forms, or state management in src/app/ files. These are Server Components that only connect routes to module Views.",
      description:
        "SOLID View/ViewModel pattern, module structure, and the connector pattern for Next.js integration.",
      intro:
        "The SCRIPE frontend is built with Next.js 16 (App Router) following a strict SOLID View/ViewModel pattern. Every page is composed of a pure UI View that delegates all logic to ViewModel hooks. This separation ensures testability, reusability, and maintainability.",
      moduleStructureTitle: "Module File Structure",
      solidPatternIntro:
        "The SOLID pattern ensures each piece of the UI has a single responsibility. Views render JSX, ViewModels manage state and logic, and Components provide reusable UI sections.",
      solidPatternTitle: "SOLID View/ViewModel Pattern",
      title: "Frontend Architecture",
      viewDo: " View SHOULD",
      viewDont: " View SHOULD NOT",
      viewExampleTitle: "View Example",
      viewModelRulesIntro:
        "ViewModels are React hooks that contain all business logic. They compose section-specific ViewModels (statistics, filters, table) and return typed interfaces consumed by Views.",
      viewModelRulesTitle: "ViewModel Rules",
      viewRulesTitle: "View Rules",
    },
    modules: {
      allowedImportsTitle: " Allowed Imports",
      backendModuleIntro:
        "Every backend module follows DDD (Domain-Driven Design) with three projects: Domain, Application, and Infrastructure. The Domain is pure C# with no external dependencies.",
      backendModuleTitle: "Backend Module Template",
      boundaryWarning:
        "Module boundaries are absolute law. If you need to share code between modules, it MUST go in @core/. Any import from @modules/{other}/ is a violation and will be caught in code review.",
      communicationTitle: "Cross-Module Communication Patterns",
      description:
        "Module isolation rules, backend/frontend templates, module registry, and cross-module communication.",
      forbiddenImportsTitle: " Forbidden Imports",
      frontendModuleTitle: "Frontend Module Template",
      intro:
        "SCRIPE uses a strict module system where each module is an isolated island with clear boundaries. Modules cannot import from each other  they communicate only through URLs, shared IDs, or the core event bus. This ensures independence, testability, and the ability to extract modules to separate repositories.",
      isolationRulesTitle: "Module Isolation Rules",
      pattern1Content:
        "Navigate to another module's page via standard URL links. No imports needed.",
      pattern1Title: "Pattern 1: URL Navigation",
      pattern2Content: "Store only the foreign module's entity ID. Never embed the whole entity.",
      pattern2Title: "Pattern 2: Shared IDs Only",
      pattern3Content:
        "Publish and subscribe to events through a shared event bus in @core/. Future pattern  not yet implemented.",
      pattern3Title: "Pattern 3: Core Event Bus",
      registryIntro:
        "The module registry tracks all active modules at runtime. It is populated during application startup when each module's IModuleRegistration implementation is resolved and registered.",
      registryTitle: "Module Registry",
      title: "Module System",
    },
    overview: {
      backendArchIntro:
        "The backend follows a request pipeline architecture where every HTTP request flows through middleware, controllers, AstraFlow mediator behaviors, and finally the CQRS handler. This ensures consistent validation, auditing, and error handling.",
      backendArchTitle: "Backend Architecture",
      communicationPatternsTitle: "Cross-Module Communication",
      crossModuleNote:
        "The Event Bus pattern is planned for future releases. Currently, modules communicate exclusively through URL navigation and shared IDs.",
      description:
        "Clean Architecture layers, backend pipeline, frontend SOLID flow, and module boundary rules.",
      frontendArchIntro:
        "The frontend uses a SOLID View/ViewModel pattern where Views are pure UI (no state, no logic) and ViewModels contain all business logic. The connector pattern separates Next.js routing (Server Components) from application logic (Client Components).",
      frontendArchTitle: "Frontend Architecture",
      intro:
        "SCRIPE follows a strict Clean Architecture with four layers: Presentation, Application, Domain, and Infrastructure. The dependency rule ensures inner layers never depend on outer layers. This architecture is applied consistently across both backend (.NET) and frontend (Next.js).",
      layersTitle: "Clean Architecture Layers",
      moduleBoundariesIntro:
        "Modules are isolated islands. They cannot import from each other. This enables independent development, isolated failures, and the ability to extract modules to separate repositories.",
      moduleBoundariesTitle: "Module Boundaries",
      title: "Architecture Overview",
      withBoundaries: " With Module Boundaries",
      withoutBoundaries: " Without Module Boundaries",
    },
    solidPattern: {
      antiPatternWarning:
        "Anti-pattern: Putting useState, useEffect, or useQuery directly in a View component. ALL state and logic must live in ViewModels. Views are pure UI composition only.",
      description:
        "Page type scenarios  CRUD lists, dashboards, profiles, settings, wizards, and report builders.",
      intro:
        "The SOLID View/ViewModel pattern is mandatory for all pages in src/modules/. This guide covers 7 page type scenarios with their exact directory structures, ViewModel patterns, and code examples.",
      principlesTitle: "SOLID Principles Applied",
      rulesTitle: "Golden Rules",
      scenario1Intro:
        "Use for managing entity collections (Users, Products, Orders). The orchestrator composes statistics, filters, and table ViewModels.",
      scenario1Title: "Scenario 1: CRUD List Page",
      scenario2Intro:
        "Use for KPIs, charts, and metrics. Each chart or card section gets its own ViewModel with period selection and data transformation.",
      scenario2Title: "Scenario 2: Dashboard / Analytics",
      scenario3Intro:
        "Use for viewing a single entity with tabs and sections. The orchestrator fetches the main entity and composes tab ViewModels.",
      scenario3Title: "Scenario 3: Detail / Profile Page",
      scenario4Intro:
        "Use for multiple independently-saveable form sections. Each settings section gets its own ViewModel with form state and save mutation.",
      scenario4Title: "Scenario 4: Settings Page",
      scenario5Intro:
        "Use for complex multi-step flows like onboarding or checkout. The wizard ViewModel coordinates step navigation, validation gates, and combined submission.",
      scenario5Title: "Scenario 5: Wizard / Multi-Step Form",
      scenariosIntro:
        "Choose the scenario that matches your page type. Each provides a tried-and-tested structure that ensures consistency across the entire application.",
      scenariosTitle: "Page Type Scenarios",
      title: "SOLID View/ViewModel",
    },
    stateManagement: {
      antiPatternsTitle: "Anti-Patterns",
      decisionTitle: "Decision Matrix",
      description:
        "TanStack Query for server state, Zustand for global UI state, and LanguageProvider for localization.",
      dontTitle: " DON'T",
      doTitle: " DO",
      intro:
        "SCRIPE uses three state management tools, each for a specific category: TanStack Query for server data (API results), Zustand for global UI state (auth, sidebar, theme), and useState for component-local state (forms, toggles).",
      localizationIntro:
        "Localization uses a custom LanguageProvider with localStorage persistence plus a module-scoped locale system. Shared keys (~1,156) live in core/locales/. Module-specific keys are co-located in each module's locales/ directory and eagerly imported at build time via module-registry.ts for zero-flash page loads.",
      localizationTitle: "Localization (LanguageProvider + Module Locales)",
      noLocaleFoldersWarning:
        "Do NOT use [locale] folders in src/app/! Localization is handled via LanguageProvider context, not file-based routing. No next-intl, no next-i18next, no URL-based language (/en/, /ar/).",
      tanstackIntro:
        "Use TanStack Query for any data that comes from the API. It handles caching, background refetching, pagination, optimistic updates, and request deduplication automatically.",
      tanstackTitle: "TanStack Query (Server State)",
      title: "State Management",
      zustandIntro:
        "Use Zustand for global UI state that needs to be shared across components but doesn't come from the server. There are exactly 3 approved stores.",
      zustandTitle: "Zustand (Global UI State)",
    },
  },
};
