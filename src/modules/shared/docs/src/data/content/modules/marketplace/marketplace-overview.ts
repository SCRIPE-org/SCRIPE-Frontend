import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Hero Introduction ──────────────────────────────────────
  { type: "paragraph", contentKey: "modules.marketplaceOverview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.marketplaceOverview.infoTitle",
    contentKey: "modules.marketplaceOverview.infoContent",
  },
  {
    type: "table",
    headers: ["Marketplace Area", "Current Status", "Truth Boundary"],
    rows: [
      [
        "Listings, categories, developer profiles, submissions, and reviews",
        "Backend entities and APIs exist",
        "Operationally useful but still needs production hardening",
      ],
      [
        "Purchases and pricing",
        "Backend model exists",
        "Do not claim complete production commerce without payment and payout verification",
      ],
      [
        "Developer payouts",
        "Simulated payout handler still exists",
        "Not production-ready settlement",
      ],
      ["Plugin ecosystem", "Depends on Plugins module", "No claim of arbitrary-code sandboxing"],
    ],
  },

  // ─── Feature Grid ────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceOverview.featuresTitle",
    id: "key-capabilities",
  },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Store",
        titleKey: "modules.marketplaceOverview.featurePublish",
        descriptionKey: "modules.marketplaceOverview.featurePublishDesc",
      },
      {
        icon: "Download",
        titleKey: "modules.marketplaceOverview.featureInstall",
        descriptionKey: "modules.marketplaceOverview.featureInstallDesc",
      },
      {
        icon: "Star",
        titleKey: "modules.marketplaceOverview.featureReview",
        descriptionKey: "modules.marketplaceOverview.featureReviewDesc",
      },
      {
        icon: "DollarSign",
        titleKey: "modules.marketplaceOverview.featurePricing",
        descriptionKey: "modules.marketplaceOverview.featurePricingDesc",
      },
      {
        icon: "BarChart2",
        titleKey: "modules.marketplaceOverview.featureAnalytics",
        descriptionKey: "modules.marketplaceOverview.featureAnalyticsDesc",
      },
      {
        icon: "Shield",
        titleKey: "modules.marketplaceOverview.featureReviewGate",
        descriptionKey: "modules.marketplaceOverview.featureReviewGateDesc",
      },
    ],
  },

  // ─── Entity Map ──────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceOverview.entitiesTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.marketplaceOverview.entitiesIntro" },
  {
    type: "table",
    headers: ["Entity", "Base", "Purpose"],
    rows: [
      [
        "AppListing",
        "AuditableEntity<Guid>",
        "Central storefront record linking a PluginDefinition to its commercial presence",
      ],
      [
        "AppCategory",
        "AuditableEntity<Guid>",
        'Bilingual category tag organizing listings (e.g. "Productivity")',
      ],
      [
        "AppCategoryMapping",
        "AuditableEntity<Guid>",
        "Many-to-many join between AppListing and AppCategory",
      ],
      [
        "AppScreenshot",
        "AuditableEntity<Guid>",
        "Ordered gallery image for a listing's detail page",
      ],
      [
        "AppSubmission",
        "AuditableEntity<Guid>",
        "Version submission entering the admin review pipeline",
      ],
      [
        "AppPricing",
        "AuditableEntity<Guid>",
        "Pricing model, amount, currency, and trial period for a listing",
      ],
      ["AppPurchase", "AuditableEntity<Guid>", "Transaction record when a tenant buys a paid app"],
      [
        "AppInstallCount",
        "AuditableEntity<Guid>",
        "Daily install-metric snapshot for analytics dashboards",
      ],
      ["AppReview", "AuditableEntity<Guid>", "User 1–5 star rating with headline and content body"],
      ["AppReviewReply", "AuditableEntity<Guid>", "Developer's single reply to a user review"],
      [
        "AppReviewTask",
        "AuditableEntity<Guid>",
        "Admin task tracking the review pipeline for a submission",
      ],
      ["DeveloperProfile", "AuditableEntity<Guid>", "Tenant registered as a marketplace publisher"],
      [
        "DeveloperPayout",
        "AuditableEntity<Guid>",
        "Revenue-sharing payout record per billing period",
      ],
    ],
  },

  // ─── AppCategory Entity ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceOverview.categoryTitle",
    id: "app-category",
  },
  { type: "paragraph", contentKey: "modules.marketplaceOverview.categoryIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["NameEn", "string", "Category name in English"],
      ["NameAr", "string", "Category name in Arabic"],
      ["Slug", "string", 'URL-safe slug for storefront routes (e.g. "productivity")'],
      ["Icon", "string", "Icon identifier or CSS class for the category badge"],
      ["Description", "string", "Short description of what this category covers"],
      ["SortOrder", "int", "Display order in the category navigation (lower = first)"],
    ],
  },

  // ─── AppCategoryMapping Entity ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceOverview.mappingTitle",
    id: "app-category-mapping",
  },
  { type: "paragraph", contentKey: "modules.marketplaceOverview.mappingIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["AppListingId", "Guid", "Foreign key to the app listing"],
      ["AppCategoryId", "Guid", "Foreign key to the category"],
    ],
  },

  // ─── Architecture Flowchart ──────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplaceOverview.architectureTitle",
    id: "marketplace-architecture",
  },
  { type: "paragraph", contentKey: "modules.marketplaceOverview.architectureIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "dev", label: "Developer Profile", type: "primary" },
      { id: "listing", label: "App Listing", type: "primary" },
      { id: "category", label: "App Category", type: "default" },
      { id: "mapping", label: "Category Mapping", type: "default" },
      { id: "submission", label: "App Submission", type: "warning" },
      { id: "pricing", label: "App Pricing", type: "info" },
      { id: "purchase", label: "App Purchase", type: "success" },
      { id: "review", label: "App Review", type: "info" },
    ],
    connections: [
      { from: "dev", to: "listing", label: "publishes" },
      { from: "listing", to: "mapping", label: "has categories" },
      { from: "mapping", to: "category", label: "belongs to" },
      { from: "listing", to: "submission", label: "submits version" },
      { from: "listing", to: "pricing", label: "priced by" },
      { from: "listing", to: "purchase", label: "purchased via" },
      { from: "listing", to: "review", label: "reviewed with" },
    ],
  },
];

registerPage({
  slug: "modules/marketplace/marketplace-overview",
  titleKey: "modules.marketplaceOverview.title",
  descriptionKey: "modules.marketplaceOverview.description",
  category: "modules",
  order: 70,
  sections,
  relatedSlugs: [
    "modules/marketplace/app-listings",
    "modules/marketplace/developer-portal",
    "modules/plugins-overview",
  ],
  lastUpdated: "2026-06-29",
});
