/**
 * Docs page locale — EN
 */
export const en = {
  getStarted: {
    overview: {
      architectureIntro:
        "SCRIPE operates in three deployment modes controlled entirely by a single environment variable. The same compiled binary can run as a monolith (all modules), a microservice (single module), or an API gateway (YARP proxy).",
      architectureTitle: "Architecture Topology",
      deploymentModesIntro:
        "The MODULE_NAME environment variable determines which modules load at startup. When empty, all modules register (monolith mode). When set to a module name, only that module loads (microservice mode). When set to 'Gateway', YARP reverse proxy activates.",
      deploymentModesTitle: "Deployment Modes",
      description:
        "Introduction to the SCRIPE Enterprise Platform  architecture, capabilities, and technology stack.",
      environmentProfilesTitle: "Environment Profiles",
      envVarPrefixTip:
        "Only environment variables starting with SCRIPE_ are loaded. For example, SCRIPE_ConnectionStrings__DefaultConnection overrides the connection string. Double underscores (__) represent nesting in JSON config.",
      featureCQRS: "CQRS + AstraFlow mediator",
      featureCQRSDesc:
        "Command/Query separation with a 6-behavior pipeline: logging, stream logging, validation, feature gating, webhook dispatching, and caching.",
      featureDeployment: "Flexible Deployment",
      featureDeploymentDesc:
        "Deploy as monolith, microservices, or hybrid via a single MODULE_NAME environment variable.",
      featureModular: "Modular Monolith",
      featureModularDesc:
        "Isolated modules with clean boundaries  develop, test, and deploy independently. Same binary, flexible deployment.",
      featureMultiDB: "Flexible Database",
      featureMultiDBDesc:
        "Switch between SQL Server, PostgreSQL, or Oracle. Run all modules in a single shared database (Single mode) or give each module its own database (Multi mode) — controlled by a single config toggle.",
      featureMultiTenant: "Multi-Tenancy",
      featureMultiTenantDesc:
        "Row-level tenant isolation with EF Core global query filters. Per-tenant settings, branding, and data scoping.",
      featureSecurity: "Enterprise Security",
      featureSecurityDesc:
        "Unified Policy-Based Access Control (PBAC) engine uniting Role-Based (RBAC), Group-Based (GBAC), and Attribute-Based (ABAC) Access Control. Includes 2FA, Field-Level Restrictions, Rate Limiting, Session Management, and immutable Audit Trails.",
      featureSSO: "Enterprise SSO & Identity Provider",
      featureSSODesc:
        "Native OIDC/OAuth2 Identity Provider enabling true Single Sign-On across your ecosystem. Act as a primary IDP (like Keycloak) managing external client applications seamlessly.",
      intro:
        "SCRIPE is a production-ready enterprise platform built with a Modular Monolith architecture. It provides everything you need to build scalable business applications  authentication, authorization, multi-tenancy, audit logging, real-time events, and a comprehensive admin panel  all out of the box. The platform runs as a single binary that can be deployed as a monolith or decomposed into microservices without code changes.",
      registrationOrderWarning:
        "Do NOT reorder the service registrations in Program.cs. AddCoreInfrastructure must come before modules (they depend on ICurrentUser), and AddCoreApplication must come after modules (AstraFlow mediator needs their assemblies).",
      serviceRegistrationIntro:
        "The order of service registration in Program.cs is architecturally significant. Changing the order can cause runtime failures. Core infrastructure must register before modules, and AstraFlow mediator needs module assembly markers collected first.",
      serviceRegistrationTitle: "Service Registration Order",
      techStackTitle: "Technology Stack",
      title: "Overview",
    },
    prerequisites: {
      databaseIntro:
        "SCRIPE supports three database providers out of the box: SQL Server, PostgreSQL, and Oracle. The provider is configured via Database.Provider in appsettings.json. Additionally, the Database.Mode setting controls database isolation: 'Single' puts all module tables in one shared database, while 'Multi' (default) allows each module to have its own database with separate connection strings.",
      databaseTip:
        "For local development, SQL Server with Docker is the fastest setup. Use the Docker Compose file below to spin up SQL Server and Redis in seconds.",
      databaseTitle: "Database Support",
      description: "Required tools, database setup, and environment configuration for development.",
      dockerNote:
        "The Docker Compose file above sets up SQL Server 2022 and Redis 7 for local development. The scripe-api service builds from the backend Dockerfile and connects to both services automatically.",
      dockerTitle: "Docker Quickstart",
      envSetupTitle: "Environment Setup",
      intro:
        "Before you begin developing with SCRIPE, ensure your development machine has the required tools installed. This page covers exact version requirements, database support, step-by-step setup, and Docker quickstart.",
      requiredToolsTitle: "Required Tools",
      step1Content:
        "Ensure all required tools are installed and meet the minimum version requirements.",
      step1Title: "Verify Tool Versions",
      step2Content: "Clone the monorepo with Git submodules for both backend and frontend.",
      step2Title: "Clone the Repository",
      step3Content:
        "Update the database connection string to point to your local database instance.",
      step3Title: "Configure Connection String",
      step4Content:
        "Restore NuGet packages and apply Entity Framework migrations to create the database schema.",
      step4Title: "Backend Setup",
      step5Content:
        "Install npm dependencies and create your local environment configuration file.",
      step5Title: "Frontend Setup",
      title: "Prerequisites",
    },
    projectStructure: {
      allowedImports: " Allowed Imports",
      backendTitle: "Backend Structure",
      boundaryWarning:
        "Module boundaries are absolute law. Modules CANNOT import from each other. If code needs to be shared, it must be moved to @core/. Cross-module data is passed only via route parameters (URL) or shared IDs.",
      description:
        "Complete directory layout of the SCRIPE monorepo  root, backend, frontend, and module anatomy.",
      forbiddenImports: " Forbidden Imports",
      frontendTitle: "Frontend Structure",
      intro:
        "SCRIPE is organized as a Git submodule monorepo with three main parts: the root repository, backend submodule, and frontend submodule. Understanding this structure is essential for navigating the codebase.",
      moduleAnatomyIntro:
        "Every frontend module follows an identical structure. This consistency makes it easy to navigate any module once you understand one. Each layer has strict responsibilities and import rules.",
      moduleAnatomyTitle: "Module Anatomy",
      rootTitle: "Root Monorepo",
      title: "Project Structure",
      toolsIntro:
        "The tools/ directory contains the SCRIPE CLI and Studio. The CLI provides 123 commands for scaffolding, builds, migrations, and deployment. Studio is a visual developer dashboard built with Express (engine) and Next.js (UI).",
      toolsTitle: "Developer Tools",
    },
    quickStart: {
      backendRunningTip:
        "The API server will start on https://localhost:5001 by default. Swagger UI is available at /swagger in development mode.",
      backendStep1Content: "Restore all NuGet packages for the solution.",
      backendStep1Title: "Restore Dependencies",
      backendStep2Content:
        "Run Entity Framework migrations to create or update the database schema.",
      backendStep2Title: "Apply Migrations",
      backendStep3Content: "Start the backend API server on https://localhost:5001.",
      backendStep3Title: "Run the API Server",
      backendTitle: "Start the Backend",
      cliDevAllCmd:
        "scripe dev all — Start both backend and frontend servers concurrently with labeled output and auto-open browser.",
      cliDevBackendCmd: "scripe dev backend — Start the .NET backend in development mode.",
      cliDevFrontendCmd:
        "scripe dev frontend — Start the Next.js dev server with auto-detected port and browser launch.",
      cliDevIntro:
        "Instead of manually starting backend and frontend servers, use the SCRIPE CLI for a streamlined development experience. The CLI automatically handles port resolution, browser launching, and concurrent server management.",
      cliDevNoBrowser:
        "Add --no-browser flag to any dev command to prevent auto-opening the browser (useful for CI/headless environments).",
      cliDevTitle: "Development with the CLI",
      credentialsWarning:
        "Change these passwords immediately in production! The default credentials are seeded by the database migration and should only be used for local development.",
      defaultCredentialsTitle: "Default Credentials",
      description:
        "Get SCRIPE running locally in under 5 minutes with backend, frontend, and verification steps.",
      frontendStep1Content:
        "Install all npm dependencies using pnpm for faster, disk-efficient installation.",
      frontendStep1Title: "Install Dependencies",
      frontendStep2Content: "Create a .env.local file with the API URL and app name.",
      frontendStep2Title: "Configure Environment",
      frontendStep3Content: "Start the Next.js development server on http://localhost:3000.",
      frontendStep3Title: "Start Dev Server",
      frontendTitle: "Start the Frontend",
      intro:
        "This guide walks you through starting both the backend API server and the frontend development server, then verifying everything works with health checks and API tests.",
      prodBuildAllCmd:
        "scripe build all — Build both backend and frontend for production deployment.",
      prodNoBrowser:
        "Add --no-browser flag to prevent auto-opening the browser in production mode.",
      prodStartAllCmd:
        "scripe start all — Start backend (Release mode) and frontend (next start) concurrently. Auto-opens browser.",
      prodStartBackendCmd:
        "scripe start backend — Start only the production backend server (dotnet run --configuration Release).",
      prodStartFrontendCmd: "scripe start frontend — Start only the production frontend server.",
      prodStartPublishedCmd:
        "scripe start all --published — Run from pre-compiled DLL for fastest startup. Requires scripe build backend first.",
      productionIntro:
        "For production deployment, use the scripe start command which runs servers in release/production mode with optimized performance.",
      productionTitle: "Production Servers",
      scripeCliIntro:
        "The SCRIPE CLI (scripe-cli) provides scaffolding commands to generate modules, entities, commands, queries, and more. It follows the project's architecture conventions automatically.",
      scripeCliTitle: "SCRIPE CLI",
      studioBuildCmd:
        "scripe studio build — Pre-compile the Studio engine (TypeScript) and UI (Next.js) without starting.",
      studioDevCmd:
        "scripe studio --dev — Launch Studio in development mode with hot-reload. Auto-opens browser on port 4200.",
      studioIntro:
        "SCRIPE Studio is a visual developer dashboard that provides a real-time UI for managing your entire development workflow. It includes module management, code generators, dev server controls, database operations, terminal access, and more.",
      studioPortCmd:
        "Use --port and --engine-port flags to customize the UI (default: 4200) and engine (default: 4201) ports.",
      studioProdCmd:
        "scripe studio — Launch Studio in production mode. Builds engine and UI if not already built.",
      studioTitle: "SCRIPE Studio",
      title: "Quick Start",
      verifyInstallIntro:
        "Once both servers are running, verify the installation using these checks.",
      verifyInstallTitle: "Verify Installation",
    },
  },
};
