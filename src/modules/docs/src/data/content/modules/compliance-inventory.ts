import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.compliance.inventory.intro" },
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
}`
  }
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
