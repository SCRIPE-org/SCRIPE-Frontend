import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Intro ────────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.editions2.intro" },

  // ─── Edition Entity ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions2.entityTitle",
    id: "edition-entity",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Entitlements.Domain/Entities/Edition.cs",
    code: `public class Edition : AuditableEntity
{
    public string Name { get; set; } = string.Empty;            // "Starter", "Growth", "Enterprise"
    public string DisplayNameEn { get; set; } = string.Empty;   // Human-readable (English)
    public string DisplayNameAr { get; set; } = string.Empty;   // Human-readable (Arabic)
    public string? Description { get; set; }
    public bool IsSystemEdition { get; set; }                    // Platform-level vs reseller retail
    public bool IsDefault { get; set; }                          // Auto-assigned to new free tenants
    public int DisplayOrder { get; set; }

    // Navigation — features in this edition
    public virtual ICollection<EditionFeature> EditionFeatures { get; set; } = new List<EditionFeature>();
    public virtual ICollection<TenantSubscription> Subscriptions { get; set; } = new List<TenantSubscription>();
}`,
  },

  // ─── Feature Value Types ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions2.featureValueTypesTitle",
    id: "feature-value-types",
  },
  {
    type: "table",
    headers: ["ValueType", "Storage Format", "Usage Example", "Special Values"],
    rows: [
      ["Boolean", "\"true\" / \"false\"", "SSO enabled, API access", "None"],
      ["Numeric", "Integer as string", "MaxAdminsPerTenant, MaxStorage (MB)", "-1 = unlimited"],
      ["String", "Any string value", "StorageBackend, SupportLevel", "Provider-specific"],
    ],
  },

  // ─── Resolution Chain ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions2.resolutionTitle",
    id: "resolution-chain",
  },
  { type: "paragraph", contentKey: "modules.editions2.resolutionContent" },
  {
    type: "flowchart",
    title: "Feature Value Resolution Chain",
    direction: "vertical",
    nodes: [
      { id: "n1", label: "Request for Feature Value", type: "default" },
      { id: "n2", label: "TenantFeatureOverride exists?", type: "warning" },
      { id: "n3", label: "Return Override Value", type: "success" },
      { id: "n4", label: "EditionFeature exists?", type: "warning" },
      { id: "n5", label: "Return Edition Value", type: "success" },
      { id: "n6", label: "Return Feature.DefaultValue", type: "info" },
    ],
    connections: [
      { from: "n1", to: "n2" },
      { from: "n2", to: "n3", label: "yes" },
      { from: "n2", to: "n4", label: "no" },
      { from: "n4", to: "n5", label: "yes" },
      { from: "n4", to: "n6", label: "no" },
    ],
  },

  // ─── Adding Features to Editions ──────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions2.addingFeaturesTitle",
    id: "adding-features",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Entitlements.Infrastructure/Seeders/EditionFeatureSeeder.cs",
    code: `// Example: Seeding a feature value into an edition
var enterpriseEdition = await _editionRepository.GetByNameAsync("Enterprise", ct);
var maxAdminsFeature = await _featureRepository.GetByNameAsync("Identity.MaxAdminsPerTenant", ct);

var editionFeature = new EditionFeature
{
    EditionId = enterpriseEdition.Id,
    FeatureId = maxAdminsFeature.Id,
    Value = "500",   // Enterprise gets 500 admins; -1 = unlimited
};

await _editionFeatureRepository.AddAsync(editionFeature, ct);
await _unitOfWork.SaveChangesAsync(ct);

// After seeding, invalidate the feature cache so all tenants
// on this edition get the new value immediately
await _featureCache.InvalidateForEditionAsync(enterpriseEdition.Id, ct);`,
  },

  // ─── Multi-Subscription Merge Rules ──────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions2.mergeRulesTitle",
    id: "merge-rules",
  },
  {
    type: "table",
    headers: ["ValueType", "Merge Rule", "Example"],
    rows: [
      ["Boolean", "OR — true wins", "SSO: true if any subscription enables it"],
      ["Numeric", "MAX — highest wins; -1 = unlimited", "MaxUsers: 200 if one subscription says 200, another says 50"],
      ["String", "First active subscription wins (Base > Trial > AddOn)", "StorageBackend: first active subscription's value"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.editions2.overrideTip",
  },
];

registerPage({
  slug: "modules/editions",
  titleKey: "modules.editions2.title",
  descriptionKey: "modules.editions2.description",
  category: "modules",
  order: 16,
  sections,
  relatedSlugs: ["modules/subscriptions", "architecture/cross-module-collaboration"],
  lastUpdated: "2026-06-28",
});
