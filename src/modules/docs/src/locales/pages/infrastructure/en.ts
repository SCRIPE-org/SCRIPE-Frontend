/**
 * Docs page locale — EN
 * Auto-generated from monolithic doc locale. Do not edit the generation source.
 */
export const en = {
  infrastructure: {
    backgroundJobs: {
      title: "Background Jobs",
      description:
        "Provider-agnostic auto-discovered recurring jobs (Native, Hangfire, Quartz.NET) — 31 jobs across 6 modules, zero manual wiring.",
      intro:
        "SCRIPE's background job system is built on one principle: write once, run on any provider. Every job implements IAutoRegisteredJob and is discovered automatically at startup. Switching between Native, Hangfire, or Quartz is a single config change in appsettings.json — no code modifications required.",

      // Architecture
      architectureTitle: "Architecture Overview",
      architectureIntro:
        "At startup, BackgroundJobsConfiguration reads the active provider from appsettings.json and calls GetServices<IAutoRegisteredJob>() to discover every registered job from the DI container. For each job, it checks for a per-job appsettings override, resolves Enabled and CronExpression, then schedules the job with the provider API. The job itself has zero provider-specific code.",
      architectureFlowTitle: "Auto-Discovery Pipeline",

      // IAutoRegisteredJob Contract
      nodeConfig: "appsettings.json\nProvider + Per-Job Overrides",
      descConfig: "Provider: Native | Hangfire | Quartz\nJobs: { id: { Enabled, CronExpression } }",
      nodeStartup: "BackgroundJobsConfiguration\nAddBackgroundJobsConfiguration()",
      descStartup: "Reads provider, discovers all jobs, schedules them",
      nodeDiscovery: "Auto-Discovery Loop\nGetServices<IAutoRegisteredJob>()",
      descDiscovery: "Scans DI container for every registered IAutoRegisteredJob",
      nodeSchedule: "Schedule Each Job\nIf Enabled -> Register with provider API",
      descSchedule: "Uses CronExpression from appsettings override or job default",
      nodeExecute: "job.ExecuteAsync(ct)\nAt every cron tick",
      descExecute: "Provider-agnostic - job has zero knowledge of which provider runs it",
      conn1: "drives",
      conn2: "triggers",
      conn3: "for each job",
      conn4: "on cron tick",
      contractTitle: "IAutoRegisteredJob Contract",
      contractIntro:
        "Every recurring background job in SCRIPE implements one interface: IAutoRegisteredJob. This is the complete contract — three properties and one method. The interface deliberately excludes any provider-specific concepts (no Hangfire attributes, no Quartz annotations). The job has zero knowledge of which provider executes it.",

      // DI Registration
      diTitle: "DI Registration — The Critical Two-Line Pattern",
      diIntro:
        "Every job requires exactly two DI registrations in its module's DependencyInjection.cs. Skipping the second line renders the job completely invisible to all providers — it will never be discovered or scheduled, with no error or warning.",
      diWarningTitle: "Never Skip Line 2",
      diWarning:
        "The IAutoRegisteredJob factory delegate (line 2) is what makes auto-discovery work. GetServices<IAutoRegisteredJob>() only returns jobs registered AS IAutoRegisteredJob. A job registered only by its concrete type is invisible to all three providers. This is the most common mistake when adding a new job.",

      // Class Hierarchy
      hierarchyTitle: "Class Hierarchy — Choose Your Base",
      hierarchyIntro:
        "Three options exist depending on how much structure you need. Lightweight jobs implement IAutoRegisteredJob directly. Jobs that need structured timing logs extend RecurringJobBase. Jobs that clean up soft-deleted entities extend SoftDeleteCleanupJob<TContext>, which auto-discovers ISoftDeletable entities and sorts them topologically by FK order.",
      hierarchyColClass: "Class",
      hierarchyColUseWhen: "Use When",
      hierarchyColGets: "Gets You",
      hierarchyRow1When: "Job is simple, minimal boilerplate needed",
      hierarchyRow1Gets: "Just the contract — full control, zero extras",
      hierarchyRow2When: "You want timing, error logging, structured output",
      hierarchyRow2Gets: "Auto start/complete/error logging with elapsed time",
      hierarchyRow3When: "Module needs a soft-delete permanent-cleanup job",
      hierarchyRow3Gets: "Auto entity discovery, FK-ordered deletion, batch processing",

      // Providers
      providersTitle: "Provider Comparison",
      providersIntro:
        "All three providers use the exact same IAutoRegisteredJob interface. The only difference is how they schedule and persist jobs. Configure the provider in appsettings.json — no code changes required to switch.",
      providerColFeature: "Feature",
      providerColNative: "Native",
      providerColHangfire: "Hangfire",
      providerColQuartz: "Quartz",
      providerRowPersistence: "Job Persistence",
      providerNativeNo: "In-memory only — lost on restart",
      providerHangfireYes: "SQL-backed — survives restarts",
      providerQuartzOptional: "In-memory (DB store optional)",
      providerRowDashboard: "Dashboard",
      providerNativeDash: "None",
      providerHangfireDash: "/hangfire (SuperAdmin only)",
      providerQuartzDash: "None (Quartz.UI available separately)",
      providerRowRetry: "Auto Retry",
      providerNativeRetry: "No",
      providerHangfireRetry: "Yes (configurable attempts)",
      providerQuartzRetry: "Yes (via misfire policy)",
      providerRowBestFor: "Best For",
      providerNativeBest: "Local development, unit testing",
      providerHangfireBest: "Production with SQL Server",
      providerQuartzBest: "Production with Oracle or PostgreSQL",

      // Jobs Inventory
      inventoryTitle: "Complete Jobs Inventory — 33 Jobs",
      inventoryIntro:
        "All 33 recurring background jobs across the six modules. Every job implements IAutoRegisteredJob. The Default Cron can be overridden per-environment in appsettings.json under BackgroundJobs.Jobs.",
      inventoryColPurpose: "Purpose",
      inventoryCoreTitle: "Core Module (5 jobs)",
      inventoryIdentityTitle: "Identity Module (2 jobs)",
      inventoryEntitlementsTitle: "Entitlements Module (12 jobs)",
      inventoryComplianceTitle: "Compliance Module (7 jobs)",
      inventoryPluginsTitle: "Plugins Module (3 jobs)",
      inventoryMarketplaceTitle: "Marketplace Module (4 jobs)",

      // Job purpose descriptions
      jobOutboxProcessor: "Processes pending outbox messages and dispatches them to AstraFlow",
      jobOutboxCleanup: "Deletes processed outbox messages older than 7 days",
      jobIdentitySoftDelete:
        "Permanently deletes soft-deleted Identity entities after retention period",
      jobAuthSessionCleanup: "Cleans up expired auth sessions, refresh tokens, and temporary login codes",
      jobEmailProcessing: "Polls and dispatches deferred emails via EmailJobProcessor",
      jobWebhookRetry: "Processes persistent webhook retry queue in batches of 50",
      jobWebhookLogCleanup: "Deletes webhook delivery logs older than 90 days",
      identityNote:
        "EmailProcessingJob and WebhookRetryJob/WebhookLogCleanupJob are core infrastructure jobs registered in the Identity module's DI because they depend on Identity-scoped services (IUnitOfWork, IWebhookRepository, EmailJobProcessor).",
      jobEntitlementsSoftDelete:
        "Permanently deletes soft-deleted Entitlements entities after retention period",
      jobSubscriptionReconciliation:
        "Expires trials, renews active subscriptions, handles grace periods",
      jobTrialNotification: "Sends reminders for trials expiring in 7, 3, or 1 day",
      jobDunningNotification: "Payment failure notices with escalating urgency",
      jobEditionRollout: "Applies scheduled edition upgrades and downgrades",
      jobUserSubscriptionReconciliation: "Tier 2 user-level subscription reconciliation",
      jobAnalyticsSnapshot: "Daily revenue/MRR/ARR snapshot aggregation",
      jobTenantHealthScore: "Recalculates health score for all active tenants",
      jobAnalyticsReport: "Weekly analytics report generation",
      jobCommissionInvoicing: "Monthly commission invoice rollup",
      jobCommissionAutoCharge: "Retries failed commission auto-charges",
      jobPaymobRecurringBilling: "Paymob card-on-file recurring charges",
      jobComplianceSoftDelete:
        "Permanently deletes soft-deleted Compliance entities after retention period",
      jobDsrExecution: "Executes pending Data Subject Requests every 5 minutes",
      jobDsrEscalation: "Escalates DSRs approaching their SLA deadline",
      jobDsrExportCleanup: "Deletes expired DSR export files",
      jobRetentionEnforcement: "Enforces data retention policies (runs every Sunday at 1:00 AM)",
      jobConsentExpiry: "Expires lapsed user consents (runs at midnight daily)",
      jobReportGeneration: "Polls and generates pending compliance reports every 2 minutes",
      jobPluginsSoftDelete: "Permanently deletes soft-deleted Plugins, Definitions, and Execution Logs after retention period",
      jobPluginHealthCheck: "Polls active plugin sandbox environments and reports health status",
      jobPluginDataCleanup: "Prunes expired temporary database storage keys created by plugins",
      jobMarketplaceSoftDelete: "Permanently deletes soft-deleted Listings, Submissions, Profiles, and Reviews after retention period",
      jobPayoutBatch: "Assembles pending earnings into batch transfers and executes payouts via Stripe Connect",
      jobStaleSubmissionReminder: "Scans for app submissions pending review for >7 days and alerts admins",
      jobInstallCountAggregation: "Aggregates transient installation counts into static app listings counters",

      // Creating a New Job
      newJobTitle: "Creating a New Background Job",
      newJobIntro:
        "Follow these four steps exactly. The only mandatory files are the job class itself and the two DI registration lines. Everything else is auto-wired by the discovery engine.",
      newJobStep1Title: "Step 1 — Create the Job Class",
      newJobStep1Desc:
        "Create a new file in {Module}.Infrastructure/BackgroundJobs/. One class per file. Use JobId convention: '{module}-{purpose}' in kebab-case. Implement ExecuteAsync as an idempotent operation — it must be safe to call multiple times.",
      newJobStep2Title: "Step 2 — Register BOTH DI Lines",
      newJobStep2Desc:
        "In the module's DependencyInjection.cs, add exactly two registrations. Line 1 enables constructor injection. Line 2 enables auto-discovery via GetServices<IAutoRegisteredJob>(). Never skip line 2 — missing it means the job is invisible to all providers.",
      newJobStep3Title: "Step 3 — Add appsettings Override (Optional)",
      newJobStep3Desc:
        "If you want environment-specific schedule or want to disable the job in certain environments, add an override under BackgroundJobs.Jobs using the JobId as the key. This is completely optional — the job's default CronExpression and Enabled=true will be used if no override exists.",
      newJobStep4Title: "Step 4 — Build and Verify",
      newJobStep4Desc:
        "Run the backend build. Zero errors means the job is ready. Auto-discovery handles the rest — no changes to BackgroundJobsConfiguration.cs, no changes to any host extension, no manual registration anywhere.",

      // SoftDelete
      softDeleteTitle: "SoftDeleteCleanupJob — Auto FK-Ordered Deletion",
      softDeleteIntro:
        "The SoftDeleteCleanupJob<TContext> base class is the most sophisticated option. It automatically discovers all ISoftDeletable entity types in the DbContext, sorts them topologically based on FK relationships (children before parents), and batch-deletes records that have passed the retention period. Override PreCleanupAsync to unlock guardian-protected entities before deletion, or GetCustomCleanupOrder() to specify explicit entity ordering.",
      softDeleteTip:
        "The CLI command 'scripe add-bg-service {Module}' generates the job file and adds both DI registrations in one step. It is the recommended way to add a SoftDeleteCleanupJob.",
      softDeleteFlowTitle: "Soft Delete Execution Flow",
      flowCronLabel: "Cron Tick (3:00 AM)",
      flowCronDesc: "Default cron for Soft Delete jobs",
      flowInitLabel: "SoftDeleteCleanupJob<TContext>",
      flowInitDesc: "Instantiated by DI container",
      flowScanLabel: "Discover ISoftDeletable",
      flowScanDesc: "Reflection scan on DbContext for entities implementing ISoftDeletable",
      flowFilterLabel: "Filter Expired Entities",
      flowFilterDesc:
        "Find records where IsDeleted = true AND DeletedAt < DateTime.UtcNow.AddDays(-30)",
      flowCascadeLabel: "FK-Aware Cascading",
      flowCascadeDesc: "Handles foreign key constraints in correct deletion order",
      flowExecuteLabel: "Hard Delete",
      flowExecuteDesc: "Execute native SQL for bulk deletion, bypassing EF change tracking",
      connTriggers: "triggers",
      connStarts: "starts",
      connBuilds: "builds query",
      connOrders: "orders",
      connRemoves: "removes",

      // Rules
      rulesTitle: "Rules",
      rulesMustTitle: "✅ Must Do",
      rulesNeverTitle: "❌ Never Do",
      ruleMust1: "One class per file in BackgroundJobs/ folder",
      ruleMust2: "Register BOTH DI lines (concrete + factory delegate)",
      ruleMust3: "Use 5-field CRON (not 6-field Quartz format)",
      ruleMust4: "Make ExecuteAsync idempotent",
      ruleMust5: "Build after every change — scripe build backend",
      ruleNever1: "Never import Hangfire or Quartz namespaces in job classes",
      ruleNever2: "Never use [AutomaticRetry] — global retry is in BackgroundJobsConfiguration",
      ruleNever3: "Never call RecurringJob.AddOrUpdate<T>() in module code",
      ruleNever4: "Never put jobs in Services/ or any other folder",
      ruleNever5: "Never register as Singleton — always AddScoped",

      tenantWarning:
        "Background jobs run outside of HTTP request context — there is no tenant context available. Jobs that process tenant-specific data must create explicit tenant scope per operation using IServiceScopeFactory. Never assume HttpContext is available inside a background job.",
    },
    fileStorage: {
      title: "File Storage",
      description:
        "Strategy pattern with 4 providers (Local, Azure Blob, AWS S3, MinIO) with tenant-scoped directories.",
      intro:
        "SCRIPE uses the Strategy pattern for file storage, allowing seamless switching between local filesystem, Azure Blob Storage, AWS S3, and MinIO. All storage is tenant-scoped with configurable directories.",
      architectureTitle: "Storage Architecture",
      providersTitle: "Storage Providers",
      validationTitle: "File Validation",
      tenantScopingTitle: "Tenant-Scoped Storage",
      configTitle: "Configuration",
    },
    resilience: {
      title: "Resilience Patterns",
      description:
        "Polly-based retry, circuit breaker, and timeout policies for HTTP clients and external services.",
      intro:
        "SCRIPE uses Polly resilience policies for all external HTTP calls and service integrations. The three core policies  retry with exponential backoff, circuit breaker, and timeout  protect against transient failures and cascading outages.",
      architectureTitle: "Resilience Architecture",
      retryTitle: "Retry Policy",
      circuitBreakerTitle: "Circuit Breaker",
      circuitBreakerIntro:
        "The circuit breaker prevents repeated calls to a failing service. After 5 consecutive failures, it opens and rejects requests for 30 seconds, then transitions to half-open to test if the service has recovered.",
      timeoutTitle: "Timeout Policy",
      usageTitle: "Usage in HttpClient",
      configTitle: "Configuration",
    },
    gatewayDeployment: {
      title: "Gateway & Deployment",
      description:
        "YARP reverse proxy gateway, module system, IIS deployment, and Kestrel configuration.",
      intro:
        "SCRIPE uses YARP (Yet Another Reverse Proxy) as an API gateway that routes requests to backend modules. The MODULE_NAME environment variable controls which modules are active, enabling monolith, microservice, or hybrid deployment.",
      yarpTitle: "YARP Gateway",
      yarpIntro:
        "YARP routes incoming API requests to the appropriate backend module based on URL path prefix matching. The gateway handles SSL termination, request buffering, and load balancing.",
      moduleTitle: "Module System",
      moduleIntro:
        "The MODULE_NAME environment variable determines which backend modules are loaded at startup. Setting it to 'all' loads all modules as a monolith. Setting it to a specific module name (e.g., 'identity') loads only that module for microservice deployment.",
      modesTitle: "Deployment Modes",
      monolithTitle: "Monolith Mode",
      microservicesTitle: "Microservices Mode",
      portNote:
        "Each module instance listens on a different port in microservices mode. The YARP gateway routes to the correct port based on the module name.",
      iisTitle: "IIS Deployment",
      iisStep1Title: "1. Publish the Application",
      iisStep1Desc: "Run dotnet publish to create the deployment package with all dependencies.",
      iisStep2Title: "2. Configure IIS Site",
      iisStep2Desc: "Create an IIS website pointing to the publish output directory.",
      iisStep3Title: "3. Set Environment Variables",
      iisStep3Desc: "Configure MODULE_NAME and connection strings in the IIS application settings.",
      iisStep4Title: "4. Configure App Pool",
      iisStep4Desc:
        "Set the application pool to 'No Managed Code' for ASP.NET Core out-of-process hosting.",
      kestrelTitle: "Kestrel Configuration",
    },
    databaseMigrations: {
      title: "Enterprise Database Migrations",
      description:
        "Auto-adaptive EF Core multi-database architecture supporting SQL Server, Oracle, and PostgreSQL.",
      intro:
        "SCRIPE employs a highly sophisticated, multi-provider database architecture. Rather than relying on a single monolith `DbContext` that behaves erratically across different SQL dialects, the platform utilizes strictly typed **Derived DbContexts**. This completely isolates `ModelSnapshot` files per database provider, allowing infinite scalability without EF Core migration collisions.",
      architectureTitle: "Derived DbContext Topology",
      architectureContent:
        "At the core of a SCRIPE module lies an abstract base DbContext (e.g., `IdentityDbContext`). This base class contains all `DbSet` properties and business-level schema configurations. We then generate sealed derived classes for each supported provider: `SqlServerIdentityDbContext`, `OracleIdentityDbContext`, and `PostgreSqlIdentityDbContext`.",
      diTitle: "Runtime Provider Injection",
      diContent:
        "Repositories exclusively reference the abstract base context, remaining completely agnostic to the underlying database engine. At initialization, the core infrastructure reads your `DatabaseProvider` flag from `appsettings.json` and dynamically registers the appropriate derived context via our proprietary `AddMultiProviderDatabase` extension.",
      cliTitle: "Generating Multi-Provider Migrations",
      cliContent:
        "The `scripe-cli` eliminates the tedious process of maintaining parallel migrations. With a single command, the CLI spawns child processes that generate distinct, dialect-perfect migrations for all supported providers simultaneously.",
      cliWarning:
        "Important: Never manually edit the generated `ModelSnapshot` files. Always use the CLI to ensure consistency across the three supported dialects.",
      cliUpdateTitle: "Auto-Detecting Provider Updates",
      cliUpdateContent:
        "When applying migrations with `scripe db update`, the CLI automatically parses your backend `appsettings.json` to detect the currently active `DatabaseProvider`. It seamlessly executes the update against the correct database engine without requiring you to manually specify the provider flag. For edge cases, you can override this behavior using the `-p` parameter.",
      cliRemoveTitle: "Smart Force Removal",
      cliRemoveContent:
        "To rollback migrations safely and automatically across providers, use `scripe db remove-migration`. By parsing your active provider, the CLI safely reverts the migration logic and applies a standard removal check. Validated, it then aggressively cleans up inactive providers sequentially using aggressive force techniques, avoiding irrelevant connection timeouts and ensuring all branches are neatly reset simultaneously.",
      newProviderTitle: "Adding a New Database Engine",
      newProviderContent:
        "To introduce a new provider (e.g., SQLite for testing), follow the Clean Architecture extension pattern:",
      newProviderStep1: "Create a new sealed derived context (e.g., `SqliteIdentityDbContext`).",
      newProviderStep2:
        "Implement an `IDesignTimeDbContextFactory<T>` specifically for the new context.",
      newProviderStep3:
        "Update `InfrastructureDI.cs` to include the new context in the provider registration array.",
      newProviderStep4:
        "Execute `scripe db add-migration Initial -m Identity` to generate the initial snapshot.",
    },
    scripeCli: {
      title: "SCRIPE CLI Tooling",
      description:
        "Massive productivity with 66 scaffolding templates, multi-database commands, and deep auto-wiring.",
      intro:
        "The SCRIPE CLI is a production-quality node-based scaffolding tool strictly engineered for the SCRIPE modular monolith. It generates full-stack modules and CRUD features across the .NET backend and Next.js frontend, executing autonomous, surgical wiring connecting Solutions, Configurations, DI containers, Docker services, and permission constants.",
      commandsTitle: "Core Scaffolding Commands",
      commandsIntro:
        "There are vast arrays of CLI commands. At the heart are two fundamental scaffolders that deeply integrate all baseline requirements.",
      newModuleTitle: "Module Scaffolding: new-module",
      newModuleIntro:
        "Creates a complete, strongly-typed architecture pattern. It generates a 3-project DDD backend structure (Domain, Application, Infrastructure) and a unified frontend module directory.",
      newFeatureTitle: "Feature Scaffolding: new-feature",
      newFeatureIntro:
        "Generates expansive CRUD patterns. Employs an exact property DSL to weave out 26 distinct files across REST Controllers, CQRS AstraFlow mediator, Solid Rect Components, TanStack Query models, and EF Core configurations.",
      destructionTitle: "Destructive Tools",
      destructionIntro:
        "Because the CLI wires deeply into the core fabric of SCRIPE, it provides powerful destruction operations to execute perfect code rollback when testing layouts rapidly.",
      bgJobsTitle: "Background Service Operations",
      bgJobsIntro:
        "Immediately hook a module into the background job engine using standalone initialization tooling.",
      dslTitle: "Property DSL Syntax",
      dslIntro:
        "The `--properties` (`-p`) parameter allows highly flexible Domain-Specific definitions mapped universally backwards and forwards across C# to TypeScript Types, culminating in SQL structures and validated Zod schemas.",
      dslSyntaxInfo: "Syntax Rules: PropertyName:Type[:modifier1][:modifier2]",
      templatesTitle: "66 Immutable Templates",
      templatesIntro:
        "Instead of writing standard architectures by hand, the CLI enforces pure Clean Architecture through 66 precise Handlebars templates spanning 46 backend files and 20 frontend configurations, locking down quality.",
      securityTitle: "Automated Defense in Depth",
      securityIntro:
        "When generating REST API Controllers from the CLI, highly constrained security attributes are immediately bound directly onto the generated endpoints by default.",
      autoWiringTitle: "Profound Auto-Wiring",
      autoWiringIntro:
        "Generating code is trivial; safely embedding that code into a massive compiled ecosystem is the true engineering victory. The CLI performs autonomous modifications to all critical junctions including:",
      wiringSln: ".sln injection (Guids and explicit pathways mapped across solution structures).",
      wiringProgram: "Program.cs (Host registrations).",
      wiringSettings: "appsettings.json (Database scaling connection string integrations).",
      wiringDocker: "docker-compose.yml (Injects gateway microservices references).",
      wiringPermissions: "permissions.ts (Next.js client-bound RBAC constant mapping arrays).",
      wiringFrontendApp: "src/app/ (Next.js server-routing injection).",
      wiringFrontEnv: ".env variables mapping proxy configurations cleanly.",
      revertSafely:
        "Remove commands accurately reverse all mapped configurations without destructive breaking changes.",
      dbSyncTitle: "Database & API Synchronization",
      dbSyncIntro:
        "High tier commands handle parallel database architectures and frontend proxies seamlessly, closing the infrastructure loop entirely.",
      dbCliCmd:
        "Intelligently executes `add-migration`, `update`, and `remove-migration` against SqlServer, Oracle, and PostgreSQL — either all providers simultaneously or a specific one with the `-p` flag.",
      syncApiCmd:
        "Consumes a remote Swagger/OpenAPI endpoint, parsing into pixel-perfect TypeScript Zod schemas, React controllers, and structured models instantly.",
      configTitle: "CLI Project Configuration Mapping",
      configIntro:
        "The SCRIPE CLI parses `scripe.config.json` files walking rapidly up the filesystem to construct its universal path configurations binding to your mono-repo.",
      namingTitle: "Intelligent Naming Mutations",
      namingIntro:
        "Provide a singular PascalCase entity name and the CLI generates infinite pluralized, kebab-cased, and CONSTANT_MAPPED variations flawlessly across the stack.",
      utilityTitle: "Ecosystem Utility Tools",
      utilityIntro:
        "Control build pipelines, package installations, and live development servers spanning across Node.js and .NET instantly from a unified prompt.",
      commandsReferenceTitle: "Complete Command Reference (v4.0)",
      commandsReferenceIntro:
        "SCRIPE CLI features 123 commands across 10 distinct categories, covering every aspect of the development and operations lifecycle. Below is the complete reference table.",
    },
    scripeStudio: {
      title: "SCRIPE Studio",
      description:
        "Visual developer dashboard with real-time module management, code generators, dev server controls, and embedded terminal.",
      intro:
        "SCRIPE Studio is a full-featured visual developer dashboard that runs alongside your SCRIPE development environment. It provides a real-time web UI for managing modules, running code generators, controlling dev servers, performing database operations, managing Docker containers, and more — all from a single browser tab.",
      architectureTitle: "Studio Architecture",
      architectureIntro:
        "Studio consists of two components: the Engine (Express + Socket.io + SQLite on port 4201) handles API requests, command execution, and real-time streaming. The UI (Next.js on port 4200) provides 19 pages covering all aspects of the development workflow. Communication between UI and Engine uses authenticated HTTP requests and WebSocket connections.",
      securityTitle: "Security Model",
      securityIntro:
        "Studio implements defense-in-depth security: session-based token authentication (generated per startup, stored in .studio/token), command whitelist validation (only scripe CLI commands allowed), centralized input sanitization against shell injection and path traversal, rate limiting (200 req/min per IP), CORS whitelist (localhost only), and URL validation for browser-open operations.",
      featuresTitle: "Studio Features",
      featureDashboard:
        "Dashboard — Health score, activity feed, module statistics, and system overview.",
      featureModules:
        "Module Manager — Create, delete, inspect, and browse modules with visual UI and real-time feedback.",
      featureGenerators:
        "Code Generators — Generate events, specifications, validators, enums, hooks, components, and pages through form-based UI.",
      featureDevServers:
        "Dev Servers — Start, stop, and restart backend and frontend servers with one-click controls and Open in Browser buttons.",
      featureDatabase:
        "Database — Run migrations, seed data, check migration status, backup databases, and reset modules.",
      featureDocker:
        "Docker — Manage Docker Compose services, view logs, check container health, and control the containerized stack.",
      featureTerminal:
        "Terminal — Embedded terminal with command history, ANSI output rendering, and streaming via WebSocket.",
      featureConfig:
        "Config Editor — View and edit environment variables across .env, appsettings.json, and scripe.config.json.",
      featurePackages:
        "Package Manager — Add, remove, and update npm and NuGet packages for frontend and backend.",
      featureSecurity:
        "Security Tools — Generate JWT/AES secrets, run vulnerability audits, and validate environment completeness.",
      cliCommandsTitle: "Studio CLI Commands",
      cliCommandsIntro:
        "Studio is launched and managed entirely through the SCRIPE CLI. The scripe studio command supports dev mode (--dev) with hot-reload, production mode (pre-built), build-only mode (studio build), custom ports (--port, --engine-port), and headless mode (--no-browser).",
    },
    healthChecks: {
      title: "Health Checks & K8s Probes",
      description:
        "Enterprise health endpoints for Kubernetes liveness, readiness, and startup probes with 6 individual checks covering Database, Redis, SMTP, Storage, Startup, and Module health.",
      intro:
        "SCRIPE provides 5 enterprise-grade health endpoints designed for Kubernetes orchestration, load balancer integration, and operations monitoring. Each endpoint validates specific infrastructure dependencies and returns structured JSON responses. The system uses a tag-based architecture where each check is tagged (db, cache, smtp, storage, startup, modules, ready, deep) and endpoints filter by tags to include only relevant checks.",
      architectureTitle: "Health Endpoint Architecture",
      endpointsTitle: "Health Endpoints",
      checksTitle: "Individual Health Checks",
      checksIntro:
        "Each health check validates a specific infrastructure dependency. Checks run in parallel for minimal latency. Failed checks return detailed error information without leaking sensitive connection strings. The failure status is configurable per check — Database and Startup failures return Unhealthy (kills the pod), while Redis, SMTP, and Storage return Degraded (app continues with fallbacks).",
      registrationTitle: "Health Check Registration",
      registrationIntro:
        "Health checks are registered centrally in HealthCheckExtensions.cs with explicit tags and failure statuses. Tags determine which endpoint includes each check. The tag-based design means adding a new check is a single line change — register it with the appropriate tags and it automatically appears in the correct endpoints.",
      k8sTitle: "Kubernetes Probe Configuration",
      k8sIntro:
        "SCRIPE's health endpoints map directly to Kubernetes probe types. The startup probe allows up to 5 minutes (30 failures × 10s interval) for database migration on first deployment. The readiness probe gates traffic routing — if Database or Redis fails, K8s removes the pod from load balancer endpoints. The liveness probe detects hung processes with no dependency checks.",
      dockerTitle: "Docker Compose Health Check",
      dockerIntro:
        "For Docker Compose deployments, configure health checks on the service definition. Use /health/live for basic liveness and /health/ready for readiness. Set start_period to allow time for database migrations before health checks begin. In microservice mode, each module service gets its own health check.",
      responseTitle: "Response Format",
      responseIntro:
        "SCRIPE supports two response formats depending on the endpoint. Public probe endpoints (/health/live, /health/startup, /health/ready) return a minimal JSON with status, duration, and check names. Authenticated endpoints (/health, /health/deep) return a detailed response including per-check durations, tags, data payloads, and exception details for operations teams.",
      environmentsTitle: "Environment-Specific Guide",
      dockerTip:
        "For IIS deployments: configure the Application Request Routing (ARR) health probe to use /health/ready as the health check URL. Set the response match to 'Healthy'. For Azure App Service: configure the Health Check feature in Configuration → General settings → Health check path = /health/ready.",
    },
    observability: {
      title: "Observability & Monitoring",
      description:
        "OpenTelemetry distributed tracing, Prometheus metrics, Grafana Loki centralized logging, and Jaeger trace visualization with pre-built alert rules.",
      intro:
        "SCRIPE implements a complete observability stack built on open standards: OpenTelemetry for distributed tracing, Prometheus for metrics collection, Grafana Loki for centralized logging, and Jaeger for trace visualization. Every SCRIPE request handler is automatically traced, every HTTP request generates metrics, and every log entry is enriched with CorrelationId, TenantId, and ModuleTag. The entire stack is opt-in — in development you can run with console-only output and zero external dependencies.",
      stackTitle: "Observability Stack Architecture",
      tracingTitle: "Distributed Tracing (OpenTelemetry)",
      tracingIntro:
        "The TracingBehavior AstraFlow mediator pipeline creates an OpenTelemetry span for every command and query handler. Spans include auto-detected module names, request types, and duration measurements. Errors are automatically recorded with exception details. Traces flow to Jaeger via OTLP gRPC protocol (:4317) for visualization and analysis.",
      prometheusTitle: "Prometheus Metrics",
      prometheusIntro:
        "The /metrics endpoint exposes OpenTelemetry metrics in Prometheus text format. Prometheus scrapes this endpoint at 15-second intervals, collecting HTTP request durations (histogram), active requests (gauge), GC collections, CPU time, and working set memory. In monolith mode, a single scrape target is needed. In microservice mode, configure one scrape job per module service.",
      loggingTitle: "Centralized Logging (Serilog + Loki)",
      loggingIntro:
        "Serilog enriches every log entry with machine name, environment, correlation ID, tenant ID, and module tag. When Loki is configured (Loki:Url is set), logs are pushed in real-time via the GrafanaLoki sink. When Loki:Url is empty, logging falls back to console only — this is the default in Development. The 'Application' label is always set to 'SCRIPE' to distinguish from other services in a shared Loki instance.",
      alertsTitle: "Alert Rules",
      alertsIntro:
        "Pre-configured Prometheus alert rules detect critical and warning conditions. Critical alerts fire immediately for high error rates, database outages, and extreme latency. Warning alerts track P95 degradation, auth anomalies, memory pressure, CPU spikes, and disk space. Alert rules are stored in infrastructure/monitoring/prometheus/alerts/ and auto-loaded by Prometheus.",
      monitoringStackTitle: "Docker Monitoring Stack",
      monitoringStackIntro:
        "A pre-built Docker Compose file (infrastructure/monitoring/docker-compose.monitoring.yml) launches the complete monitoring stack: Prometheus v3.2.1, Grafana v11.5.2, Loki v3.4.2, and Jaeger v2.4.0. All datasources, dashboards, and alert rules are auto-provisioned via Grafana's provisioning system. Grafana runs on port 3001 to avoid conflicts with the Next.js dev server on 3000.",
      configTitle: "Observability Configuration",
      productionWarning:
        "In production: set TraceSampleRatio to 0.1 (10% sampling) to reduce performance overhead, change the default Grafana password (admin/scripe-admin), restrict /metrics endpoint access via reverse proxy IP whitelist, never expose monitoring ports (9090, 3001, 16686) to the public internet, and configure Prometheus storage retention (default: 30 days, 10GB).",
    },
    auditTrail: {
      title: "Enterprise Audit Trail",
      description:
        "Full audit logging with 23 entity fields, module auto-detection, correlation tracking, real-time SignalR broadcasting, and 45+ event types across 13 categories.",
      intro:
        "SCRIPE's enterprise audit trail captures every significant action across the platform — from authentication events and entity mutations to permission changes, security incidents, and guardian protection enforcement. Each audit entry records 23 fields including CorrelationId for request tracing, TenantId for multi-tenant isolation, ModuleTag for module-level filtering, and IpAddress/UserAgent for forensic analysis. Events are broadcast in real-time via SignalR to connected dashboards.",
      architectureTitle: "Audit Trail Architecture",
      entityTitle: "AuditLog Entity Schema (23 Fields)",
      entityIntro:
        "The AuditLog entity captures comprehensive context for every auditable event. Old and new values are stored as JSON snapshots for full change history and regulatory compliance. The entity includes forensic data (IpAddress, UserAgent) and operational metadata (DurationMs, StatusCode, Metadata).",
      moduleDetectionTitle: "Module Auto-Detection",
      moduleDetectionIntro:
        "The AuditService automatically determines which module generated each audit event using a 3-priority detection chain: (1) Event-type hardcoded mapping for auth events, (2) API endpoint path-based mapping, (3) Entity type name-based mapping. Unknown modules are auto-capitalized from the URL segment. This eliminates manual tagging and ensures consistent module attribution.",
      eventTypesTitle: "Audit Event Types (45+)",
      realtimeTitle: "Real-Time Broadcasting",
      realtimeIntro:
        "Audit events (excluding routine HTTP Request logs to avoid flooding) are broadcast via SignalR to connected clients. Events are scoped by tenant — tenant admins only see their own tenant's events via tenant-specific groups, while super admins receive all events via the global group.",
      queryTitle: "Audit Log Query API",
      queryIntro:
        "The audit log query endpoint supports comprehensive filtering with 12 parameters. All filters are optional and can be combined. Results are paginated (default: 20 items, max: 100) and sorted by timestamp descending. Encrypted IDs are used for UserId and TenantId filters.",
      queryTip:
        "Pro tip: Use CorrelationId to trace the complete lifecycle of a single HTTP request across all audit entries. This is invaluable for debugging and incident investigation — one CorrelationId links the request log, entity changes, permission checks, and any errors.",
    },
    loadTesting: {
      title: "Load Testing & Backup",
      description:
        "k6 performance test suites with custom metrics, SLA thresholds, CI/CD pipeline integration, and multi-provider backup/DR strategy with actual recovery commands.",
      intro:
        "SCRIPE includes enterprise-grade k6 load testing scripts that validate performance SLAs under realistic workloads using custom SCRIPE-specific metrics. Combined with a comprehensive backup and disaster recovery strategy covering SQL Server, Oracle, PostgreSQL, and Redis — including actual recovery commands — the platform ensures both performance confidence and data durability across all deployment environments.",
      overviewTitle: "k6 Test Suites",
      overviewIntro:
        "Two pre-built k6 test suites cover the critical user journeys: authentication flows (login, JWT retrieval, protected endpoints, health checks) and CRUD operations (pagination, filtering, spike scenarios). Each suite defines VU ramp stages and custom metrics tracked in Grafana.",
      thresholdsTitle: "SLA Thresholds",
      authFlowTitle: "Auth Flow Test Script",
      authFlowIntro:
        "The auth-flow.js test simulates realistic user authentication patterns: login with credentials, access a protected endpoint with the JWT token, and verify the health check endpoint. Custom metrics (scr_login_duration, scr_login_fail_rate) track auth-specific SLAs independently from general HTTP metrics.",
      runningTitle: "Running Load Tests",
      cicdTitle: "CI/CD Integration",
      cicdIntro:
        "k6 integrates into GitHub Actions, GitLab CI, and Azure Pipelines. Tests run against a containerized backend instance with health readiness wait before execution. The pipeline fails automatically if any SLA threshold is breached. Results are uploaded as artifacts for trend analysis.",
      backupTitle: "Backup & Disaster Recovery",
      backupIntro:
        "SCRIPE supports multi-provider backup strategies with specific tools, frequencies, and recovery commands tailored to each database engine. The backup strategy ensures compliance with enterprise RPO (Recovery Point Objective) and RTO (Recovery Time Objective) requirements. Audit logs have a separate backup with extended retention for compliance.",
      drWarning:
        "Critical: Test your disaster recovery procedures quarterly. A backup that has never been restored is not a backup — it is a hope. Schedule DR drills on a calendar, document the recovery steps, and measure actual RTO.",
    },
  },
};
