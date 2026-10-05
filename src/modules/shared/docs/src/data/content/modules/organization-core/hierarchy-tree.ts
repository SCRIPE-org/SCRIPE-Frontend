import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.orgCore.hierarchy.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.orgCore.hierarchy.infoTitle",
    contentKey: "modules.orgCore.hierarchy.infoContent",
  },

  // ─── 5-Tier Organizational Hierarchy Model ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.orgCore.hierarchy.treeTitle",
    id: "five-tier-tree",
  },
  { type: "paragraph", contentKey: "modules.orgCore.hierarchy.treeDesc" },
  {
    type: "code",
    language: "text",
    filename: "5-Tier Organizational Hierarchy Structure",
    code: `Level 1: Legal Entity [Acme Holding Corp, Delaware LLC]
└── Level 2: Branch [Europe Regional Hub - London]
    └── Level 3: Department [Sports & Athletics Facilities]
        └── Level 4: Business Unit [Olympic Stadium Complex]
            └── Level 5: Operational Team [Groundskeeping & Court Prep]`,
  },

  // ─── Legal Entity Consolidation & Fiscal Reporting ────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.orgCore.hierarchy.fiscalTitle",
    id: "fiscal-consolidation",
  },
  { type: "paragraph", contentKey: "modules.orgCore.hierarchy.fiscalDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.orgCore.hierarchy.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/organization-core/branches",
        descriptionKey: "modules.orgCore.hierarchy.apiBranches",
        auth: "Bearer JWT",
        permission: "org.branches.view",
      },
      {
        method: "POST",
        path: "/api/v1/organization-core/legal-entities",
        descriptionKey: "modules.orgCore.hierarchy.apiEntities",
        auth: "Bearer JWT",
        permission: "org.entities.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/organization-core/hierarchy-tree",
  titleKey: "modules.orgCore.hierarchy.title",
  descriptionKey: "modules.orgCore.hierarchy.description",
  category: "module-organization-core",
  order: 2,
  sections,
  relatedSlugs: [
    "modules/organization-core-overview",
    "modules/organization-core/cross-branch-governance",
  ],
  lastUpdated: "2026-10-03",
});
