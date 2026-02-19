/**
 * English locale for the Documentation Portal.
 * Contains all UI strings and content translations.
 */
export const docEn = {
  // ─── Common UI ──────────────────────────────────────────────
  common: {
    search: "Search docs...",
    searchPlaceholder: "Type to search...",
    searchShortcut: "⌘K",
    searchNoResults: "No results found",
    searchResultsTitle: "Search Results",
    copyCode: "Copy",
    codeCopied: "Copied!",
    onThisPage: "On this page",
    relatedDocs: "Related Documents",
    lastUpdated: "Last updated",
    previous: "Previous",
    next: "Next",
    backToTop: "Back to top",
    expandAll: "Expand all",
    collapseAll: "Collapse all",
    menu: "Menu",
    closeMenu: "Close menu",
    tableOfContents: "Table of Contents",
    readingTime: "{{min}} min read",
    home: "Home",
    editPage: "Edit this page",
    version: "Version",
    language: "Language",
    technical: "Technical",
    commercial: "Commercial",
  },

  // ─── Info Blocks ────────────────────────────────────────────
  info: {
    note: "Note",
    tip: "Tip",
    warning: "Warning",
    danger: "Danger",
  },

  // ─── API Table ──────────────────────────────────────────────
  api: {
    method: "Method",
    endpoint: "Endpoint",
    description: "Description",
    auth: "Auth",
    authRequired: "Required",
    noAuth: "Public",
    permission: "Permission",
  },

  // ─── Navigation Categories ──────────────────────────────────
  nav: {
    getStarted: "Get Started",
    tutorials: "Tutorials",
    architecture: "Architecture",
    features: "Features",
    frontend: "Frontend Modules",
    security: "Security",
    apiReference: "API Reference",
    infrastructure: "Infrastructure",
  },

  // ═══════════════════════════════════════════════════════════
  //  GET STARTED
  // ═══════════════════════════════════════════════════════════

  getStarted: {
    overview: {
      title: "Overview",
      description: "Introduction to the NEXORA Enterprise Platform — architecture, capabilities, and technology stack.",
      intro: "NEXORA is a production-ready enterprise platform built with a Modular Monolith architecture. It provides everything you need to build scalable business applications — authentication, authorization, multi-tenancy, audit logging, real-time events, and a comprehensive admin panel — all out of the box. The platform runs as a single binary that can be deployed as a monolith or decomposed into microservices without code changes.",
      // Feature Grid
      featureModular: "Modular Monolith",
      featureModularDesc: "Isolated modules with clean boundaries — develop, test, and deploy independently. Same binary, flexible deployment.",
      featureCQRS: "CQRS + MediatR",
      featureCQRSDesc: "Command/Query separation with a 3-behavior pipeline: validation, audit, and performance monitoring.",
      featureSecurity: "Enterprise Security",
      featureSecurityDesc: "RBAC, 2FA, field-level security, rate limiting, session management, and comprehensive audit trails.",
      featureMultiTenant: "Multi-Tenancy",
      featureMultiTenantDesc: "Row-level tenant isolation with EF Core global query filters. Per-tenant settings, branding, and data scoping.",
      featureMultiDB: "Multi-Database",
      featureMultiDBDesc: "Switch between SQL Server, PostgreSQL, Oracle, or SQLite with a single configuration change.",
      featureDeployment: "Flexible Deployment",
      featureDeploymentDesc: "Deploy as monolith, microservices, or hybrid via a single MODULE_NAME environment variable.",
      // Architecture
      architectureTitle: "Architecture Topology",
      architectureIntro: "NEXORA operates in three deployment modes controlled entirely by a single environment variable. The same compiled binary can run as a monolith (all modules), a microservice (single module), or an API gateway (YARP proxy).",
      // Deployment Modes
      deploymentModesTitle: "Deployment Modes",
      deploymentModesIntro: "The MODULE_NAME environment variable determines which modules load at startup. When empty, all modules register (monolith mode). When set to a module name, only that module loads (microservice mode). When set to 'Gateway', YARP reverse proxy activates.",
      // Tech Stack
      techStackTitle: "Technology Stack",
      // Service Registration
      serviceRegistrationTitle: "Service Registration Order",
      serviceRegistrationIntro: "The order of service registration in Program.cs is architecturally significant. Changing the order can cause runtime failures. Core infrastructure must register before modules, and MediatR needs module assembly markers collected first.",
      registrationOrderWarning: "Do NOT reorder the service registrations in Program.cs. AddCoreInfrastructure must come before modules (they depend on ICurrentUser), and AddCoreApplication must come after modules (MediatR needs their assemblies).",
      // Environment Profiles
      environmentProfilesTitle: "Environment Profiles",
      envVarPrefixTip: "Only environment variables starting with NEXORA_ are loaded. For example, NEXORA_ConnectionStrings__DefaultConnection overrides the connection string. Double underscores (__) represent nesting in JSON config.",
    },

    prerequisites: {
      title: "Prerequisites",
      description: "Required tools, database setup, and environment configuration for development.",
      intro: "Before you begin developing with NEXORA, ensure your development machine has the required tools installed. This page covers exact version requirements, database support, step-by-step setup, and Docker quickstart.",
      // Required Tools
      requiredToolsTitle: "Required Tools",
      // Database
      databaseTitle: "Database Support",
      databaseIntro: "NEXORA supports four database providers out of the box. Choose the one that best fits your infrastructure. The database provider is configured via the DatabaseProvider setting in appsettings.json.",
      databaseTip: "For local development, SQL Server with Docker is the fastest setup. Use the Docker Compose file below to spin up SQL Server and Redis in seconds.",
      // Environment Setup
      envSetupTitle: "Environment Setup",
      step1Title: "Verify Tool Versions",
      step1Content: "Ensure all required tools are installed and meet the minimum version requirements.",
      step2Title: "Clone the Repository",
      step2Content: "Clone the monorepo with Git submodules for both backend and frontend.",
      step3Title: "Configure Connection String",
      step3Content: "Update the database connection string to point to your local database instance.",
      step4Title: "Backend Setup",
      step4Content: "Restore NuGet packages and apply Entity Framework migrations to create the database schema.",
      step5Title: "Frontend Setup",
      step5Content: "Install npm dependencies and create your local environment configuration file.",
      // Docker
      dockerTitle: "Docker Quickstart",
      dockerNote: "The Docker Compose file above sets up SQL Server 2022 and Redis 7 for local development. The nexora-api service builds from the backend Dockerfile and connects to both services automatically.",
    },

    quickStart: {
      title: "Quick Start",
      description: "Get NEXORA running locally in under 5 minutes with backend, frontend, and verification steps.",
      intro: "This guide walks you through starting both the backend API server and the frontend development server, then verifying everything works with health checks and API tests.",
      // Backend
      backendTitle: "Start the Backend",
      backendStep1Title: "Restore Dependencies",
      backendStep1Content: "Restore all NuGet packages for the solution.",
      backendStep2Title: "Apply Migrations",
      backendStep2Content: "Run Entity Framework migrations to create or update the database schema.",
      backendStep3Title: "Run the API Server",
      backendStep3Content: "Start the backend API server on https://localhost:5001.",
      backendRunningTip: "The API server will start on https://localhost:5001 by default. Swagger UI is available at /swagger in development mode.",
      // Frontend
      frontendTitle: "Start the Frontend",
      frontendStep1Title: "Install Dependencies",
      frontendStep1Content: "Install all npm dependencies using pnpm for faster, disk-efficient installation.",
      frontendStep2Title: "Configure Environment",
      frontendStep2Content: "Create a .env.local file with the API URL and app name.",
      frontendStep3Title: "Start Dev Server",
      frontendStep3Content: "Start the Next.js development server on http://localhost:3000.",
      // Credentials
      defaultCredentialsTitle: "Default Credentials",
      credentialsWarning: "Change these passwords immediately in production! The default credentials are seeded by the database migration and should only be used for local development.",
      // Verify
      verifyInstallTitle: "Verify Installation",
      verifyInstallIntro: "Once both servers are running, verify the installation using these checks.",
      // CLI
      nexoraCliTitle: "NEXORA CLI",
      nexoraCliIntro: "The NEXORA CLI (nexora-cli) provides scaffolding commands to generate modules, entities, commands, queries, and more. It follows the project's architecture conventions automatically.",
    },

    projectStructure: {
      title: "Project Structure",
      description: "Complete directory layout of the NEXORA monorepo — root, backend, frontend, and module anatomy.",
      intro: "NEXORA is organized as a Git submodule monorepo with three main parts: the root repository, backend submodule, and frontend submodule. Understanding this structure is essential for navigating the codebase.",
      // Sections
      rootTitle: "Root Monorepo",
      backendTitle: "Backend Structure",
      frontendTitle: "Frontend Structure",
      moduleAnatomyTitle: "Module Anatomy",
      moduleAnatomyIntro: "Every frontend module follows an identical structure. This consistency makes it easy to navigate any module once you understand one. Each layer has strict responsibilities and import rules.",
      // Comparison
      allowedImports: "✅ Allowed Imports",
      forbiddenImports: "❌ Forbidden Imports",
      boundaryWarning: "Module boundaries are absolute law. Modules CANNOT import from each other. If code needs to be shared, it must be moved to @core/. Cross-module data is passed only via route parameters (URL) or shared IDs.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  ARCHITECTURE
  // ═══════════════════════════════════════════════════════════

  architecture: {
    overview: {
      title: "Architecture Overview",
      description: "Clean Architecture layers, backend pipeline, frontend SOLID flow, and module boundary rules.",
      intro: "NEXORA follows a strict Clean Architecture with four layers: Presentation, Application, Domain, and Infrastructure. The dependency rule ensures inner layers never depend on outer layers. This architecture is applied consistently across both backend (.NET) and frontend (Next.js).",
      layersTitle: "Clean Architecture Layers",
      backendArchTitle: "Backend Architecture",
      backendArchIntro: "The backend follows a request pipeline architecture where every HTTP request flows through middleware, controllers, MediatR behaviors, and finally the CQRS handler. This ensures consistent validation, auditing, and error handling.",
      frontendArchTitle: "Frontend Architecture",
      frontendArchIntro: "The frontend uses a SOLID View/ViewModel pattern where Views are pure UI (no state, no logic) and ViewModels contain all business logic. The connector pattern separates Next.js routing (Server Components) from application logic (Client Components).",
      moduleBoundariesTitle: "Module Boundaries",
      moduleBoundariesIntro: "Modules are isolated islands. They cannot import from each other. This enables independent development, isolated failures, and the ability to extract modules to separate repositories.",
      withBoundaries: "✅ With Module Boundaries",
      withoutBoundaries: "❌ Without Module Boundaries",
      communicationPatternsTitle: "Cross-Module Communication",
      crossModuleNote: "The Event Bus pattern is planned for future releases. Currently, modules communicate exclusively through URL navigation and shared IDs.",
    },

    backend: {
      title: "Backend Architecture",
      description: "Program.cs anatomy, middleware pipeline, DI service map, module registration pattern, and controller catalog.",
      intro: "The NEXORA backend is a .NET 10 Modular Monolith with 288 lines in Program.cs that wire together 16 service registrations, 10 middleware components, and 18 REST controllers. This page dissects every layer of the backend architecture.",
      programCsTitle: "Program.cs Anatomy",
      programCsIntro: "Program.cs is the application's entry point and wiring center. It detects the deployment mode, registers services in a specific order, and builds the middleware pipeline. The file follows a clear 5-section structure.",
      middlewarePipelineTitle: "Middleware Pipeline",
      middlewarePipelineIntro: "The middleware pipeline processes every HTTP request in a specific order. Each middleware can short-circuit the pipeline (e.g., rate limiter returns 429, auth returns 401). Order matters — changing it can break security.",
      diMapTitle: "DI Service Map",
      diMapIntro: "The following table shows all major service interfaces, their implementations, lifetimes, and where they are registered. Understanding this map is essential for debugging and extending the system.",
      modulePatternTitle: "Module Registration Pattern",
      modulePatternIntro: "Every new module follows the same DI registration pattern. The AddXxxModule() extension method registers the module's DbContext, repositories, services, and module registration marker.",
      controllersTitle: "Controllers",
      controllerTip: "All controllers inherit from a base ApiController that provides standardized Result<T> response mapping. Controllers should be thin — they only validate the request model and delegate to MediatR.",
    },

    frontend: {
      title: "Frontend Architecture",
      description: "SOLID View/ViewModel pattern, module structure, and the connector pattern for Next.js integration.",
      intro: "The NEXORA frontend is built with Next.js 16 (App Router) following a strict SOLID View/ViewModel pattern. Every page is composed of a pure UI View that delegates all logic to ViewModel hooks. This separation ensures testability, reusability, and maintainability.",
      solidPatternTitle: "SOLID View/ViewModel Pattern",
      solidPatternIntro: "The SOLID pattern ensures each piece of the UI has a single responsibility. Views render JSX, ViewModels manage state and logic, and Components provide reusable UI sections.",
      viewRulesTitle: "View Rules",
      viewDo: "✅ View SHOULD",
      viewDont: "❌ View SHOULD NOT",
      viewExampleTitle: "View Example",
      viewModelRulesTitle: "ViewModel Rules",
      viewModelRulesIntro: "ViewModels are React hooks that contain all business logic. They compose section-specific ViewModels (statistics, filters, table) and return typed interfaces consumed by Views.",
      moduleStructureTitle: "Module File Structure",
      connectorPatternTitle: "Connector Pattern",
      connectorPatternIntro: "The connector pattern separates Next.js App Router pages (Server Components) from module Views (Client Components). Pages in src/app/ are thin connectors that import and render module Views. They handle routing, metadata, and URL params only.",
      connectorWarning: "NEVER put business logic, data fetching, forms, or state management in src/app/ files. These are Server Components that only connect routes to module Views.",
    },

    cqrs: {
      title: "CQRS Pattern",
      description: "Command/Query Responsibility Segregation with MediatR pipeline, behaviors, validation, and caching.",
      intro: "NEXORA uses the CQRS (Command Query Responsibility Segregation) pattern to separate read and write operations. Commands mutate state and go through validation + audit behaviors. Queries read state and can leverage caching. MediatR acts as the mediator between controllers and handlers.",
      whatIsCqrsTitle: "What is CQRS?",
      whatIsCqrsIntro: "CQRS separates your application into two sides: Commands (writes) and Queries (reads). Each side can be optimized independently — commands focus on data integrity and validation, while queries focus on performance and caching.",
      commandSide: "Command Side (Write)",
      querySide: "Query Side (Read)",
      pipelineTitle: "MediatR Pipeline",
      validationBehaviorTitle: "Validation Behavior",
      commandExampleTitle: "Command Example",
      queryExampleTitle: "Query Example",
      cachingTip: "Queries can use server-side caching to avoid hitting the database on every request. The cache key should include all query parameters to ensure uniqueness. Cache is automatically invalidated when related commands succeed.",
    },

    modules: {
      title: "Module System",
      description: "Module isolation rules, backend/frontend templates, module registry, and cross-module communication.",
      intro: "NEXORA uses a strict module system where each module is an isolated island with clear boundaries. Modules cannot import from each other — they communicate only through URLs, shared IDs, or the core event bus. This ensures independence, testability, and the ability to extract modules to separate repositories.",
      isolationRulesTitle: "Module Isolation Rules",
      allowedImportsTitle: "✅ Allowed Imports",
      forbiddenImportsTitle: "❌ Forbidden Imports",
      backendModuleTitle: "Backend Module Template",
      backendModuleIntro: "Every backend module follows DDD (Domain-Driven Design) with three projects: Domain, Application, and Infrastructure. The Domain is pure C# with no external dependencies.",
      frontendModuleTitle: "Frontend Module Template",
      registryTitle: "Module Registry",
      registryIntro: "The module registry tracks all active modules at runtime. It is populated during application startup when each module's IModuleRegistration implementation is resolved and registered.",
      communicationTitle: "Cross-Module Communication Patterns",
      pattern1Title: "Pattern 1: URL Navigation",
      pattern1Content: "Navigate to another module's page via standard URL links. No imports needed.",
      pattern2Title: "Pattern 2: Shared IDs Only",
      pattern2Content: "Store only the foreign module's entity ID. Never embed the whole entity.",
      pattern3Title: "Pattern 3: Core Event Bus",
      pattern3Content: "Publish and subscribe to events through a shared event bus in @core/. Future pattern — not yet implemented.",
      boundaryWarning: "Module boundaries are absolute law. If you need to share code between modules, it MUST go in @core/. Any import from @modules/{other}/ is a violation and will be caught in code review.",
    },

    solidPattern: {
      title: "SOLID View/ViewModel",
      description: "Page type scenarios — CRUD lists, dashboards, profiles, settings, wizards, and report builders.",
      intro: "The SOLID View/ViewModel pattern is mandatory for all pages in src/modules/. This guide covers 7 page type scenarios with their exact directory structures, ViewModel patterns, and code examples.",
      principlesTitle: "SOLID Principles Applied",
      scenariosTitle: "Page Type Scenarios",
      scenariosIntro: "Choose the scenario that matches your page type. Each provides a tried-and-tested structure that ensures consistency across the entire application.",
      scenario1Title: "Scenario 1: CRUD List Page",
      scenario1Intro: "Use for managing entity collections (Users, Products, Orders). The orchestrator composes statistics, filters, and table ViewModels.",
      scenario2Title: "Scenario 2: Dashboard / Analytics",
      scenario2Intro: "Use for KPIs, charts, and metrics. Each chart or card section gets its own ViewModel with period selection and data transformation.",
      scenario3Title: "Scenario 3: Detail / Profile Page",
      scenario3Intro: "Use for viewing a single entity with tabs and sections. The orchestrator fetches the main entity and composes tab ViewModels.",
      scenario4Title: "Scenario 4: Settings Page",
      scenario4Intro: "Use for multiple independently-saveable form sections. Each settings section gets its own ViewModel with form state and save mutation.",
      scenario5Title: "Scenario 5: Wizard / Multi-Step Form",
      scenario5Intro: "Use for complex multi-step flows like onboarding or checkout. The wizard ViewModel coordinates step navigation, validation gates, and combined submission.",
      rulesTitle: "Golden Rules",
      antiPatternWarning: "Anti-pattern: Putting useState, useEffect, or useQuery directly in a View component. ALL state and logic must live in ViewModels. Views are pure UI composition only.",
    },

    stateManagement: {
      title: "State Management",
      description: "TanStack Query for server state, Zustand for global UI state, and LanguageProvider for localization.",
      intro: "NEXORA uses three state management tools, each for a specific category: TanStack Query for server data (API results), Zustand for global UI state (auth, sidebar, theme), and useState for component-local state (forms, toggles).",
      decisionTitle: "Decision Matrix",
      tanstackTitle: "TanStack Query (Server State)",
      tanstackIntro: "Use TanStack Query for any data that comes from the API. It handles caching, background refetching, pagination, optimistic updates, and request deduplication automatically.",
      zustandTitle: "Zustand (Global UI State)",
      zustandIntro: "Use Zustand for global UI state that needs to be shared across components but doesn't come from the server. There are exactly 3 approved stores.",
      antiPatternsTitle: "Anti-Patterns",
      doTitle: "✅ DO",
      dontTitle: "❌ DON'T",
      localizationTitle: "Localization (LanguageProvider)",
      localizationIntro: "Localization uses a custom LanguageProvider with localStorage persistence. It supports 7 languages, RTL/LTR auto-detection, and dot-notation translation keys with interpolation.",
      noLocaleFoldersWarning: "Do NOT use [locale] folders in src/app/! Localization is handled via LanguageProvider context, not file-based routing. No next-intl, no next-i18next, no URL-based language (/en/, /ar/).",
    },

    dataFlow: {
      title: "Data Flow",
      description: "End-to-end data flow diagrams — query, mutation, backend pipeline, error handling, and caching strategy.",
      intro: "Understanding how data flows through NEXORA is essential for debugging and extending the system. This page traces data from a button click in the UI all the way to the database and back.",
      queryFlowTitle: "Query Flow (Read)",
      queryFlowIntro: "When a user views data (e.g., opening the Users page), the flow starts at the View, goes through the ViewModel, TanStack Query, Repository, API Service, and finally the backend API.",
      mutationFlowTitle: "Mutation Flow (Write)",
      backendPipelineTitle: "Backend Request Pipeline",
      backendPipelineIntro: "Every backend request passes through 10 middleware components and 3 MediatR pipeline behaviors before reaching the handler. This ensures consistent logging, authentication, authorization, validation, and auditing.",
      errorFlowTitle: "Error Handling",
      errorFlowIntro: "Errors are handled at multiple levels. Each error source has a specific handler, response code, and frontend handling strategy.",
      cachingFlowTitle: "Caching Strategy",
      cachingFlowIntro: "The backend uses a two-level caching strategy: L1 (in-process IMemoryCache) and L2 (distributed Redis). The frontend uses TanStack Query's built-in cache with configurable staleTime.",
      cacheTip: "Set staleTime to 5 minutes for data that changes infrequently (roles, permissions). Use 0 for data that changes often (audit logs, notifications). Always invalidate related queries after successful mutations.",
    },
  },

  // ═══════════════════════════════════════════════════════════
  //  FEATURES
  // ═══════════════════════════════════════════════════════════

  features: {
    authentication: {
      title: "Authentication",
      description: "JWT login, refresh tokens, 2FA verification, and rate limiting policies.",
      intro: "NEXORA provides a secure authentication system with JWT access tokens, refresh token rotation, optional two-factor authentication, and comprehensive rate limiting. The system supports both admin and regular user authentication flows.",
      flowTitle: "Authentication Flow",
      jwtTitle: "JWT Token Configuration",
      jwtIntro: "The system uses short-lived access tokens (15 minutes) with long-lived refresh tokens (7 days). Refresh tokens are rotated on each use to prevent reuse attacks.",
      endpointsTitle: "Authentication API Endpoints",
      rateLimitingTitle: "Rate Limiting",
      rateLimitingIntro: "Authentication endpoints are protected by multiple rate limiting policies to prevent brute-force attacks and abuse.",
      lockoutWarning: "After 5 failed login attempts, the account is locked for 15 minutes. The lockout counter resets after a successful login. Admins can manually unlock accounts from the admin panel.",
    },

    multiTenancy: {
      title: "Multi-Tenancy",
      description: "Row-level data isolation, tenant settings, branding, and scoping architecture.",
      intro: "NEXORA supports full multi-tenancy with row-level data isolation using EF Core's global query filters. Every entity with a TenantId column is automatically filtered based on the current user's tenant, ensuring complete data separation between tenants.",
      architectureTitle: "Architecture",
      featuresTitle: "Tenant Features",
      // Feature Grid
      featureIsolation: "Data Isolation",
      featureIsolationDesc: "Row-level isolation via EF Core global query filters. Each query automatically includes WHERE TenantId = @CurrentTenant.",
      featureSettings: "Per-Tenant Settings",
      featureSettingsDesc: "Each tenant has independent configuration: timezone, date format, currency, language preferences.",
      featureBranding: "Custom Branding",
      featureBrandingDesc: "Upload tenant logos, set colors, and customize the UI appearance for each tenant.",
      featureUserScoping: "User Scoping",
      featureUserScopingDesc: "Users belong to a single tenant. Tenant admins can only see and manage their own users.",
      featureRoleScoping: "Role Scoping",
      featureRoleScopingDesc: "Roles are scoped to tenants. Each tenant can create custom roles with different permission sets.",
      featureDataScoping: "Data Scoping",
      featureDataScopingDesc: "All business data is automatically scoped to the tenant. No risk of cross-tenant data leaks.",
      endpointsTitle: "Tenant API Endpoints",
      logoTip: "Tenant logos are served via a static file middleware at /storage/tenants/{tenantId}/logo.{ext}. The frontend uses absolute URLs for logo display.",
    },

    rolePermissions: {
      title: "Roles & Permissions",
      description: "Permission hierarchy, category-based permission system, restricted fields, and tenant-scoped roles.",
      intro: "NEXORA implements a comprehensive RBAC (Role-Based Access Control) system with category-based permissions, field-level restrictions, and tenant scoping. Permissions are cached server-side for performance — changes take effect immediately without token refresh.",
      hierarchyTitle: "Permission Hierarchy",
      systemTitle: "Permission System",
      systemIntro: "Permissions are organized into categories, each containing multiple granular permissions. The naming convention follows the pattern: {resource}.{action}.",
      restrictedFieldsTitle: "Field-Level Restrictions",
      restrictedFieldsIntro: "Beyond standard CRUD permissions, roles can have field-level restrictions. This means a role might have 'users.read' permission but with certain fields (like salary or SSN) hidden from the API response.",
      endpointsTitle: "Role API Endpoints",
      tenantScopingNote: "Roles are automatically scoped to the current user's tenant. A tenant admin can only see and manage roles within their own tenant. Super admins can see all roles across all tenants.",
    },

    auditSystem: {
      title: "Audit System",
      description: "4-source audit pipeline, event types, real-time SignalR broadcasting, and export capabilities.",
      intro: "NEXORA captures every significant action in the audit log through a 4-source pipeline: MediatR behaviors (CQRS commands), EF Core interceptors (entity changes), middleware (HTTP requests), and explicit service calls (security events). All events are broadcasted in real-time via SignalR.",
      architectureTitle: "Audit Architecture",
      eventTypesTitle: "Event Types",
      realTimeTitle: "Real-Time Broadcasting",
      realTimeIntro: "Every audit event is broadcast in real-time via SignalR. Connected clients receive events scoped to their tenant, enabling live audit dashboards and instant security alerts.",
      endpointsTitle: "Audit API Endpoints",
      retentionTip: "Audit logs are retained indefinitely by default. Configure retention policies in appsettings.json under AuditOptions.RetentionDays to automatically purge old records via a Hangfire background job.",
    },

    // Stubs for navigation (pages not yet created)
    twoFactorAuth: { title: "Two-Factor Authentication", description: "TOTP-based 2FA setup, verification, and recovery." },
    sessionManagement: { title: "Session Management", description: "Active session tracking, device info, and session revocation." },
    profileManagement: { title: "Profile Management", description: "Profile updates, avatar upload, password change." },
    adminManagement: { title: "Admin Management", description: "Admin CRUD, role assignment, impersonation, and bulk operations." },
    roleManagement: { title: "Role Management", description: "Role CRUD with permission assignment and cloning." },
    permissionSystem: { title: "Permission System", description: "RBAC with server-side caching and field-level security." },
    tenantManagement: { title: "Tenant Management", description: "Multi-tenant CRUD, hierarchy, settings, and logos." },
    menuSystem: { title: "Menu System", description: "Dynamic menu management with reorder and visibility controls." },
    dashboardAnalytics: { title: "Dashboard & Analytics", description: "KPIs, charts, security events, and data export." },
    auditLogging: { title: "Audit Logging", description: "Comprehensive audit trail with 4-source pipeline." },
    recycleBin: { title: "Recycle Bin", description: "Soft-deleted records viewer with restore capability." },
    fileManagement: { title: "File Management", description: "Chunked upload, resumable download, ETag validation." },
    userAuthentication: { title: "User Authentication", description: "User registration, email/phone verification, OAuth." },
  },

  // ═══════════════════════════════════════════════════════════
  //  SECURITY
  // ═══════════════════════════════════════════════════════════

  security: {
    overview: {
      title: "Security Overview",
      description: "5-layer defense strategy, security features, CORS configuration, rate limiting, and password policies.",
      intro: "NEXORA implements a defense-in-depth security strategy with five layers: network protection, authentication, authorization, data isolation, and audit logging. Every request passes through multiple security checks before reaching business logic.",
      layersTitle: "Security Defense Layers",
      featuresTitle: "Security Features",
      featureJwt: "JWT Authentication",
      featureJwtDesc: "Short-lived access tokens (15 min) with automatic refresh. HMAC-SHA256 signing with configurable secret.",
      feature2fa: "Two-Factor Auth",
      feature2faDesc: "TOTP-based 2FA with QR code setup. Optional per-user, enforceable per-tenant or globally.",
      featureRbac: "RBAC Permissions",
      featureRbacDesc: "Category-based permissions with server-side caching. Changes take effect immediately.",
      featureRateLimit: "Rate Limiting",
      featureRateLimitDesc: "4-tier rate limiting: global DDoS, per-IP, per-endpoint, and authentication-specific.",
      featureAudit: "Audit Logging",
      featureAuditDesc: "Every action logged with who, what, when, where. Real-time SignalR broadcasting.",
      featureCors: "CORS Configuration",
      featureCorsDesc: "Strict origin validation in production. Open CORS for localhost in development.",
      corsTitle: "CORS Configuration",
      corsIntro: "CORS policies differ between development and production environments. In development, all localhost origins are allowed. In production, only explicitly configured origins are accepted.",
      rateLimitTitle: "Rate Limiting Policies",
      passwordTitle: "Password Policies",
      securityWarning: "Always review security settings before deploying to production. Change default secrets, configure CORS origins, and set appropriate rate limits. Enable 2FA for all admin accounts.",
    },
    // Stubs for future pages
    rbac: { title: "RBAC & Permissions", description: "Role-Based Access Control with server-side caching." },
    fieldLevel: { title: "Field-Level Security", description: "Restrict access to specific entity fields per role." },
    idEncryption: { title: "ID Encryption", description: "AES-256 entity ID obfuscation for public APIs." },
    tokens: { title: "Token Security", description: "JWT structure, refresh token rotation, and token revocation." },
  },

  // ═══════════════════════════════════════════════════════════
  //  API REFERENCE
  // ═══════════════════════════════════════════════════════════

  apiReference: {
    overview: {
      title: "API Reference",
      description: "Complete endpoint catalog with authentication requirements, response formats, and pagination.",
      intro: "NEXORA exposes a RESTful API with JSON request/response bodies, Bearer JWT authentication, and consistent response envelopes. All endpoints are versioned under /api/v1/ and documented with Swagger/OpenAPI.",
      baseInfoTitle: "Base Information",
      authEndpointsTitle: "Authentication Endpoints",
      adminEndpointsTitle: "Admin Management Endpoints",
      userEndpointsTitle: "User Management Endpoints",
      roleEndpointsTitle: "Role Endpoints",
      tenantEndpointsTitle: "Tenant Endpoints",
      otherEndpointsTitle: "Other Endpoints",
      responseFormatTitle: "Response Envelope Format",
      swaggerTip: "The full interactive API documentation is available at /swagger when the backend is running in development mode. It includes request/response schemas, parameter descriptions, and a 'Try it out' feature.",
    },
    // Stubs for future pages
    adminAuth: { title: "Admin Auth API", description: "Login, refresh, logout, 2FA, sessions." },
    userAuth: { title: "User Auth API", description: "Register, verify, login, password reset, OAuth." },
    adminManagement: { title: "Admin Management API", description: "CRUD, bulk ops, role assignment, impersonation." },
    roles: { title: "Roles API", description: "Role CRUD and permission assignment." },
    tenants: { title: "Tenants API", description: "Tenant CRUD, hierarchy, settings." },
    menus: { title: "Menus API", description: "Menu CRUD, reorder, visibility." },
    audit: { title: "Audit API", description: "Audit log listing, detail, and export." },
  },

  // ═══════════════════════════════════════════════════════════
  //  FRONTEND MODULES (stubs)
  // ═══════════════════════════════════════════════════════════

  frontend: {
    authModule: { title: "Auth Module", description: "Login flow, 2FA verification, token management and route guards." },
    profileModule: { title: "Profile Module", description: "Admin profile, security settings, sessions, and activity." },
    systemModule: { title: "System Module", description: "All 12 system sub-modules: admin, roles, permissions, tenants, etc." },
    crudEngine: { title: "CRUD Engine", description: "GenericCrudView, DataTable, forms, and column helpers." },
  },

  // ═══════════════════════════════════════════════════════════
  //  INFRASTRUCTURE (stubs)
  // ═══════════════════════════════════════════════════════════

  infrastructure: {
    database: { title: "Database Configuration", description: "Configure SQL Server, PostgreSQL, or Oracle." },
    multiDatabase: { title: "Multi-Database Support", description: "Switching between database providers." },
    migrations: { title: "Migrations", description: "Running and managing database migrations." },
    caching: { title: "Caching Strategy", description: "Permission caching, query caching, and cache invalidation." },
  },

  // ═══════════════════════════════════════════════════════════
  //  TUTORIALS (stubs)
  // ═══════════════════════════════════════════════════════════

  tutorials: {
    firstBackendModule: { title: "Create Your First Module (Backend)", description: "Step-by-step guide to creating a new backend module with CQRS." },
    firstFrontendModule: { title: "Create Your First Module (Frontend)", description: "Build a frontend module following SOLID View/ViewModel pattern." },
    addEntity: { title: "Add a Domain Entity", description: "Create a new domain entity with validation and audit support." },
    addCommand: { title: "Add a Command (CQRS)", description: "Create a command with handler, validation, and pipeline behaviors." },
    addQuery: { title: "Add a Query (CQRS)", description: "Create a query with handler and response mapping." },
    addPermissions: { title: "Add Permissions", description: "Seed permissions and protect endpoints with RBAC." },
    addApiEndpoint: { title: "Add an API Endpoint", description: "Create a controller endpoint with Swagger docs and auth." },
    apiIntegration: { title: "Frontend API Integration", description: "Connect your frontend module to the backend API." },
  },
};

export type DocTranslations = typeof docEn;

/** Loose type for non-English locales — allows partial and legacy keys */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PartialDocTranslations = Record<string, any>;
