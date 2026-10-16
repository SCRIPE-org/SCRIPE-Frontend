import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.partyKernel.relationships.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.partyKernel.relationships.infoTitle",
    contentKey: "modules.partyKernel.relationships.infoContent",
  },

  // ─── Graph Relationship Topology ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.relationships.graphTitle",
    id: "relationship-graph",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.relationships.graphDesc" },

  // ─── B2B Account Structures & Parental Guardianship ───────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.relationships.b2bTitle",
    id: "b2b-and-family-structures",
  },
  { type: "paragraph", contentKey: "modules.partyKernel.relationships.b2bDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.partyKernel.relationships.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/party-kernel/relationships",
        descriptionKey: "modules.partyKernel.relationships.apiList",
        auth: "Bearer JWT",
        permission: "parties.relationships.view",
      },
      {
        method: "POST",
        path: "/api/v1/party-kernel/relationships",
        descriptionKey: "modules.partyKernel.relationships.apiCreate",
        auth: "Bearer JWT",
        permission: "parties.relationships.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/party-kernel/relationship-graph",
  titleKey: "modules.partyKernel.relationships.title",
  descriptionKey: "modules.partyKernel.relationships.description",
  category: "module-party-kernel",
  order: 3,
  sections,
  relatedSlugs: ["modules/party-kernel-overview", "modules/party-kernel/polymorphic-model"],
  lastUpdated: "2026-10-03",
});
