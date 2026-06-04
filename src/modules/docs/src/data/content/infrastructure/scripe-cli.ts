import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.intro",
  },

  // ─── Core Scaffolding Commands ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeCli.commandsTitle",
    id: "commands",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.commandsIntro",
  },

  // new-module
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.scripeCli.newModuleTitle",
    id: "new-module",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.newModuleIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "New Module Command",
    code: `$ scripe new-module <name> [options]

# Options:
# --backend-only          Generate only the backend module
# --frontend-only         Generate only the frontend module
# --entity <name>         Custom name for the first entity
# --with-no-entity        Create bare skeleton without initial CRUD entity
# --no-cache              Skip Redis cache integration on queries/commands
# --no-cleaner-bg-service Skip soft-delete cleanup background job generation`,
  },
  {
    type: "code",
    language: "typescript",
    filename: "Generated Frontend Module Structure",
    code: `src/modules/{kebab-name}/
├── di.ts                           # DI container (wires all sub-modules)
├── index.ts                        # Public barrel exports
└── {sub-module-name}/
    ├── index.ts                    # Sub-module barrel
    ├── locales/                    # Sub-module-owned translations
    │   ├── {sub-module-name}.en.ts
    │   ├── {sub-module-name}.ar.ts
    │   └── index.ts
    └── src/
        ├── domain/
        │   ├── entities/{Entity}.ts
        │   └── interfaces/
        │       └── I{Entity}Repository.ts
        ├── data/
        │   ├── models/{Entity}Model.ts
        │   ├── mappers/{Entity}Mapper.ts
        │   └── repositories/{Entity}Repository.ts
        └── presentation/
            ├── viewmodels/use{Entity}ViewModel.ts
            └── views/{Entity}ListView.tsx`,
  },

  // new-feature
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.scripeCli.newFeatureTitle",
    id: "new-feature",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.newFeatureIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "New Feature Command",
    code: `$ scripe new-feature <module> <entity> -p <properties> [options]

# Options:
# -p, --properties <props>  (Required) Property definitions string
# --backend-only            Generate only backend files
# --frontend-only           Generate only frontend files
# --no-controller           Skip REST controller generation
# --no-cache                Skip cache integration
# --no-cleaner-bg-service   Skip adding entity to soft-delete cleanup job

# Example: E-commerce Invoice
$ scripe new-feature Products Invoice \\
  -p "Title:string:required:max(200),Amount:decimal:required:min(0),Status:enum(Draft|Sent|Paid):required"`,
  },

  // remove-module & remove-feature
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.scripeCli.destructionTitle",
    id: "destructive-commands",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.destructionIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "Destructive Commands",
    code: `# Remove a full module and aggressively rollback ALL auto-wiring safely
$ scripe remove-module Products --confirm

# Remove a specific feature/entity and rollback its DI and permissions
$ scripe remove-feature Products Invoice --confirm

# Auto-detect the most recent scaffolding and obliterate it
$ scripe remove-module --last --confirm`,
  },

  // Background Jobs
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.scripeCli.bgJobsTitle",
    id: "bg-jobs",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.bgJobsIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "Background Job Tooling",
    code: `# Automatically generate and wire a Soft-Delete Cleanup Job (provider-agnostic)
$ scripe add-bg-service Products

$ scripe remove-bg-service Products`,
  },

  // ─── Property DSL Syntax ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeCli.dslTitle",
    id: "dsl-syntax",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.dslIntro",
  },
  {
    type: "info",
    variant: "note",
    contentKey: "infrastructure.scripeCli.dslSyntaxInfo",
  },
  {
    type: "table",
    headers: ["C# Type", "TypeScript", "Zod Schema", "Form Input"],
    rows: [
      ["string", "string", "z.string()", "text"],
      ["int", "number", "z.number().int()", "number"],
      ["decimal", "number", "z.number()", "number"],
      ["bool", "boolean", "z.boolean()", "switch"],
      ["datetime", "Date", "z.coerce.date()", "date"],
      ["guid", "string", "z.string().uuid()", "text"],
    ],
  },
  {
    type: "table",
    headers: ["Modifier / Special Type", "Effect", "Example Usage"],
    rows: [
      ["Foreign Key (FK)", "Generates Guid mapping + selects UI", "ClientId:FK:Client:required"],
      ["Enum", "Generates C# enum + TS Union", "Status:enum(Draft|Paid):required:default(Draft)"],
      ["maxLength(N)", "Maximum string length constraint", "Code:string:maxLength(10)"],
      ["email", "Email validation", "Email:string:required:email"],
      ["Type[]", "Generates Arrays", "Tags:string[]?"],
    ],
  },

  // ─── 66 Handlebars Templates ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeCli.templatesTitle",
    id: "templates",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.templatesIntro",
  },
  {
    type: "table",
    headers: ["Backend Templates (54 Files)", "Purpose"],
    rows: [
      ["Entity.cs.hbs", "Domain Object Base Class"],
      ["EntityCommands.cs.hbs", "AstraFlow mediator Create/Update/Delete Records"],
      ["CreateEntityCommandHandler.cs.hbs", "Create specific handler"],
      ["EntityQueries.cs.hbs", "AstraFlow mediator Query Records"],
      ["GetEntitiesQueryHandler.cs.hbs", "List Handler"],
      ["EntityController.cs.hbs", "REST API Controller"],
      ["DbContext.cs.hbs", "Full Database EF Core Context"],
      ["ApplicationDI.cs.hbs / InfrastructureDI.cs.hbs", "Dependency Injection Layers"],
      ["en.json.hbs / ar.json.hbs", "Localization dictionaries"],
    ],
  },
  {
    type: "table",
    headers: ["Frontend Templates (25 Files)", "Purpose"],
    rows: [
      ["di.ts.hbs", "Frontend Module DI Container"],
      ["page.tsx.hbs", "Next.js App Router Page wrapper"],
      ["Entity.ts.hbs", "Comprehensive Zod Entity Schema"],
      ["EntityModel.ts.hbs", "API DTO Typings"],
      ["EntityMapper.ts.hbs", "DTO ↔ Entity mapper logic"],
      ["useEntityViewModel.ts.hbs", "TanStack React Query controller payload"],
      ["EntityListView.tsx.hbs", "SOLID-compliant Pure UI React Component"],
    ],
  },

  // ─── Security Defaults ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeCli.securityTitle",
    id: "security-defaults",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.securityIntro",
  },
  {
    type: "table",
    headers: ["Security Feature", "Attribute / Tool", "Effect"],
    rows: [
      ["Authorization", "[Authorize]", "Force JWT Bearer on endpoints"],
      ["Rate Limiting", '[EnableRateLimiting("per-user")]', "Sliding window 100 req/min limit"],
      ["Role Guards", "[AdminOnly]", "Controller level route protection"],
      ["Granular Permissions", '[PermissionRequired("...")]', "Claim/Policy checks per-endpoint"],
      ["Query Limits", "Math.Min(pageSize, 100)", "Guards against memory exhaustion queries"],
    ],
  },

  // ─── Profound Auto-Wiring ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeCli.autoWiringTitle",
    id: "auto-wiring",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.autoWiringIntro",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "infrastructure.scripeCli.wiringSln",
      "infrastructure.scripeCli.wiringProgram",
      "infrastructure.scripeCli.wiringSettings",
      "infrastructure.scripeCli.wiringDocker",
      "infrastructure.scripeCli.wiringPermissions",
      "infrastructure.scripeCli.wiringFrontendApp",
      "infrastructure.scripeCli.wiringFrontEnv",
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "infrastructure.scripeCli.revertSafely",
  },

  // ─── Database & API Synchronization ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeCli.dbSyncTitle",
    id: "db-sync",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.dbSyncIntro",
  },
  {
    type: "list",
    variant: "unordered",
    items: ["infrastructure.scripeCli.dbCliCmd", "infrastructure.scripeCli.syncApiCmd"],
  },
  {
    type: "code",
    language: "bash",
    filename: "Database Migration Commands",
    code: `# Generate migration for all 3 providers (SqlServer, Oracle, PostgreSql)
$ scripe db add-migration Initial -m CRM

# Generate migration for a specific provider only
$ scripe db add-migration Initial -m CRM -p SqlServer

# Apply migrations (auto-detects provider from appsettings.json)
$ scripe db update -m CRM

# Override provider for update
$ scripe db update -m CRM -p Oracle

# Remove last migration from all 3 providers
$ scripe db remove-migration -m CRM

# Remove last migration from a specific provider only
$ scripe db remove-migration -m CRM -p SqlServer

# Rebuild frontend schemas to mirror live Backend structure
$ scripe sync-api https://localhost:5001/swagger/v1/swagger.json -m crm`,
  },

  // ─── Project Configuration ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeCli.configTitle",
    id: "configuration",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.configIntro",
  },
  {
    type: "code",
    language: "json",
    filename: "scripe.config.json",
    code: `{
  "backend": {
    "root": "./SCRIPE-Backend",
    "solutionFile": "SCRIPE-Backend.sln",
    "modulesDir": "src/Modules",
    "hostDir": "src/Host/API",
    "coreDir": "src/Core"
  },
  "frontend": {
    "root": "./SCRIPE-Frontend",
    "modulesDir": "src/modules",
    "appDir": "src/app",
    "coreDir": "src/core",
    "localesDir": "src/core/locales"
  },
  "defaults": {
    "targetFramework": "net10.0",
    "languages": ["en", "ar"]
  }
}`,
  },

  // ─── Naming Conventions ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeCli.namingTitle",
    id: "naming-conventions",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.namingIntro",
  },
  {
    type: "table",
    headers: ["Variant", "Example (InvoiceItem)", "Usage"],
    rows: [
      ["name", "InvoiceItem", "C# classes, PascalCase structures"],
      ["namePlural", "InvoiceItems", "Collections, API Controllers"],
      ["camelName", "invoiceItem", "TypeScript endpoints/variables"],
      ["camelNamePlural", "invoiceItems", "React Query models"],
      ["kebabName", "invoice-item", "File names, URLs"],
      ["kebabNamePlural", "invoice-items", "Browser Route paths"],
      ["snakeName", "invoice_item", "Database columns"],
      ["snakeNamePlural", "invoice_items", "Database tables"],
      ["upperSnakeName", "INVOICE_ITEM", "Environment variables, constants"],
    ],
  },

  // ─── Build & Utility Commands ─────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.scripeCli.utilityTitle",
    id: "utility",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.utilityIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "Utility Build Trees",
    code: `# Fast installation trees targeting specific ecosystems
$ scripe install all        # Both CLI and Frontend via npm/pnpm
$ scripe install frontend   # Only Frontend

# Fast compilation targets
$ scripe build all          # Typescript CLI -> dotnet build -> pnpm build
$ scripe build backend      # dotnet build 

# Local Server Proxies
$ scripe dev frontend       # Next.js Server
$ scripe dev backend        # Kestrel .NET Engine`,
  },

  // ─── Complete Command Reference (v4.0) ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.scripeCli.commandsReferenceTitle",
    id: "commands-reference",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.scripeCli.commandsReferenceIntro",
  },
  {
    type: "table",
    headers: ["Category", "Key Commands", "Scope & Actions"],
    rows: [
      ["Scaffolding", "new-module, new-feature, new-event, new-spec, new-validator, new-enum, new-middleware, new-hook, new-component, new-page, new-dto, new-mapper, new-repository, new-service, new-seeder, new-test, new-controller, new-job, new-integration-test, scaffold", "Generate full-stack domain layers, controllers, viewmodels, database migrations, and clean architecture contracts."],
      ["Database", "db add-migration, db update, db remove-migration, db seed, db reset, db status, db backup", "Run migrations across SqlServer/Oracle/PostgreSql, seed development/production data, reset tables, or schedule backups."],
      ["Development", "dev frontend, dev backend, dev all", "Start hot-reloaded development hosts for Kestrel and Next.js concurrently."],
      ["Building", "build backend, build frontend, build all, build cli", "Compile specific parts of the modular monolith and build the CLI from source."],
      ["Testing", "test, test backend, test frontend, e2e", "Execute unit and integration tests, run coverage, or trigger Playwright E2E browser tests."],
      ["Code Quality", "lint, format, validate-locales, arch-check", "Enforce linting/formatting rules, sync translations parity, or execute deep architecture audits."],
      ["Docker", "docker up, docker down, docker build, docker logs, docker status", "Orchestrate local containerized services (Redis, RabbitMQ, Gateway)."],
      ["Security", "env init, env validate, secrets generate, audit", "Scaffold environment variables, check appsettings, generate cryptography keys, and audit package vulnerabilities."],
      ["Diagnostics", "info, doctor, list, clean", "Analyze system prerequisites, inspect registered modules/routes/permissions, and prune bin/obj/cache folders."],
      ["Ecosystem", "trace, benchmark, changelog, publish, config", "Inspect OpenTelemetry logs, execute k6 load tests, generate release changelogs, and manage config options."]
    ]
  },
];

registerPage({
  slug: "infrastructure/scripe-cli",
  titleKey: "infrastructure.scripeCli.title",
  descriptionKey: "infrastructure.scripeCli.description",
  category: "infrastructure",
  order: 2,
  sections,
  relatedSlugs: ["infrastructure/database-migrations", "commercial/cli-tooling"],
  lastUpdated: "2026-06-04",
});
