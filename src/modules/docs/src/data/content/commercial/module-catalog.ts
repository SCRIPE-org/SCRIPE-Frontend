import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.moduleCatalog.intro" },

  // ─── Core Modules ───────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.moduleCatalog.coreTitle", id: "core-modules" },
  { type: "paragraph", contentKey: "commercial.moduleCatalog.coreContent" },
  {
    type: "table",
    headers: [
      "commercial.moduleCatalog.tblCoreHeader1",
      "commercial.moduleCatalog.tblCoreHeader2",
      "commercial.moduleCatalog.tblCoreHeader3",
    ],
    rows: [
      [
        "commercial.moduleCatalog.tblCoreR1C1",
        "commercial.moduleCatalog.tblCoreR1C2",
        "commercial.moduleCatalog.tblCoreR1C3",
      ],
      [
        "commercial.moduleCatalog.tblCoreR2C1",
        "commercial.moduleCatalog.tblCoreR2C2",
        "commercial.moduleCatalog.tblCoreR2C3",
      ],
      [
        "commercial.moduleCatalog.tblCoreR3C1",
        "commercial.moduleCatalog.tblCoreR3C2",
        "commercial.moduleCatalog.tblCoreR3C3",
      ],
      [
        "commercial.moduleCatalog.tblCoreR4C1",
        "commercial.moduleCatalog.tblCoreR4C2",
        "commercial.moduleCatalog.tblCoreR4C3",
      ],
      [
        "commercial.moduleCatalog.tblCoreR5C1",
        "commercial.moduleCatalog.tblCoreR5C2",
        "commercial.moduleCatalog.tblCoreR5C3",
      ],
      [
        "commercial.moduleCatalog.tblCoreR6C1",
        "commercial.moduleCatalog.tblCoreR6C2",
        "commercial.moduleCatalog.tblCoreR6C3",
      ],
      [
        "commercial.moduleCatalog.tblCoreR7C1",
        "commercial.moduleCatalog.tblCoreR7C2",
        "commercial.moduleCatalog.tblCoreR7C3",
      ],
    ],
  },

  // ─── Communication Modules ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.moduleCatalog.commTitle",
    id: "communication",
  },
  {
    type: "table",
    headers: [
      "commercial.moduleCatalog.tblCommHeader1",
      "commercial.moduleCatalog.tblCommHeader2",
      "commercial.moduleCatalog.tblCommHeader3",
    ],
    rows: [
      [
        "commercial.moduleCatalog.tblCommR1C1",
        "commercial.moduleCatalog.tblCommR1C2",
        "commercial.moduleCatalog.tblCommR1C3",
      ],
      [
        "commercial.moduleCatalog.tblCommR2C1",
        "commercial.moduleCatalog.tblCommR2C2",
        "commercial.moduleCatalog.tblCommR2C3",
      ],
      [
        "commercial.moduleCatalog.tblCommR3C1",
        "commercial.moduleCatalog.tblCommR3C2",
        "commercial.moduleCatalog.tblCommR3C3",
      ],
      [
        "commercial.moduleCatalog.tblCommR4C1",
        "commercial.moduleCatalog.tblCommR4C2",
        "commercial.moduleCatalog.tblCommR4C3",
      ],
    ],
  },

  // ─── Data Management Modules ────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.moduleCatalog.dataTitle",
    id: "data-management",
  },
  {
    type: "table",
    headers: [
      "commercial.moduleCatalog.tblDataHeader1",
      "commercial.moduleCatalog.tblDataHeader2",
      "commercial.moduleCatalog.tblDataHeader3",
    ],
    rows: [
      [
        "commercial.moduleCatalog.tblDataR1C1",
        "commercial.moduleCatalog.tblDataR1C2",
        "commercial.moduleCatalog.tblDataR1C3",
      ],
      [
        "commercial.moduleCatalog.tblDataR2C1",
        "commercial.moduleCatalog.tblDataR2C2",
        "commercial.moduleCatalog.tblDataR2C3",
      ],
      [
        "commercial.moduleCatalog.tblDataR3C1",
        "commercial.moduleCatalog.tblDataR3C2",
        "commercial.moduleCatalog.tblDataR3C3",
      ],
      [
        "commercial.moduleCatalog.tblDataR4C1",
        "commercial.moduleCatalog.tblDataR4C2",
        "commercial.moduleCatalog.tblDataR4C3",
      ],
    ],
  },

  // ─── Business Modules ───────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.moduleCatalog.businessTitle", id: "business" },
  { type: "paragraph", contentKey: "commercial.moduleCatalog.businessContent" },
  { type: "info", variant: "tip", contentKey: "commercial.moduleCatalog.dbAgnosticTip" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "users",
        titleKey: "commercial.moduleCatalog.hrModule",
        descriptionKey: "commercial.moduleCatalog.hrModuleDesc",
      },
      {
        icon: "boxes",
        titleKey: "commercial.moduleCatalog.inventoryModule",
        descriptionKey: "commercial.moduleCatalog.inventoryModuleDesc",
      },
      {
        icon: "bar-chart",
        titleKey: "commercial.moduleCatalog.financeModule",
        descriptionKey: "commercial.moduleCatalog.financeModuleDesc",
      },
      {
        icon: "building",
        titleKey: "commercial.moduleCatalog.crmModule",
        descriptionKey: "commercial.moduleCatalog.crmModuleDesc",
      },
      {
        icon: "briefcase",
        titleKey: "commercial.moduleCatalog.projectModule",
        descriptionKey: "commercial.moduleCatalog.projectModuleDesc",
      },
      {
        icon: "book",
        titleKey: "commercial.moduleCatalog.customModule",
        descriptionKey: "commercial.moduleCatalog.customModuleDesc",
      },
    ],
  },

  // ─── Module Independence ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.moduleCatalog.independenceTitle",
    id: "independence",
  },
  { type: "paragraph", contentKey: "commercial.moduleCatalog.independenceContent" },
  {
    type: "code",
    language: "bash",
    filename: "Add a New Module in Seconds",
    code: `# Scaffold a complete module with SCRIPE CLI
scripe new-module --name "ProjectManagement"

# This generates:
# ├── Backend
# │   ├── Domain/       → Entities, interfaces, domain events
# │   ├── Application/  → Commands, queries, validators
# │   └── Infrastructure/ → Repos, EF config, DI
# ├── Frontend
# │   ├── domain/       → Zod schemas, repository interfaces
# │   ├── data/         → API repos, mappers, DTOs
# │   └── presentation/ → Views, ViewModels, components
# └── Auto-registered in DI and module registry`,
  },
];

registerPage({
  slug: "commercial/module-catalog",
  titleKey: "commercial.moduleCatalog.title",
  descriptionKey: "commercial.moduleCatalog.description",
  category: "commercial-platform",
  order: 2,
  sections,
  relatedSlugs: ["commercial/platform-architecture", "commercial/technology-stack"],
  lastUpdated: "2026-02-20",
});
