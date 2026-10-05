import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.orgCore.governance.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.orgCore.governance.infoTitle",
    contentKey: "modules.orgCore.governance.infoContent",
  },

  // ─── Operational Delegation Across Branch Boundaries ──────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.orgCore.governance.delegationTitle",
    id: "branch-delegation",
  },
  { type: "paragraph", contentKey: "modules.orgCore.governance.delegationDesc" },

  // ─── Multi-Branch Tenancy Scopes & Data Boundaries ────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.orgCore.governance.scopesTitle",
    id: "tenancy-scopes",
  },
  { type: "paragraph", contentKey: "modules.orgCore.governance.scopesDesc" },
];

registerPage({
  slug: "modules/organization-core/cross-branch-governance",
  titleKey: "modules.orgCore.governance.title",
  descriptionKey: "modules.orgCore.governance.description",
  category: "module-organization-core",
  order: 3,
  sections,
  relatedSlugs: [
    "modules/organization-core-overview",
    "modules/organization-core/hierarchy-tree",
  ],
  lastUpdated: "2026-10-03",
});
