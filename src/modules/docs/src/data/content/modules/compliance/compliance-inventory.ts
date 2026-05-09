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
    public Guid TenantId { get; set; }
    
    // E.g., "Users", "Invoices", "AuditLogs"
    [MaxLength(200)]
    public string EntityName { get; set; } = null!;
    
    // E.g., "Email", "IP Address"
    [MaxLength(200)]
    public string FieldName { get; set; } = null!;
    
    public SensitivityLevel Sensitivity { get; set; }
    
    // Identifies the system or module that owns this data
    [MaxLength(200)]
    public string StorageSystem { get; set; } = null!;
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
      ["EntityName", "String", "modules.compliance.inventory.fEntityName"],
      ["FieldName", "String", "modules.compliance.inventory.fFieldName"],
      ["Sensitivity", "Enum", "modules.compliance.inventory.fSensitivity"],
      ["StorageSystem", "String", "modules.compliance.inventory.fStorageSystem"],
      ["LegalBasis", "String", "modules.compliance.inventory.fLegalBasis"],
      ["RetentionPolicyId", "Guid?", "modules.compliance.inventory.fRetentionId"],
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
  lastUpdated: "2026-05-03",
});
