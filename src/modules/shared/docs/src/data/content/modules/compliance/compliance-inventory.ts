import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.compliance.inventory.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.compliance.inventory.infoTitle",
    contentKey: "modules.compliance.inventory.infoContent",
  },

  // ─── Discovery & Mapping Flow ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.inventory.flowTitle",
    id: "discovery-flow",
  },
  { type: "paragraph", contentKey: "modules.compliance.inventory.flowIntro" },
  {
    type: "flowchart",
    titleKey: "modules.compliance.inventory.flowTitle",
    direction: "vertical",
    nodes: [
      {
        id: "module_seed",
        labelKey: "modules.compliance.inventory.nodeSeed",
        type: "primary",
        descriptionKey: "modules.compliance.inventory.descSeed",
      },
      {
        id: "discover",
        labelKey: "modules.compliance.inventory.nodeDiscover",
        type: "info",
        descriptionKey: "modules.compliance.inventory.descDiscover",
      },
      {
        id: "matching",
        labelKey: "modules.compliance.inventory.nodeMatching",
        type: "warning",
        descriptionKey: "modules.compliance.inventory.descMatching",
      },
      {
        id: "classify",
        labelKey: "modules.compliance.inventory.nodeClassify",
        type: "info",
        descriptionKey: "modules.compliance.inventory.descClassify",
      },
      {
        id: "legal_basis",
        labelKey: "modules.compliance.inventory.nodeLegal",
        type: "primary",
        descriptionKey: "modules.compliance.inventory.descLegal",
      },
      {
        id: "policy_link",
        labelKey: "modules.compliance.inventory.nodeLink",
        type: "warning",
        descriptionKey: "modules.compliance.inventory.descLink",
      },
      {
        id: "ropa",
        labelKey: "modules.compliance.inventory.nodeRopa",
        type: "success",
        descriptionKey: "modules.compliance.inventory.descRopa",
      },
      {
        id: "export",
        labelKey: "modules.compliance.inventory.nodeExport",
        type: "success",
        descriptionKey: "modules.compliance.inventory.descExport",
      },
    ],
    connections: [
      {
        from: "module_seed",
        to: "discover",
        labelKey: "modules.compliance.inventory.connSeedDiscover",
      },
      {
        from: "discover",
        to: "matching",
        labelKey: "modules.compliance.inventory.connDiscoverMatching",
      },
      {
        from: "matching",
        to: "classify",
        labelKey: "modules.compliance.inventory.connMatchingClassify",
      },
      {
        from: "classify",
        to: "legal_basis",
        labelKey: "modules.compliance.inventory.connClassifyLegal",
      },
      {
        from: "legal_basis",
        to: "policy_link",
        labelKey: "modules.compliance.inventory.connLegalLink",
      },
      { from: "policy_link", to: "ropa", labelKey: "modules.compliance.inventory.connLinkRopa" },
      { from: "ropa", to: "export", labelKey: "modules.compliance.inventory.connRopaExport" },
    ],
  },

  // ─── Sensitivity Levels ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.inventory.sensitivityTitle",
    id: "sensitivity",
  },
  { type: "paragraph", contentKey: "modules.compliance.inventory.sensitivityIntro" },
  {
    type: "table",
    headers: [
      "modules.compliance.inventory.sensLevel",
      "modules.compliance.inventory.sensDesc",
      "modules.compliance.inventory.sensExamples",
    ],
    rows: [
      [
        "Public",
        "modules.compliance.inventory.sensPublicDesc",
        "modules.compliance.inventory.sensPublicEx",
      ],
      [
        "Internal",
        "modules.compliance.inventory.sensInternalDesc",
        "modules.compliance.inventory.sensInternalEx",
      ],
      [
        "Confidential",
        "modules.compliance.inventory.sensConfDesc",
        "modules.compliance.inventory.sensConfEx",
      ],
      [
        "Restricted",
        "modules.compliance.inventory.sensRestDesc",
        "modules.compliance.inventory.sensRestEx",
      ],
    ],
  },

  // ─── Entity Structure ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.inventory.structureTitle",
    id: "inventory-structure",
  },
  { type: "paragraph", contentKey: "modules.compliance.inventory.structureIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "DataInventoryItem.cs",
    code: `public class DataInventoryItem : AuditableEntity<Guid>
{
    public Guid? TenantId { get; set; }

    [Required, MaxLength(100)]
    public string ModuleName { get; set; } = null!;

    [Required, MaxLength(200)]
    public string EntityName { get; set; } = null!;

    [Required, MaxLength(200)]
    public string FieldName { get; set; } = null!;

    [MaxLength(1000)]
    public string? Description { get; set; }

    [MaxLength(2000)]
    public string? Note { get; set; }

    [MaxLength(100)]
    public string DataCategory { get; set; } = "Identity";

    public bool IsAnonymizedOnErasure { get; set; } = true;

    public bool IsIncludedInExport { get; set; } = true;

    [MaxLength(100)]
    public string LegalBasis { get; set; } = "contract";

    public new bool IsActive { get; set; } = true;
}`,
  },

  // ─── Entity Reference ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.inventory.entitiesTitle",
    id: "entities",
  },
  {
    type: "table",
    headers: [
      "modules.compliance.inventory.field",
      "modules.compliance.inventory.type",
      "modules.compliance.inventory.description",
    ],
    rows: [
      ["TenantId", "Guid?", "modules.compliance.inventory.fTenantId"],
      ["ModuleName", "String", "modules.compliance.inventory.fModuleName"],
      ["EntityName", "String", "modules.compliance.inventory.fEntityName"],
      ["FieldName", "String", "modules.compliance.inventory.fFieldName"],
      ["Description", "String?", "modules.compliance.inventory.fDescription"],
      ["Note", "String?", "modules.compliance.inventory.fNote"],
      ["DataCategory", "String", "modules.compliance.inventory.fDataCategory"],
      ["IsAnonymizedOnErasure", "Boolean", "modules.compliance.inventory.fIsAnonymizedOnErasure"],
      ["IsIncludedInExport", "Boolean", "modules.compliance.inventory.fIsIncludedInExport"],
      ["LegalBasis", "String", "modules.compliance.inventory.fLegalBasis"],
      ["IsActive", "Boolean", "modules.compliance.inventory.fIsActive"],
    ],
  },

  // ─── API Endpoints ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.compliance.inventory.endpointsTitle",
    id: "endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/compliance/data-inventory",
        descriptionKey: "modules.compliance.inventory.epList",
        auth: "AdminOnly",
        permission: "compliance_data_inventory.view",
      },
      {
        method: "POST",
        path: "/api/v1/compliance/data-inventory",
        descriptionKey: "modules.compliance.inventory.epCreate",
        auth: "AdminOnly",
        permission: "compliance_data_inventory.manage",
      },
      {
        method: "PUT",
        path: "/api/v1/compliance/data-inventory/{id}",
        descriptionKey: "modules.compliance.inventory.epUpdate",
        auth: "AdminOnly",
        permission: "compliance_data_inventory.manage",
      },
    ],
  },
];

registerPage({
  slug: "modules/compliance-inventory",
  titleKey: "modules.compliance.inventory.title",
  descriptionKey: "modules.compliance.inventory.description",
  category: "modules",
  order: 5,
  sections,
  relatedSlugs: ["modules/compliance-overview"],
  lastUpdated: "2026-06-28",
});
