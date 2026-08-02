import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "commercial.entEditions.intro" },

  // ─── What Are Editions? ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.entEditions.whatTitle",
    id: "what-are-editions",
  },
  { type: "paragraph", contentKey: "commercial.entEditions.whatContent" },
  {
    type: "code",
    language: "json",
    filename: "Edition Example: Pro Plan",
    code: `{
  "name": "Pro",
  "scope": "System",
  "isDefault": false,
  "overflowEditionId": "enterprise-id",
  "features": [
    { "feature": "MaxUsers",     "value": "50" },
    { "feature": "ApiAccess",    "value": "true" },
    { "feature": "StorageGB",    "value": "100" },
    { "feature": "CustomDomain", "value": "true" },
    { "feature": "Priority",     "value": "Standard" }
  ]
}`,
  },

  // ─── System vs Retail ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "commercial.entEditions.scopeTitle",
    id: "edition-scoping",
  },
  {
    type: "table",
    headers: [
      "commercial.entEditions.tblScopeH1",
      "commercial.entEditions.tblScopeH2",
      "commercial.entEditions.tblScopeH3",
    ],
    rows: [
      [
        "commercial.entEditions.tblScopeR1C1",
        "commercial.entEditions.tblScopeR1C2",
        "commercial.entEditions.tblScopeR1C3",
      ],
      [
        "commercial.entEditions.tblScopeR2C1",
        "commercial.entEditions.tblScopeR2C2",
        "commercial.entEditions.tblScopeR2C3",
      ],
    ],
  },

  // ─── Overflow Editions ──────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.entEditions.overflowTitle", id: "overflow" },
  { type: "paragraph", contentKey: "commercial.entEditions.overflowContent" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "arrow-up",
        titleKey: "commercial.entEditions.overflowUpgrade",
        descriptionKey: "commercial.entEditions.overflowUpgradeDesc",
      },
      {
        icon: "alert-triangle",
        titleKey: "commercial.entEditions.overflowBlock",
        descriptionKey: "commercial.entEditions.overflowBlockDesc",
      },
    ],
  },

  // ─── Versioning & Rollouts ──────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.entEditions.versionTitle", id: "versioning" },
  { type: "paragraph", contentKey: "commercial.entEditions.versionContent" },
  {
    type: "table",
    headers: [
      "commercial.entEditions.tblRollH1",
      "commercial.entEditions.tblRollH2",
      "commercial.entEditions.tblRollH3",
    ],
    rows: [
      [
        "commercial.entEditions.tblRollR1C1",
        "commercial.entEditions.tblRollR1C2",
        "commercial.entEditions.tblRollR1C3",
      ],
      [
        "commercial.entEditions.tblRollR2C1",
        "commercial.entEditions.tblRollR2C2",
        "commercial.entEditions.tblRollR2C3",
      ],
      [
        "commercial.entEditions.tblRollR3C1",
        "commercial.entEditions.tblRollR3C2",
        "commercial.entEditions.tblRollR3C3",
      ],
    ],
  },

  // ─── API Endpoints ──────────────────────────────────────
  { type: "heading", level: 2, titleKey: "commercial.entEditions.apiTitle", id: "api" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/editions",
        descriptionKey: "List all editions",
        auth: "Required",
        permission: "Editions.View",
      },
      {
        method: "POST",
        path: "/api/editions",
        descriptionKey: "Create new edition",
        auth: "Required",
        permission: "Editions.Create",
      },
      {
        method: "PUT",
        path: "/api/editions/{id}",
        descriptionKey: "Update edition",
        auth: "Required",
        permission: "Editions.Update",
      },
      {
        method: "DELETE",
        path: "/api/editions/{id}",
        descriptionKey: "Delete edition",
        auth: "Required",
        permission: "Editions.Delete",
      },
      {
        method: "POST",
        path: "/api/editions/{id}/features",
        descriptionKey: "Set edition features",
        auth: "Required",
        permission: "Editions.Update",
      },
      {
        method: "POST",
        path: "/api/editions/{id}/versions",
        descriptionKey: "Create edition version",
        auth: "Required",
        permission: "Editions.Update",
      },
      {
        method: "POST",
        path: "/api/editions/{id}/versions/{vId}/apply",
        descriptionKey: "Apply version (rollout)",
        auth: "Required",
        permission: "Editions.Update",
      },
    ],
  },

  { type: "info", variant: "tip", contentKey: "commercial.entEditions.tip" },
];

registerPage({
  slug: "commercial/entitlements-editions",
  titleKey: "commercial.entEditions.title",
  descriptionKey: "commercial.entEditions.description",
  category: "commercial-modules",
  order: 2,
  sections,
  relatedSlugs: [
    "commercial/entitlements-overview",
    "commercial/entitlements-subscriptions",
    "commercial/licensing-model",
  ],
  lastUpdated: "2026-03-02",
});
