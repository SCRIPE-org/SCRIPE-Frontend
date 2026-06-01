import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "architecture.frontend.intro" },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.frontend.solidPatternTitle",
    id: "solid-pattern",
  },
  { type: "paragraph", contentKey: "architecture.frontend.solidPatternIntro" },
  {
    type: "table",
    headers: ["Principle", "Application in SCRIPE"],
    rows: [
      ["S — Single Responsibility", "Each ViewModel handles ONE concern (filter, stats, table)"],
      ["O — Open/Closed", "Base hooks extended via composition, not modification"],
      ["L — Liskov Substitution", "All ViewModels return consistent typed interfaces"],
      ["I — Interface Segregation", "Components receive only the props they need"],
      ["D — Dependency Inversion", "Views depend on ViewModel interfaces, not implementations"],
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.frontend.viewRulesTitle",
    id: "view-rules",
  },
  {
    type: "comparison",
    columns: [
      {
        titleKey: "architecture.frontend.viewDo",
        variant: "positive",
        items: [
          "Max ~60 lines of JSX",
          "Zero useState, zero useEffect",
          "Only destructures props from ViewModel",
          "Returns JSX with component composition",
          "Imports section components for layout",
        ],
      },
      {
        titleKey: "architecture.frontend.viewDont",
        variant: "negative",
        items: [
          "No business logic in views",
          "No API calls or data transformations",
          "No direct state management",
          "No inline styles with logic",
          "No conditional data fetching",
        ],
      },
    ],
  },
  {
    type: "heading",
    level: 3,
    titleKey: "architecture.frontend.viewExampleTitle",
    id: "view-example",
  },
  {
    type: "code",
    language: "typescript",
    filename: "UserManagementView.tsx — Pure UI View",
    code: `'use client';

export function UserManagementView() {
  const vm = useUserManagementViewModel();

  return (
    <div>
      <h1>{vm.title}</h1>
      <FilterSection {...vm.filters} />
      <StatisticsSection {...vm.statistics} />
      <GenericCrudView {...vm.table} columns={vm.columns} />
    </div>
  );
}
// ~15 lines. Views are this short. Always.`,
    highlightLines: [4, 8, 9, 10],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.frontend.viewModelRulesTitle",
    id: "viewmodel-rules",
  },
  { type: "paragraph", contentKey: "architecture.frontend.viewModelRulesIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "useUserManagementViewModel.ts — Orchestrator",
    code: `export function useUserManagementViewModel() {
  // Compose section ViewModels (Single Responsibility)
  const statistics = useStatisticsViewModel();
  const filters = useFilterViewModel();
  const table = useCrudViewModel(crudConfig);
  const blockAction = useBlockUserAction();

  // Columns defined HERE, not in View or Component
  const columns = useMemo(() => [
    column.index("No"),
    column.text("name", "Name"),
    column.text("email", "Email"),
    column.status("status", "Status", statusMap),
    column.switch("block", "Block", blockAction),
    column.date("createdAt", "Created", { locale: "en-GB" }),
  ], [blockAction]);

  return {
    title: t("userManagement.title"),
    statistics,
    filters,
    table,
    columns,
  };
}`,
    highlightLines: [3, 4, 5, 6, 9],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.frontend.moduleStructureTitle",
    id: "module-structure",
  },
  {
    type: "code",
    language: "text",
    filename: "Standard Frontend Module Structure",
    code: `module/
├── di.ts                     # Module DI Container
├── index.ts                  # Public API exports
└── src/
    ├── domain/               # Business Logic (Pure TypeScript)
    │   ├── entities/         # Zod schemas + business rules
    │   └── interfaces/       # Repository contracts
    │
    ├── data/                 # Data Access Layer
    │   ├── models/           # API DTOs (raw response shapes)
    │   ├── mappers/          # DTO ↔ Entity transformations
    │   └── repositories/     # Interface implementations
    │
    └── presentation/         # UI Layer (SOLID Pattern)
        ├── viewmodels/       # Section ViewModels + Orchestrator
        ├── views/            # Pure UI Pages (~60 lines max)
        └── components/       # Section Components`,
  },
  {
    type: "heading",
    level: 2,
    titleKey: "architecture.frontend.connectorPatternTitle",
    id: "connector-pattern",
  },
  { type: "paragraph", contentKey: "architecture.frontend.connectorPatternIntro" },
  {
    type: "tabs",
    tabs: [
      {
        label: "page.tsx (Server Connector)",
        language: "typescript",
        code: `// src/app/(modules)/admin/user-management/page.tsx
import { Metadata } from 'next';
import { UserManagementView } from '@modules/admin/user-management';

export const metadata: Metadata = {
  title: 'User Management | SCRIPE',
};

export default function Page() {
  return <UserManagementView />;
}
// That's it. Server component. No logic. Just connects.`,
      },
      {
        label: "View.tsx (Client Component)",
        language: "typescript",
        code: `// src/modules/admin/user-management/src/presentation/views/UserManagementView.tsx
'use client';

export function UserManagementView() {
  const vm = useUserManagementViewModel();
  // ... pure JSX composition
}`,
      },
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "architecture.frontend.connectorWarning",
  },
];

registerPage({
  slug: "architecture/frontend",
  titleKey: "architecture.frontend.title",
  descriptionKey: "architecture.frontend.description",
  category: "architecture",
  order: 3,
  sections,
  relatedSlugs: [
    "architecture/overview",
    "architecture/solid-pattern",
    "architecture/state-management",
  ],
  lastUpdated: "2026-02-19",
});
