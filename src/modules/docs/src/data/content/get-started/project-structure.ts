import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "get-started/project-structure",
  titleKey: "getStarted.projectStructure.title",
  category: "get-started",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "getStarted.projectStructure.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.projectStructure.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.projectStructure.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.projectStructure.section_3_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "SCRIPE/\n├── SCRIPE-Backend/          # .NET 10 Backend (Git Submodule)\n├── SCRIPE-Frontend/         # Next.js 16 Frontend (Git Submodule)\n├── tools/scripe-cli/        # CLI scaffolding tool\n├── docs/                    # Technical documentation (67 files)\n├── docs-commercial/         # Commercial documentation (25 files)\n├── .gitmodules              # Submodule configuration\n└── README.md                # Root README",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.projectStructure.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.projectStructure.section_6_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "SCRIPE-Backend/\n├── src/\n│   ├── Host/\n│   │   └── API/\n│   │       ├── Program.cs              # 30 lines — Entry point & extension wiring\n│   │       ├── Controllers/            # 18 REST controllers\n│   │       ├── Extensions/             # Middleware, CORS, YARP\n│   │       └── Middleware/             # Request logging, audit\n│   │\n│   ├── Core/\n│   │   ├── Core.Application/           # AstraFlow mediator, Behaviors, CQRS\n│   │   ├── Core.Domain/                # Base entities, Result<T>\n│   │   └── Core.Infrastructure/        # DI, Caching, Events, Blob\n│   │\n│   └── Modules/\n│       └── Identity/\n│           ├── Identity.Domain/         # 15 entities, Zod-like specs\n│           ├── Identity.Application/    # Commands, Queries, DTOs\n│           └── Identity.Infrastructure/ # EF DbContext, Repos\n│\n├── tests/\n│   ├── Unit/                           # xUnit unit tests\n│   ├── Integration/                    # API integration tests\n│   └── Architecture/                   # ArchTest conventions\n│\n└── docs/                               # Backend-specific docs",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.projectStructure.section_8_title",
    "id": "sec_8"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.projectStructure.section_9_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "SCRIPE-Frontend/\n├── src/\n│   ├── app/                            # Next.js App Router (connectors only)\n│   │   ├── (auth)/                     # Auth pages (login, register)\n│   │   ├── (modules)/                  # Module pages (admin, docs, etc.)\n│   │   └── layout.tsx                  # Root layout with providers\n│   │\n│   ├── core/                           # Shared infrastructure\n│   │   ├── ui/                         # Shadcn components (Button, Input, etc.)\n│   │   ├── providers/                  # LanguageProvider, MainProvider\n│   │   ├── store/                      # Zustand stores (Auth, UI, Toast)\n│   │   ├── network/                    # API client, interceptors\n│   │   ├── locales/                    # i18n dictionaries (7 languages)\n│   │   └── common/                     # Result<T>, errors, constants\n│   │\n│   └── modules/                        # Feature modules (isolated)\n│       ├── auth/                       # Authentication module\n│       ├── admin/                      # Admin panel + sub-modules\n│       │   ├── dashboard/              # Dashboard stats\n│       │   ├── user-management/        # User CRUD\n│       │   ├── role-management/        # Role + permissions\n│       │   └── tenant-management/      # Multi-tenant admin\n│       ├── home/                       # Home/landing page\n│       └── docs/                       # Documentation portal (this)\n│\n└── public/                             # Static assets",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.projectStructure.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "getStarted.projectStructure.section_12_content"
  },
  {
    "type": "table",
    "headers": [
      "getStarted.projectStructure.section_13_hdr_0",
      "getStarted.projectStructure.section_13_hdr_1",
      "getStarted.projectStructure.section_13_hdr_2",
      "getStarted.projectStructure.section_13_hdr_3"
    ],
    "rows": [
      [
        "getStarted.projectStructure.section_13_cell_0_0",
        "getStarted.projectStructure.section_13_cell_0_1",
        "getStarted.projectStructure.section_13_cell_0_2",
        "getStarted.projectStructure.section_13_cell_0_3"
      ],
      [
        "getStarted.projectStructure.section_13_cell_1_0",
        "getStarted.projectStructure.section_13_cell_1_1",
        "getStarted.projectStructure.section_13_cell_1_2",
        "getStarted.projectStructure.section_13_cell_1_3"
      ],
      [
        "getStarted.projectStructure.section_13_cell_2_0",
        "getStarted.projectStructure.section_13_cell_2_1",
        "getStarted.projectStructure.section_13_cell_2_2",
        "getStarted.projectStructure.section_13_cell_2_3"
      ],
      [
        "getStarted.projectStructure.section_13_cell_3_0",
        "getStarted.projectStructure.section_13_cell_3_1",
        "getStarted.projectStructure.section_13_cell_3_2",
        "getStarted.projectStructure.section_13_cell_3_3"
      ],
      [
        "getStarted.projectStructure.section_13_cell_4_0",
        "getStarted.projectStructure.section_13_cell_4_1",
        "getStarted.projectStructure.section_13_cell_4_2",
        "getStarted.projectStructure.section_13_cell_4_3"
      ],
      [
        "getStarted.projectStructure.section_13_cell_5_0",
        "getStarted.projectStructure.section_13_cell_5_1",
        "getStarted.projectStructure.section_13_cell_5_2",
        "getStarted.projectStructure.section_13_cell_5_3"
      ],
      [
        "getStarted.projectStructure.section_13_cell_6_0",
        "getStarted.projectStructure.section_13_cell_6_1",
        "getStarted.projectStructure.section_13_cell_6_2",
        "getStarted.projectStructure.section_13_cell_6_3"
      ],
      [
        "getStarted.projectStructure.section_13_cell_7_0",
        "getStarted.projectStructure.section_13_cell_7_1",
        "getStarted.projectStructure.section_13_cell_7_2",
        "getStarted.projectStructure.section_13_cell_7_3"
      ],
      [
        "getStarted.projectStructure.section_13_cell_8_0",
        "getStarted.projectStructure.section_13_cell_8_1",
        "getStarted.projectStructure.section_13_cell_8_2",
        "getStarted.projectStructure.section_13_cell_8_3"
      ],
      [
        "getStarted.projectStructure.section_13_cell_9_0",
        "getStarted.projectStructure.section_13_cell_9_1",
        "getStarted.projectStructure.section_13_cell_9_2",
        "getStarted.projectStructure.section_13_cell_9_3"
      ]
    ]
  },
  {
    "type": "table",
    "headers": [
      "getStarted.projectStructure.section_14_hdr_0",
      "getStarted.projectStructure.section_14_hdr_1"
    ],
    "rows": [
      [
        "getStarted.projectStructure.section_14_cell_0_0",
        "getStarted.projectStructure.section_14_cell_0_1"
      ],
      [
        "getStarted.projectStructure.section_14_cell_1_0",
        "getStarted.projectStructure.section_14_cell_1_1"
      ],
      [
        "getStarted.projectStructure.section_14_cell_2_0",
        "getStarted.projectStructure.section_14_cell_2_1"
      ]
    ]
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "getStarted.projectStructure.section_15_title",
    "contentKey": "getStarted.projectStructure.section_15_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "getStarted.projectStructure.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "getStarted.projectStructure.section_17_item_0",
      "getStarted.projectStructure.section_17_item_1"
    ]
  }
],
  relatedSlugs: [
  "get-started/overview",
  "architecture/modules"
],
  lastUpdated: "2026-06-09",
});
