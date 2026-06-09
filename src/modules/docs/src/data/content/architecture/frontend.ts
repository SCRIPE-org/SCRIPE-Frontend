import { registerPage } from "../../repositories/DocsRepository";

registerPage({
  slug: "architecture/frontend",
  titleKey: "architecture.frontend.title",
  category: "architecture",
  order: 3,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "architecture.frontend.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.frontend.section_1_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.frontend.section_2_title",
    "id": "sec_2"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.frontend.section_3_content"
  },
  {
    "type": "table",
    "headers": [
      "architecture.frontend.section_4_hdr_0",
      "architecture.frontend.section_4_hdr_1"
    ],
    "rows": [
      [
        "architecture.frontend.section_4_cell_0_0",
        "architecture.frontend.section_4_cell_0_1"
      ],
      [
        "architecture.frontend.section_4_cell_1_0",
        "architecture.frontend.section_4_cell_1_1"
      ],
      [
        "architecture.frontend.section_4_cell_2_0",
        "architecture.frontend.section_4_cell_2_1"
      ],
      [
        "architecture.frontend.section_4_cell_3_0",
        "architecture.frontend.section_4_cell_3_1"
      ],
      [
        "architecture.frontend.section_4_cell_4_0",
        "architecture.frontend.section_4_cell_4_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.frontend.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "table",
    "headers": [
      "architecture.frontend.section_6_hdr_0",
      "architecture.frontend.section_6_hdr_1"
    ],
    "rows": [
      [
        "architecture.frontend.section_6_cell_0_0",
        "architecture.frontend.section_6_cell_0_1"
      ],
      [
        "architecture.frontend.section_6_cell_1_0",
        "architecture.frontend.section_6_cell_1_1"
      ],
      [
        "architecture.frontend.section_6_cell_2_0",
        "architecture.frontend.section_6_cell_2_1"
      ],
      [
        "architecture.frontend.section_6_cell_3_0",
        "architecture.frontend.section_6_cell_3_1"
      ],
      [
        "architecture.frontend.section_6_cell_4_0",
        "architecture.frontend.section_6_cell_4_1"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "architecture.frontend.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.frontend.section_8_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "'use client';\n\nexport function UserManagementView() {\n  const vm = useUserManagementViewModel();\n\n  return (\n    <div>\n      <h1>{vm.title}</h1>\n      <FilterSection {...vm.filters} />\n      <StatisticsSection {...vm.statistics} />\n      <GenericCrudView {...vm.table} columns={vm.columns} />\n    </div>\n  );\n}\n// ~15 lines. Views are this short. Always.",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.frontend.section_10_title",
    "id": "sec_10"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.frontend.section_11_content"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.frontend.section_12_content"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "export function useUserManagementViewModel() {\n  // Compose section ViewModels (Single Responsibility)\n  const statistics = useStatisticsViewModel();\n  const filters = useFilterViewModel();\n  const table = useCrudViewModel(crudConfig);\n  const blockAction = useBlockUserAction();\n\n  // Columns defined HERE, not in View or Component\n  const columns = useMemo(() => [\n    column.index(\"No\"),\n    column.text(\"name\", \"Name\"),\n    column.text(\"email\", \"Email\"),\n    column.status(\"status\", \"Status\", statusMap),\n    column.switch(\"block\", \"Block\", blockAction),\n    column.date(\"createdAt\", \"Created\", { locale: \"en-GB\" }),\n  ], [blockAction]);\n\n  return {\n    title: t(\"userManagement.title\"),\n    statistics,\n    filters,\n    table,\n    columns,\n  };\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.frontend.section_14_title",
    "id": "sec_14"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.frontend.section_15_content"
  },
  {
    "type": "code",
    "language": "text",
    "code": "module/\n├── di.ts                     # Module DI Container\n├── index.ts                  # Public API exports\n└── src/\n    ├── domain/               # Business Logic (Pure TypeScript)\n    │   ├── entities/         # Zod schemas + business rules\n    │   └── interfaces/       # Repository contracts\n    │\n    ├── data/                 # Data Access Layer\n    │   ├── models/           # API DTOs (raw response shapes)\n    │   ├── mappers/          # DTO ↔ Entity transformations\n    │   └── repositories/     # Interface implementations\n    │\n    └── presentation/         # UI Layer (SOLID Pattern)\n        ├── viewmodels/       # Section ViewModels + Orchestrator\n        ├── views/            # Pure UI Pages (~60 lines max)\n        └── components/       # Section Components",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.frontend.section_17_title",
    "id": "sec_17"
  },
  {
    "type": "paragraph",
    "contentKey": "architecture.frontend.section_18_content"
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.frontend.section_19_title",
    "id": "sec_19"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// src/app/(modules)/admin/user-management/page.tsx\nimport { Metadata } from 'next';\nimport { UserManagementView } from '@modules/admin/user-management';\n\nexport const metadata: Metadata = {\n  title: 'User Management | SCRIPE',\n};\n\nexport default function Page() {\n  return <UserManagementView />;\n}\n// That's it. Server component. No logic. Just connects.",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 4,
    "titleKey": "architecture.frontend.section_21_title",
    "id": "sec_21"
  },
  {
    "type": "code",
    "language": "typescript",
    "code": "// src/modules/admin/user-management/src/presentation/views/UserManagementView.tsx\n'use client';\n\nexport function UserManagementView() {\n  const vm = useUserManagementViewModel();\n  // ... pure JSX composition\n}",
    "filename": ""
  },
  {
    "type": "info",
    "variant": "warning",
    "titleKey": "architecture.frontend.section_23_title",
    "contentKey": "architecture.frontend.section_23_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "architecture.frontend.section_24_title",
    "id": "sec_24"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "architecture.frontend.section_25_item_0",
      "architecture.frontend.section_25_item_1",
      "architecture.frontend.section_25_item_2"
    ]
  }
],
  relatedSlugs: [
  "architecture/overview",
  "architecture/solid-pattern",
  "architecture/state-management"
],
  lastUpdated: "2026-06-09",
});
