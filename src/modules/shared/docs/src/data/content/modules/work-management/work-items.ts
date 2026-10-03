import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.workManagement.items.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.workManagement.items.infoTitle",
    contentKey: "modules.workManagement.items.infoContent",
  },

  // ─── Work Item Hierarchy: Epics, Features, Tasks & Bugs ───────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.items.hierarchyTitle",
    id: "work-item-hierarchy",
  },
  { type: "paragraph", contentKey: "modules.workManagement.items.hierarchyDesc" },

  // ─── Custom Fields & Dynamic Metadata Binding ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.items.customFieldsTitle",
    id: "custom-fields-binding",
  },
  { type: "paragraph", contentKey: "modules.workManagement.items.customFieldsDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.workManagement.items.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/work-management/work-items",
        descriptionKey: "modules.workManagement.items.apiList",
        auth: "Bearer JWT",
        permission: "work.items.view",
      },
      {
        method: "POST",
        path: "/api/v1/work-management/work-items",
        descriptionKey: "modules.workManagement.items.apiCreate",
        auth: "Bearer JWT",
        permission: "work.items.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/work-management/work-items",
  titleKey: "modules.workManagement.items.title",
  descriptionKey: "modules.workManagement.items.description",
  category: "module-work-management",
  order: 2,
  sections,
  relatedSlugs: [
    "modules/work-management/work-management-overview",
    "modules/work-management/boards-workflows",
    "modules/work-management/sla-automation",
  ],
  lastUpdated: "2026-10-03",
});
