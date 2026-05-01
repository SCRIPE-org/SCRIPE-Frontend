import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.intro",
  },

  // ─── Core Scaffolding Commands ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.nexoraCli.commandsTitle",
    id: "commands",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.commandsIntro",
  },

  // new-module
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.nexoraCli.newModuleTitle",
    id: "new-module",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.newModuleIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "New Module Command",
    code: `$ nexora new-module <name> [options]

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
├── di.ts                           # DI container (uses getModuleApiService)
├── index.ts                        # Public API barrel file
└── src/
    ├── domain/
    │   ├── entities/{Entity}.ts    # Zod schema entity
    │   └── interfaces/
    │       ├── I{Entity}Repository.ts
    │       └── I{Entity}Service.ts
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
    titleKey: "infrastructure.nexoraCli.newFeatureTitle",
    id: "new-feature",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.newFeatureIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "New Feature Command",
    code: `$ nexora new-feature <module> <entity> -p <properties> [options]

# Options:
# -p, --properties <props>  (Required) Property definitions string
# --backend-only            Generate only backend files
# --frontend-only           Generate only frontend files
# --no-controller           Skip REST controller generation
# --no-cache                Skip cache integration
# --no-cleaner-bg-service   Skip adding entity to soft-delete cleanup job

# Example: E-commerce Invoice
$ nexora new-feature Products Invoice \\
  -p "Title:string:required:max(200),Amount:decimal:required:min(0),Status:enum(Draft|Sent|Paid):required"`,
  },

  // remove-module & remove-feature
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.nexoraCli.destructionTitle",
    id: "destructive-commands",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.destructionIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "Destructive Commands",
    code: `# Remove a full module and aggressively rollback ALL auto-wiring safely
$ nexora remove-module Products --confirm

# Remove a specific feature/entity and rollback its DI and permissions
$ nexora remove-feature Products Invoice --confirm

# Auto-detect the most recent scaffolding and obliterate it
$ nexora remove-module --last --confirm`,
  },

  // Background Jobs
  {
    type: "heading",
    level: 3,
    titleKey: "infrastructure.nexoraCli.bgJobsTitle",
    id: "bg-jobs",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.bgJobsIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "Background Job Tooling",
    code: `# Automatically generate and wire a Hangfire Soft-Delete Cleanup Job
$ nexora add-bg-service Products

$ nexora remove-bg-service Products`,
  },

  // ─── Property DSL Syntax ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.nexoraCli.dslTitle",
    id: "dsl-syntax",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.dslIntro",
  },
  {
    type: "info",
    variant: "note",
    contentKey: "infrastructure.nexoraCli.dslSyntaxInfo",
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
    titleKey: "infrastructure.nexoraCli.templatesTitle",
    id: "templates",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.templatesIntro",
  },
  {
    type: "table",
    headers: ["Backend Templates (46 Files)", "Purpose"],
    rows: [
      ["Entity.cs.hbs", "Domain Object Base Class"],
      ["EntityCommands.cs.hbs", "MediatR Create/Update/Delete Records"],
      ["CreateEntityCommandHandler.cs.hbs", "Create specific handler"],
      ["EntityQueries.cs.hbs", "MediatR Query Records"],
      ["GetEntitiesQueryHandler.cs.hbs", "List Handler"],
      ["EntityController.cs.hbs", "REST API Controller"],
      ["DbContext.cs.hbs", "Full Database EF Core Context"],
      ["ApplicationDI.cs.hbs / InfrastructureDI.cs.hbs", "Dependency Injection Layers"],
      ["en.json.hbs / ar.json.hbs", "Localization dictionaries"],
    ],
  },
  {
    type: "table",
    headers: ["Frontend Templates (20 Files)", "Purpose"],
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
    titleKey: "infrastructure.nexoraCli.securityTitle",
    id: "security-defaults",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.securityIntro",
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
    titleKey: "infrastructure.nexoraCli.autoWiringTitle",
    id: "auto-wiring",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.autoWiringIntro",
  },
  {
    type: "list",
    variant: "unordered",
    items: [
      "infrastructure.nexoraCli.wiringSln",
      "infrastructure.nexoraCli.wiringProgram",
      "infrastructure.nexoraCli.wiringSettings",
      "infrastructure.nexoraCli.wiringDocker",
      "infrastructure.nexoraCli.wiringPermissions",
      "infrastructure.nexoraCli.wiringFrontendApp",
      "infrastructure.nexoraCli.wiringFrontEnv",
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "infrastructure.nexoraCli.revertSafely",
  },

  // ─── Database & API Synchronization ───────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.nexoraCli.dbSyncTitle",
    id: "db-sync",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.dbSyncIntro",
  },
  {
    type: "list",
    variant: "unordered",
    items: ["infrastructure.nexoraCli.dbCliCmd", "infrastructure.nexoraCli.syncApiCmd"],
  },
  {
    type: "code",
    language: "bash",
    filename: "Database Migration Commands",
    code: `# Generate migration for all 3 providers (SqlServer, Oracle, PostgreSql)
$ nexora db add-migration Initial -m CRM

# Generate migration for a specific provider only
$ nexora db add-migration Initial -m CRM -p SqlServer

# Apply migrations (auto-detects provider from appsettings.json)
$ nexora db update -m CRM

# Override provider for update
$ nexora db update -m CRM -p Oracle

# Remove last migration from all 3 providers
$ nexora db remove-migration -m CRM

# Remove last migration from a specific provider only
$ nexora db remove-migration -m CRM -p SqlServer

# Rebuild frontend schemas to mirror live Backend structure
$ nexora sync-api https://localhost:5001/swagger/v1/swagger.json -m crm`,
  },

  // ─── Project Configuration ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "infrastructure.nexoraCli.configTitle",
    id: "configuration",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.configIntro",
  },
  {
    type: "code",
    language: "json",
    filename: "nexora.config.json",
    code: `{
  "backend": {
    "root": "./NEXORA-Backend",
    "solutionFile": "NEXORA-Backend.sln",
    "modulesDir": "src/Modules",
    "hostDir": "src/Host/API",
    "coreDir": "src/Core"
  },
  "frontend": {
    "root": "./NEXORA-Frontend",
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
    titleKey: "infrastructure.nexoraCli.namingTitle",
    id: "naming-conventions",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.namingIntro",
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
    titleKey: "infrastructure.nexoraCli.utilityTitle",
    id: "utility",
  },
  {
    type: "paragraph",
    contentKey: "infrastructure.nexoraCli.utilityIntro",
  },
  {
    type: "code",
    language: "bash",
    filename: "Utility Build Trees",
    code: `# Fast installation trees targeting specific ecosystems
$ nexora install all        # Both CLI and Frontend via npm/pnpm
$ nexora install frontend   # Only Frontend

# Fast compilation targets
$ nexora build all          # Typescript CLI -> dotnet build -> pnpm build
$ nexora build backend      # dotnet build 

# Local Server Proxies
$ nexora dev frontend       # Next.js Server
$ nexora dev backend        # Kestrel .NET Engine`,
  },
];

registerPage({
  slug: "infrastructure/nexora-cli",
  titleKey: "infrastructure.nexoraCli.title",
  descriptionKey: "infrastructure.nexoraCli.description",
  category: "infrastructure",
  order: 2,
  sections,
  relatedSlugs: ["infrastructure/database-migrations", "commercial/cli-tooling"],
  lastUpdated: "2026-03-03",
});
