import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "getStarted.projectStructure.intro",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.projectStructure.rootTitle",
    id: "root-structure",
  },
  {
    type: "code",
    language: "text",
    filename: "NEXORA/ (Root Monorepo)",
    code: `NEXORA/
├── NEXORA-Backend/          # .NET 10 Backend (Git Submodule)
├── NEXORA-Frontend/         # Next.js 16 Frontend (Git Submodule)
├── tools/nexora-cli/        # CLI scaffolding tool
├── docs/                    # Technical documentation (67 files)
├── docs-commercial/         # Commercial documentation (25 files)
├── .gitmodules              # Submodule configuration
└── README.md                # Root README`,
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.projectStructure.backendTitle",
    id: "backend-structure",
  },
  {
    type: "code",
    language: "text",
    filename: "NEXORA-Backend/ Structure",
    code: `NEXORA-Backend/
├── src/
│   ├── Host/
│   │   └── API/
│   │       ├── Program.cs              # 288 lines — All wiring
│   │       ├── Controllers/            # 18 REST controllers
│   │       ├── Extensions/             # Middleware, CORS, YARP
│   │       └── Middleware/             # Request logging, audit
│   │
│   ├── Core/
│   │   ├── Core.Application/           # NEXORA mediator, Behaviors, CQRS
│   │   ├── Core.Domain/                # Base entities, Result<T>
│   │   └── Core.Infrastructure/        # DI, Caching, Events, Blob
│   │
│   └── Modules/
│       └── Identity/
│           ├── Identity.Domain/         # 15 entities, Zod-like specs
│           ├── Identity.Application/    # Commands, Queries, DTOs
│           └── Identity.Infrastructure/ # EF DbContext, Repos
│
├── tests/
│   ├── Unit/                           # xUnit unit tests
│   ├── Integration/                    # API integration tests
│   └── Architecture/                   # ArchTest conventions
│
└── docs/                               # Backend-specific docs`,
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.projectStructure.frontendTitle",
    id: "frontend-structure",
  },
  {
    type: "code",
    language: "text",
    filename: "NEXORA-Frontend/ Structure",
    code: `NEXORA-Frontend/
├── src/
│   ├── app/                            # Next.js App Router (connectors only)
│   │   ├── (auth)/                     # Auth pages (login, register)
│   │   ├── (modules)/                  # Module pages (admin, docs, etc.)
│   │   └── layout.tsx                  # Root layout with providers
│   │
│   ├── core/                           # Shared infrastructure
│   │   ├── ui/                         # Shadcn components (Button, Input, etc.)
│   │   ├── providers/                  # LanguageProvider, MainProvider
│   │   ├── store/                      # Zustand stores (Auth, UI, Toast)
│   │   ├── network/                    # API client, interceptors
│   │   ├── locales/                    # i18n dictionaries (7 languages)
│   │   └── common/                     # Result<T>, errors, constants
│   │
│   └── modules/                        # Feature modules (isolated)
│       ├── auth/                       # Authentication module
│       ├── admin/                      # Admin panel + sub-modules
│       │   ├── dashboard/              # Dashboard stats
│       │   ├── user-management/        # User CRUD
│       │   ├── role-management/        # Role + permissions
│       │   └── tenant-management/      # Multi-tenant admin
│       ├── home/                       # Home/landing page
│       └── docs/                       # Documentation portal (this)
│
└── public/                             # Static assets`,
  },
  {
    type: "heading",
    level: 2,
    titleKey: "getStarted.projectStructure.moduleAnatomyTitle",
    id: "module-anatomy",
  },
  {
    type: "paragraph",
    contentKey: "getStarted.projectStructure.moduleAnatomyIntro",
  },
  {
    type: "table",
    headers: ["Directory", "Layer", "Contents", "Imports Allowed"],
    rows: [
      ["domain/entities/", "Domain", "Zod schemas, business rules", "External packages only"],
      ["domain/interfaces/", "Domain", "Repository contracts", "Domain entities"],
      ["data/models/", "Data", "API DTOs (raw API shapes)", "@core/network"],
      ["data/mappers/", "Data", "DTO ↔ Entity mapping", "Domain + Data models"],
      ["data/repositories/", "Data", "Interface implementations", "@core/network, mappers"],
      [
        "presentation/viewmodels/",
        "Presentation",
        "React hooks with logic",
        "Domain interfaces, TanStack Query",
      ],
      ["presentation/views/", "Presentation", "Pure UI (<60 lines)", "ViewModels, components"],
      [
        "presentation/components/",
        "Presentation",
        "Reusable section UI",
        "@core/ui, own module only",
      ],
      ["di.ts", "Root", "DI container for module", "Repositories, services"],
      ["index.ts", "Root", "Public API exports", "Views, entities"],
    ],
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "getStarted.projectStructure.allowedImports",
        variant: "positive",
        items: [
          "@core/* — Shared infrastructure",
          "@modules/{self}/* — Own module files",
          "External npm packages",
        ],
      },
      {
        titleKey: "getStarted.projectStructure.forbiddenImports",
        variant: "negative",
        items: [
          "@modules/{other}/* — NEVER import from other modules",
          "../../modules/{other}/ — Relative paths to other modules",
          "Embedding other module entities directly",
        ],
      },
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "getStarted.projectStructure.boundaryWarning",
  },
];

registerPage({
  slug: "get-started/project-structure",
  titleKey: "getStarted.projectStructure.title",
  descriptionKey: "getStarted.projectStructure.description",
  category: "get-started",
  order: 4,
  sections,
  relatedSlugs: ["get-started/overview", "architecture/modules"],
  lastUpdated: "2026-02-19",
});
