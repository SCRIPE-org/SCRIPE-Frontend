import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Introduction ────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.marketplaceListings.intro" },

  // ─── AppListing Entity ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceListings.listingTitle",
    id: "app-listing",
  },
  { type: "paragraph", contentKey: "modules.marketplaceListings.listingIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["PluginId", "Guid", "FK to the Plugin module's PluginDefinition this listing represents"],
      ["DeveloperProfileId", "Guid", "FK to the developer who published this listing"],
      ["Name", "string", "Display name of the application in the storefront"],
      ["Tagline", "string", "Short tagline displayed below the app name (max 300 chars)"],
      ["Description", "string", "Full rich-text description of the app's features and capabilities"],
      ["IconUrl", "string", "URL to the app's icon image displayed in the catalog grid"],
      ["Version", "string", "Semantic version string of the currently listed version (e.g. \"1.2.0\")"],
      ["IsPublished", "bool", "Whether this listing is visible in the public storefront"],
      ["IsFeatured", "bool", "Whether this listing is promoted in the featured/hero section"],
      ["WithdrawalReason", "string?", "Reason provided when the listing was withdrawn (null if still active)"],
      ["AverageRating", "decimal", "Denormalized average rating (1.0–5.0), recalculated on each review change"],
      ["ReviewCount", "int", "Denormalized total number of user reviews"],
      ["TotalInstalls", "int", "Cumulative number of installations across all tenants"],
      ["ActiveInstalls", "int", "Number of tenants currently using (not uninstalled) this app"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.marketplaceListings.listingNote",
  },

  // ─── AppListing Code ─────────────────────────────────────────
  {
    type: "heading",
    level: 3,
    titleKey: "modules.marketplaceListings.codeTitle",
    id: "listing-entity-code",
  },
  {
    type: "code",
    language: "csharp",
    filename: "Marketplace.Domain/Entities/AppListing.cs",
    code: `public class AppListing : AuditableEntity<Guid>
{
    public Guid PluginId { get; set; }
    public Guid DeveloperProfileId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Tagline { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string IconUrl { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public bool IsPublished { get; set; }
    public bool IsFeatured { get; set; }
    public string? WithdrawalReason { get; set; }
    public decimal AverageRating { get; set; }
    public int ReviewCount { get; set; }
    public int TotalInstalls { get; set; }
    public int ActiveInstalls { get; set; }

    public virtual DeveloperProfile DeveloperProfile { get; set; } = default!;
    public virtual AppPricing? Pricing { get; set; }
    public virtual ICollection<AppCategoryMapping> CategoryMappings { get; set; } = new List<AppCategoryMapping>();
    public virtual ICollection<AppScreenshot> Screenshots { get; set; } = new List<AppScreenshot>();
    public virtual ICollection<AppReview> Reviews { get; set; } = new List<AppReview>();
    public virtual ICollection<AppSubmission> Submissions { get; set; } = new List<AppSubmission>();
    public virtual ICollection<AppPurchase> Purchases { get; set; } = new List<AppPurchase>();
    public virtual ICollection<AppInstallCount> InstallCounts { get; set; } = new List<AppInstallCount>();
}`,
  },

  // ─── AppScreenshot Entity ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceListings.screenshotTitle",
    id: "app-screenshot",
  },
  { type: "paragraph", contentKey: "modules.marketplaceListings.screenshotIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["AppListingId", "Guid", "FK to the app listing this screenshot belongs to"],
      ["ImageUrl", "string", "URL to the screenshot image file"],
      ["Caption", "string", "Alt-text / caption displayed below the screenshot"],
      ["SortOrder", "int", "Display order in the screenshot carousel (lower = first)"],
    ],
  },

  // ─── Status Lifecycle Flowchart ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceListings.statusTitle",
    id: "listing-status-lifecycle",
  },
  { type: "paragraph", contentKey: "modules.marketplaceListings.statusIntro" },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "draft", label: "Draft", type: "default" },
      { id: "submitted", label: "Submitted", type: "warning" },
      { id: "review", label: "In Review", type: "warning" },
      { id: "published", label: "Published", type: "success" },
      { id: "featured", label: "Featured", type: "primary" },
      { id: "withdrawn", label: "Withdrawn", type: "danger" },
    ],
    connections: [
      { from: "draft", to: "submitted", label: "developer submits" },
      { from: "submitted", to: "review", label: "admin assigns" },
      { from: "review", to: "published", label: "approved" },
      { from: "published", to: "featured", label: "admin promotes" },
      { from: "published", to: "withdrawn", label: "developer withdraws" },
      { from: "review", to: "draft", label: "rejected" },
    ],
  },
];

registerPage({
  slug: "modules/marketplace/app-listings",
  titleKey: "modules.marketplaceListings.title",
  descriptionKey: "modules.marketplaceListings.description",
  category: "modules",
  order: 71,
  sections,
  relatedSlugs: [
    "modules/marketplace/marketplace-overview",
    "modules/marketplace/developer-portal",
    "modules/marketplace/ratings-reviews",
  ],
  lastUpdated: "2026-06-29",
});
