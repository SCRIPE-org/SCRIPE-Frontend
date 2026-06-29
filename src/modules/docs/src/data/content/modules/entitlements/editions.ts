// FILE-EXCEPTION: file length
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
      ["Id", "Guid", "Primary key (auto-generated)"],
      ["Name", "string", "Unique internal slug per platform (e.g. 'general-free', 'general-pro')"],
      ["DisplayNameEn / DisplayNameAr", "string?", "Localized display titles shown in UI and pricing pages"],
      ["Description", "string?", "Marketing description for the edition"],
      ["Tagline", "string?", "Short marketing tagline (e.g. 'Best for growing teams')"],
      ["RecommendationLabels", "string?", "JSON array of badge labels (e.g. ['Best Value', 'Most Popular'])"],
      ["TierLevel", "int", "Hierarchical level (0 = Free, 1+ = premium) — used for upgrade/downgrade logic"],
      ["IsSystem", "bool", "true = system-defined platform plan. false = reseller-defined retail plan"],
      ["IsRetired", "bool", "When true, no new tenant assignments allowed (soft retirement)"],
      ["EditionCategoryId", "Guid?", "Optional grouping for the plan picker UI on the signup flow"],
      ["FallbackEditionId", "Guid?", "Downgrade target on subscription expiry. Null = tenant is suspended"],
      ["OverflowPolicy", "OverflowPolicy enum", "Block | Warn | Allow — governs behavior when resource counts exceed new limits after downgrade"],
      ["AllowMonthly / AllowYearly / AllowLifetime / AllowTrial", "bool", "Billing cycle toggles — controls which billing modes are available for this edition"],
      ["IsSelfServiceEnabled", "bool", "When true, tenants can self-subscribe via Stripe Checkout. False = sales-assisted only"],
      ["IsContactSalesOnly", "bool", "Enterprise plans where no Stripe Checkout is presented — sales contact required"],
      ["IsFree", "bool (computed)", "Derived: true when no billing cycles AND no trial AND IsContactSalesOnly is false"],
      ["TrialDurationDays", "int", "Length of the trial period in days (0 = no trial). Range: 1–730"],
      ["TrialIsFree", "bool", "true = 100% free trial. false = discounted trial (see TrialDiscountPercent)"],
      ["TrialDiscountPercent", "int", "Discount during trial (0–100). Only meaningful when TrialIsFree = false"],
      ["GracePeriodDays", "int", "Days after payment failure before subscription is suspended"],
      ["MaxActiveSubscriptions", "int", "Global capacity cap for this edition. -1 = unlimited"],
      ["CurrentVersion", "int", "Auto-incremented version number — incremented each time features are published"],
      ["ConnectCommissionRate", "decimal?", "Stripe Connect platform commission rate. Null = use global default"],
      ["StripeProductId", "string?", "Stripe product catalog ID — null until first sync"],
      ["CreatedAt / UpdatedAt", "DateTime", "Audit timestamps"],
    ],
  },
  {
    type: "code",
    language: "csharp",
    filename: "Edition.cs (Domain Entity — simplified)",
    code: `public class Edition : AuditableEntity<Guid>
{
    public string Name { get; set; } = null!;           // internal slug (e.g. "basic", "pro")
    public string? DisplayNameEn { get; set; }          // localized display name
    public string? DisplayNameAr { get; set; }
    public string? Description { get; set; }
    public string? Tagline { get; set; }                // short marketing tagline
    public string? RecommendationLabels { get; set; }   // JSON badge labels (e.g. ["Best Value"])
    public int TierLevel { get; set; }                  // 0 = Free, 1+ = premium
    public bool IsSystem { get; set; }
    public bool IsRetired { get; set; }                 // no new assignments allowed
    public Guid? EditionCategoryId { get; set; }        // grouping for signup plan picker
    public Guid? FallbackEditionId { get; set; }
    public OverflowPolicy OverflowPolicy { get; set; } = OverflowPolicy.Block;

    // Billing Toggles
    public bool AllowMonthly { get; set; } = true;
    public bool AllowYearly { get; set; } = true;
    public bool AllowLifetime { get; set; } = true;
    public bool AllowTrial { get; set; } = true;
    public bool IsSelfServiceEnabled { get; set; } = true;
    public bool IsContactSalesOnly { get; set; }

    // Computed: free when no billing types enabled
    public bool IsFree => !AllowTrial && !AllowMonthly && !AllowYearly && !AllowLifetime && !IsContactSalesOnly;

    // Trial Configuration
    [Range(1, 730)]
    public int TrialDurationDays { get; set; } = 14;
    public bool TrialIsFree { get; set; } = true;
    [Range(0, 100)]
    public int TrialDiscountPercent { get; set; } = 100;  // int, not decimal

    public int GracePeriodDays { get; set; } = 0;
    public int MaxActiveSubscriptions { get; set; } = -1;  // -1 = unlimited
    public int CurrentVersion { get; set; } = 1;
    public decimal? ConnectCommissionRate { get; set; }    // Stripe Connect commission (null = global default)
    public string? StripeProductId { get; set; }           // null until first catalog sync

    public virtual ICollection<EditionFeature> Features { get; set; } = new List<EditionFeature>();
    public virtual ICollection<EditionPrice> Prices { get; set; } = new List<EditionPrice>();
    public virtual ICollection<EditionVersion> Versions { get; set; } = new List<EditionVersion>();
    public ICollection<EditionPromotion> Promotions { get; set; } = new List<EditionPromotion>();
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
  {
    type: "heading",
    level: 2,
    titleKey: "modules.editions.seededTitle",
    id: "seeded-editions",
  },
  {
    type: "paragraph",
    contentKey: "modules.editions.seededIntro",
  },
  {
    type: "table",
    headers: ["Edition", "Description", "Included Features & Limits"],
    rows: [
      [
        "Free",
        "TierLevel = 0. Default fallback plan for all tenants upon subscription expiry. Permanent $0 plan.",
        "5 Admins, 3 Roles, 1 User Group, 0 child tenants, 256MB storage, 10MB upload limit. Two-Factor Authentication and External Auth are disabled.",
      ],
      [
        "Standard",
        "TierLevel = 1. Premium plan enabling advanced administrative and organization capabilities.",
        "50 Admins, 10 Roles, 5 User Groups, 5 child tenants, 5GB storage, 25MB upload limit. Two-Factor Authentication and External Auth are enabled.",
      ],
    ],
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
