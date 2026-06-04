import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.marketplace.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.marketplace.overview.infoTitle",
    contentKey: "modules.marketplace.overview.infoContent",
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplace.overview.whatIsTitle",
    id: "what-is-marketplace",
  },
  { type: "paragraph", contentKey: "modules.marketplace.overview.whatIsIntro" },
  {
    type: "feature-grid",
    columns: 2,
    items: [
      {
        icon: "ShoppingBag",
        titleKey: "modules.marketplace.overview.featureCatalog",
        descriptionKey: "modules.marketplace.overview.featureCatalogDesc",
      },
      {
        icon: "Send",
        titleKey: "modules.marketplace.overview.featureSubmissions",
        descriptionKey: "modules.marketplace.overview.featureSubmissionsDesc",
      },
      {
        icon: "CreditCard",
        titleKey: "modules.marketplace.overview.featureFinancials",
        descriptionKey: "modules.marketplace.overview.featureFinancialsDesc",
      },
      {
        icon: "Star",
        titleKey: "modules.marketplace.overview.featureReviews",
        descriptionKey: "modules.marketplace.overview.featureReviewsDesc",
      },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplace.overview.subModulesTitle",
    id: "sub-modules",
  },
  { type: "paragraph", contentKey: "modules.marketplace.overview.subModulesIntro" },
  {
    type: "flowchart",
    titleKey: "modules.marketplace.overview.subModulesTitle",
    direction: "vertical",
    nodes: [
      {
        id: "catalog",
        labelKey: "modules.marketplace.overview.sub1",
        descriptionKey: "modules.marketplace.overview.descCatalog",
        icon: "ShoppingBag",
      },
      {
        id: "submissions",
        labelKey: "modules.marketplace.overview.sub2",
        descriptionKey: "modules.marketplace.overview.descSubmissions",
        icon: "Send",
      },
      {
        id: "financials",
        labelKey: "modules.marketplace.overview.sub3",
        descriptionKey: "modules.marketplace.overview.descFinancials",
        icon: "CreditCard",
      },
      {
        id: "reviews",
        labelKey: "modules.marketplace.overview.sub4",
        descriptionKey: "modules.marketplace.overview.descReviews",
        icon: "Star",
      },
      {
        id: "entitlements",
        labelKey: "modules.marketplace.overview.descEnt",
        descriptionKey: "modules.marketplace.overview.descEntDesc",
        icon: "Lock",
      },
    ],
    connections: [
      { from: "submissions", to: "catalog", labelKey: "modules.marketplace.overview.conn1" },
      { from: "catalog", to: "financials", labelKey: "modules.marketplace.overview.conn2" },
      { from: "catalog", to: "reviews", labelKey: "modules.marketplace.overview.conn3" },
      { from: "entitlements", to: "catalog", labelKey: "modules.marketplace.overview.conn4" },
    ],
  },
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplace.overview.backendTitle",
    id: "backend-architecture",
  },
  { type: "paragraph", contentKey: "modules.marketplace.overview.backendIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "MarketplaceDbContext.cs",
    code: `public class MarketplaceDbContext : DbContext
{
    public DbSet<AppListing> AppListings { get; set; }
    public DbSet<AppCategory> AppCategories { get; set; }
    public DbSet<AppCategoryMapping> AppCategoryMappings { get; set; }
    public DbSet<AppPricing> AppPricings { get; set; }
    public DbSet<AppPurchase> AppPurchases { get; set; }
    public DbSet<AppScreenshot> AppScreenshots { get; set; }
    public DbSet<AppSubmission> AppSubmissions { get; set; }
    public DbSet<AppReview> AppReviews { get; set; }
    public DbSet<AppReviewReply> AppReviewReplies { get; set; }
    public DbSet<AppReviewTask> AppReviewTasks { get; set; }
    public DbSet<AppInstallCount> AppInstallCounts { get; set; }
    public DbSet<DeveloperProfile> DeveloperProfiles { get; set; }
    public DbSet<DeveloperPayout> DeveloperPayouts { get; set; }
}`,
    highlightLines: [3, 9, 10, 14, 15],
  },
  {
    type: "heading",
    level: 3,
    titleKey: "modules.marketplace.overview.cqrsTitle",
    id: "cqrs-pattern",
  },
  { type: "paragraph", contentKey: "modules.marketplace.overview.cqrsIntro" },
  {
    type: "table",
    headers: [
      "modules.marketplace.overview.cqrsType",
      "modules.marketplace.overview.cqrsExample",
      "modules.marketplace.overview.cqrsDesc",
    ],
    rows: [
      ["Command", "CreateDeveloperProfileCommand", "modules.marketplace.overview.cqrsDevProfile"],
      ["Command", "SubmitAppListingCommand", "modules.marketplace.overview.cqrsSubmitListing"],
      ["Command", "PurchaseAppCommand", "modules.marketplace.overview.cqrsPurchase"],
      ["Command", "SubmitAppReviewCommand", "modules.marketplace.overview.cqrsReview"],
      ["Query", "GetAppCatalogQuery", "modules.marketplace.overview.cqrsCatalogQuery"],
      ["Query", "GetAppDetailsQuery", "modules.marketplace.overview.cqrsDetailsQuery"],
      ["Query", "GetDeveloperEarningsQuery", "modules.marketplace.overview.cqrsEarningsQuery"],
    ],
  },
];

registerPage({
  slug: "modules/marketplace-overview",
  titleKey: "modules.marketplace.overview.title",
  descriptionKey: "modules.marketplace.overview.description",
  category: "modules",
  order: 4,
  sections,
  relatedSlugs: [
    "modules/marketplace-catalog",
    "modules/marketplace-submissions",
    "modules/marketplace-financials",
    "infrastructure/background-jobs",
  ],
  lastUpdated: "2026-06-04",
});
