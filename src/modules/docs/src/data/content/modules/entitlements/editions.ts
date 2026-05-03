import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  {
    type: "paragraph",
    contentKey: "modules.editions.intro",
  },

  // ─── Edition Entity ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions.entityTitle",
    id: "edition-entity",
  },
  {
    type: "paragraph",
    contentKey: "modules.editions.entityIntro",
  },
  {
    type: "table",
    headers: ["Property", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["Name", "string", "Display name (e.g. 'Pro', 'Enterprise')"],
      ["Description", "string?", "Human-readable description of the plan"],
      ["IsSystemEdition", "bool", "true = created by platform admin, false = retail edition"],
      ["CreatedByTenantId", "Guid?", "If retail edition, the tenant that created it"],
      ["OverflowPolicy", "enum", "What happens on downgrade: Block, Warn, Allow"],
      ["IsActive", "bool", "Whether the edition can be subscribed to"],
      ["Price", "decimal?", "Optional pricing for display purposes"],
      ["BillingCycle", "string?", "Monthly, Annual, Lifetime, Custom"],
      ["MaxTenants", "int?", "Maximum tenants that can subscribe (-1 = unlimited)"],
      ["SortOrder", "int", "Display order in edition list"],
      ["CreatedAt", "DateTime", "When the edition was created"],
      ["UpdatedAt", "DateTime?", "When the edition was last modified"],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Edition Entity",
    code: `public class Edition : AuditableEntity, ISoftDeletable
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsSystemEdition { get; set; } = true;
    public Guid? CreatedByTenantId { get; set; }
    public OverflowPolicy OverflowPolicy { get; set; } = OverflowPolicy.Warn;
    public bool IsActive { get; set; } = true;
    public decimal? Price { get; set; }
    public string? BillingCycle { get; set; }
    public int? MaxTenants { get; set; }
    public int SortOrder { get; set; }

    // Navigation properties
    public ICollection<EditionFeature> Features { get; set; } = [];
    public ICollection<EditionVersion> Versions { get; set; } = [];
    public ICollection<TenantSubscription> Subscriptions { get; set; } = [];
}`,
  },

  // ─── System vs Retail Editions ─────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions.scopingTitle",
    id: "scoping",
  },
  {
    type: "paragraph",
    contentKey: "modules.editions.scopingIntro",
  },
  {
    type: "table",
    headers: ["Type", "Created By", "Visible To", "Can Subscribe", "Use Case"],
    rows: [
      [
        "System Edition",
        "Platform SuperAdmin",
        "All tenants",
        "Any tenant",
        "Standard platform plans (Basic, Pro, Enterprise)",
      ],
      [
        "Retail Edition",
        "Reseller tenant",
        "Creator + child tenants",
        "Child tenants only",
        "Reseller creating custom plans for sub-tenants",
      ],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.editions.scopingNote",
  },

  // ─── Overflow Policy ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions.overflowTitle",
    id: "overflow-policy",
  },
  {
    type: "paragraph",
    contentKey: "modules.editions.overflowIntro",
  },
  {
    type: "table",
    headers: ["Policy", "Behavior", "When to Use"],
    rows: [
      [
        "Block",
        "Prevents downgrade if any feature would overflow. Returns 409 Conflict with details.",
        "Strict enforcement — tenant must clean up first",
      ],
      [
        "Warn",
        "Allows the downgrade but logs a warning. Existing resources above the new limit continue to work, but new ones are blocked.",
        "Soft enforcement — graceful transition period",
      ],
      [
        "Allow",
        "Silently allows the downgrade. No restrictions on existing resources.",
        "Lenient — existing resources are grandfathered",
      ],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "OverflowPolicy Enum",
    code: `public enum OverflowPolicy
{
    /// <summary>Block downgrade if any resource exceeds the new limit</summary>
    Block = 0,
    
    /// <summary>Allow downgrade but warn; existing resources grandfathered</summary>
    Warn = 1,
    
    /// <summary>Silently allow downgrade; no enforcement on existing data</summary>
    Allow = 2,
}`,
  },

  // ─── Edition Features ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions.featuresTitle",
    id: "edition-features",
  },
  {
    type: "paragraph",
    contentKey: "modules.editions.featuresIntro",
  },
  {
    type: "table",
    headers: ["Property", "Type", "Description"],
    rows: [
      ["EditionId", "Guid", "FK to the parent Edition"],
      ["FeatureId", "Guid", "FK to the Feature being configured"],
      ["Value", "string", "The feature value for this edition (interpreted by Feature.ValueType)"],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "EditionFeature Entity",
    code: `public class EditionFeature
{
    public Guid EditionId { get; set; }
    public Edition Edition { get; set; } = null!;
    
    public Guid FeatureId { get; set; }
    public Feature Feature { get; set; } = null!;
    
    public string Value { get; set; } = string.Empty;
    // Interpreted as: bool (Boolean), int (Numeric), or string (String)
}`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.editions.featuresTip",
  },

  // ─── Edition Versions ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions.versionsTitle",
    id: "edition-versions",
  },
  {
    type: "paragraph",
    contentKey: "modules.editions.versionsIntro",
  },
  {
    type: "table",
    headers: ["Property", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Version identifier"],
      ["EditionId", "Guid", "FK to parent Edition"],
      ["VersionNumber", "int", "Auto-incrementing version number (1, 2, 3...)"],
      ["FeaturesSnapshot", "JSON", "Complete snapshot of all feature values at this version"],
      ["ChangeNotes", "string?", "Description of what changed"],
      ["RolloutStrategy", "enum", "How to deploy: Immediate, Gradual, Manual"],
      ["Status", "enum", "Draft, Published, RolledBack"],
      ["PublishedAt", "DateTime?", "When the version was published"],
      ["PublishedBy", "Guid?", "Who published the version"],
      ["CreatedAt", "DateTime", "When the version was created"],
    ],
  },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "draft", label: "Draft", description: "Created, not applied" },
      { id: "pub", label: "Published", description: "Applied to subscribers" },
      { id: "rb", label: "Rolled Back", description: "Reverted to previous" },
    ],
    connections: [
      { from: "draft", to: "pub", label: "Publish" },
      { from: "pub", to: "rb", label: "Rollback" },
    ],
  },

  // ─── Rollout Strategies ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions.rolloutTitle",
    id: "rollout-strategies",
  },
  {
    type: "paragraph",
    contentKey: "modules.editions.rolloutIntro",
  },
  {
    type: "table",
    headers: ["Strategy", "Behavior", "Use Case"],
    rows: [
      [
        "Immediate",
        "All subscribed tenants receive the new feature values instantly upon publish",
        "Urgent fixes, security patches, small changes",
      ],
      [
        "Gradual",
        "Tenants are migrated in batches (configurable batch size and delay)",
        "Large changes where you want to monitor impact",
      ],
      [
        "Manual",
        "Tenants must be manually assigned the new version via API",
        "Controlled rollouts, beta programs, VIP tenants first",
      ],
    ],
  },

  // ─── Apply Now vs Save as Version ─────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions.workflowTitle",
    id: "workflow",
  },
  {
    type: "paragraph",
    contentKey: "modules.editions.workflowIntro",
  },
  {
    type: "table",
    headers: ["", "Apply Now (Direct)", "Save as Version"],
    rows: [
      ["Speed", "Instant — changes take effect immediately", "Requires create → review → publish"],
      ["Audit Trail", "Logged as a single mutation", "Full version history with change notes"],
      ["Rollback", "Must manually revert changes", "One-click rollback to any previous version"],
      ["Rollout Control", "All-or-nothing", "Immediate, Gradual, or Manual per-tenant"],
      ["Best For", "Urgent fixes, small tweaks", "Major plan updates, feature launches"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.editions.workflowTip",
  },

  // ─── API Endpoints ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions.endpointsTitle",
    id: "api-endpoints",
  },
  {
    type: "paragraph",
    contentKey: "modules.editions.endpointsIntro",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/editions",
        descriptionKey: "modules.editions.endpointsList",
        auth: "JWT",
        permission: "editions.view",
      },
      {
        method: "GET",
        path: "/api/v1/editions/{id}",
        descriptionKey: "modules.editions.endpointsGet",
        auth: "JWT",
        permission: "editions.view",
      },
      {
        method: "POST",
        path: "/api/v1/editions",
        descriptionKey: "modules.editions.endpointsCreate",
        auth: "JWT",
        permission: "editions.create",
      },
      {
        method: "PUT",
        path: "/api/v1/editions/{id}",
        descriptionKey: "modules.editions.endpointsUpdate",
        auth: "JWT",
        permission: "editions.update",
      },
      {
        method: "DELETE",
        path: "/api/v1/editions/{id}",
        descriptionKey: "modules.editions.endpointsDelete",
        auth: "JWT",
        permission: "editions.delete",
      },
      {
        method: "GET",
        path: "/api/v1/editions/{id}/features",
        descriptionKey: "modules.editions.endpointsGetFeatures",
        auth: "JWT",
        permission: "editions.view",
      },
      {
        method: "PUT",
        path: "/api/v1/editions/{id}/features",
        descriptionKey: "modules.editions.endpointsSetFeatures",
        auth: "JWT",
        permission: "editions.update",
      },
      {
        method: "POST",
        path: "/api/v1/editions/{id}/features/apply",
        descriptionKey: "modules.editions.endpointsDirectApply",
        auth: "JWT",
        permission: "editions.update",
      },
      {
        method: "GET",
        path: "/api/v1/editions/{id}/versions",
        descriptionKey: "modules.editions.endpointsGetVersions",
        auth: "JWT",
        permission: "editions.view",
      },
      {
        method: "POST",
        path: "/api/v1/editions/{id}/versions",
        descriptionKey: "modules.editions.endpointsCreateVersion",
        auth: "JWT",
        permission: "editions.update",
      },
      {
        method: "POST",
        path: "/api/v1/editions/{id}/versions/{vId}/publish",
        descriptionKey: "modules.editions.endpointsPublishVersion",
        auth: "JWT",
        permission: "editions.update",
      },
    ],
  },
];

registerPage({
  slug: "modules/editions",
  titleKey: "modules.editions.title",
  descriptionKey: "modules.editions.description",
  category: "modules",
  order: 2,
  sections,
  relatedSlugs: ["modules/entitlements-overview", "modules/subscriptions", "modules/features"],
  lastUpdated: "2026-03-02",
});
