import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "architecture.modules.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.modules.isolationRulesTitle",
    id: "isolation-rules",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "architecture.modules.allowedImportsTitle",
        variant: "positive",
        items: [
          "@core/* — Shared infrastructure (Result, API client, UI)",
          "@modules/{self}/* — Own module files only",
          "External npm packages (React, TanStack Query, etc.)",
        ],
      },
      {
        titleKey: "architecture.modules.forbiddenImportsTitle",
        variant: "negative",
        items: [
          "@modules/{other}/* — NEVER import from other modules",
          "../../../modules/{other}/ — Relative paths to other modules",
          "Embedding another module's entity or component",
        ],
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.modules.backendModuleTitle",
    id: "backend-module",
  },
  { type: "paragraph", contentKey: "architecture.modules.backendModuleIntro" },
  {
    type: "code",
    language: "text",
    filename: "Backend Module Template",
    code: `src/Modules/{ModuleName}/
├── {Module}.Domain/
│   ├── Entities/              # Domain entities (DDD)
│   ├── Interfaces/            # Repository contracts
│   ├── Specifications/        # Query specifications
│   ├── Events/                # Domain events
│   └── Enums/                 # Module-specific enums
│
├── {Module}.Application/
│   ├── Commands/              # CQRS write operations
│   │   ├── Create{Entity}/
│   │   │   ├── Create{Entity}Command.cs
│   │   │   ├── Create{Entity}CommandValidator.cs
│   │   │   └── Create{Entity}CommandHandler.cs
│   │   └── Update{Entity}/
│   ├── Queries/               # CQRS read operations
│   │   ├── Get{Entity}ById/
│   │   └── List{Entities}/
│   ├── DTOs/                  # Data transfer objects
│   ├── Mappings/              # Explicit DTO mapping rules
│   └── DependencyInjection.cs # Assembly marker
│
└── {Module}.Infrastructure/
    ├── Persistence/
    │   ├── {Module}DbContext.cs
    │   ├── Configurations/     # EF entity configs
    │   ├── Repositories/       # Interface implementations
    │   └── Migrations/         # EF migrations
    ├── Services/               # External service adapters
    └── DependencyInjection.cs  # Service registration`,
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.modules.frontendModuleTitle",
    id: "frontend-module",
  },
  {
    type: "code",
    language: "text",
    filename: "Frontend Module Template",
    code: `src/modules/{module-name}/
├── di.ts                     # Module DI Container
├── index.ts                  # Public API (Views, entities)
└── src/
    ├── domain/
    │   ├── entities/         # Zod schemas + domain logic
    │   └── interfaces/       # Repository contracts
    ├── data/
    │   ├── models/           # API DTOs (raw shapes)
    │   ├── mappers/          # DTO ↔ Entity transforms
    │   └── repositories/     # API implementations
    └── presentation/
        ├── viewmodels/       # React hooks (all logic)
        ├── views/            # Pure UI (<60 lines)
        └── components/       # Section UI components`,
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.modules.registryTitle",
    id: "module-registry",
  },
  { type: "paragraph", contentKey: "architecture.modules.registryIntro" },
  {
    type: "table",
    headers: ["Module", "Type", "Backend", "Frontend", "Description"],
    rows: [
      ["Identity", "Core", "✅", "✅", "Authentication, users, roles, tenants"],
      ["Admin", "Feature", "—", "✅", "Admin panel with dashboard"],
      ["Dashboard", "Sub-module", "✅ (via Identity)", "✅", "KPIs, charts, activity feed"],
      ["User Management", "Sub-module", "✅ (via Identity)", "✅", "User CRUD operations"],
      ["Role Management", "Sub-module", "✅ (via Identity)", "✅", "Role + permission assignment"],
      ["Tenant Management", "Sub-module", "✅ (via Identity)", "✅", "Multi-tenant administration"],
      ["Docs", "Feature", "—", "✅", "Documentation portal"],
      ["Home", "Feature", "—", "✅", "Landing page"],
      ["Inventory (Planned)", "Core", "✅", "✅", "Product and stock management"],
      ["Orders (Planned)", "Core", "✅", "✅", "Order processing pipeline"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.modules.communicationTitle",
    id: "cross-module-communication",
  },
  {
    type: "step-guide",
    steps: [
      {
        titleKey: "architecture.modules.pattern1Title",
        contentKey: "architecture.modules.pattern1Content",
        code: `// In HR module — link to Vendor details via URL
import Link from 'next/link';

<Link href={\`/vendor/\${employee.assignedVendorId}\`}>
  View Assigned Vendor
</Link>`,
        codeLanguage: "typescript",
      },
      {
        titleKey: "architecture.modules.pattern2Title",
        contentKey: "architecture.modules.pattern2Content",
        code: `// ✅ Store ONLY the vendor ID, not the whole entity
const EmployeeSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  assignedVendorId: z.string().uuid().optional(), // Just the ID
});

// ❌ DON'T embed the entire Vendor entity
// vendor: VendorSchema  ← This creates coupling!`,
        codeLanguage: "typescript",
      },
      {
        titleKey: "architecture.modules.pattern3Title",
        contentKey: "architecture.modules.pattern3Content",
        code: `// Core Event Bus (future pattern)
eventBus.emit("employee:created", { id: "123", name: "John" });

// Subscribing in another module
eventBus.on("employee:created", (data) => {
  // React to employee creation without importing HR module
});`,
        codeLanguage: "typescript",
      },
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "architecture.modules.boundaryWarning",
  },
];

registerPage({
  slug: "architecture/modules",
  titleKey: "architecture.modules.title",
  descriptionKey: "architecture.modules.description",
  category: "architecture",
  order: 5,
  sections,
  relatedSlugs: ["architecture/overview", "get-started/project-structure"],
  lastUpdated: "2026-02-19",
});
