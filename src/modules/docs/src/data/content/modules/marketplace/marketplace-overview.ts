import { registerPage } from "../../../repositories/DocsRepository";

registerPage({
  slug: "modules/marketplace-overview",
  titleKey: "modules.marketplace..overview.title",
  category: "modules",
  order: 4,
  sections: [
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_0_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_1_content"
  },
  {
    "type": "info",
    "variant": "note",
    "titleKey": "modules.marketplace..overview.section_2_title",
    "contentKey": "modules.marketplace..overview.section_2_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.marketplace..overview.section_3_title",
    "id": "sec_3"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_4_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.marketplace..overview.section_5_title",
    "id": "sec_5"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_6_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.marketplace..overview.section_7_title",
    "id": "sec_7"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_8_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.marketplace..overview.section_9_title",
    "id": "sec_9"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_10_content"
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.marketplace..overview.section_11_title",
    "id": "sec_11"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_12_content"
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.marketplace..overview.section_13_title",
    "id": "sec_13"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_14_content"
  },
  {
    "type": "code",
    "language": "mermaid",
    "code": "graph TD\n    catalog[\"App Listings & Catalog\"]\n    %% catalog: Manages global app details, tags, and category structures.\n    submissions[\"Submission Lifecycle\"]\n    %% submissions: Orchestrates sandbox reviews, versioning, and status transitions.\n    financials[\"Financial Clearing\"]\n    %% financials: Calculates platform commission, developer balances, and payouts.\n    reviews[\"Reviews & Ratings\"]\n    %% reviews: Handles user reviews, abuse reports, and developer responses.\n    entitlements[\"Entitlements Gate\"]\n    %% entitlements: Validates tenant edition limits and licensing during installations.\n    submissions -->|\"Publishes approved apps\"| catalog\n    catalog -->|\"Clears payments\"| financials\n    catalog -->|\"Rates listed apps\"| reviews\n    entitlements -->|\"Checks quotas\"| catalog",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.marketplace..overview.section_16_title",
    "id": "sec_16"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_17_content"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_18_content"
  },
  {
    "type": "code",
    "language": "csharp",
    "code": "public class MarketplaceDbContext : DbContext\n{\n    public DbSet<AppListing> AppListings { get; set; }\n    public DbSet<AppCategory> AppCategories { get; set; }\n    public DbSet<AppCategoryMapping> AppCategoryMappings { get; set; }\n    public DbSet<AppPricing> AppPricings { get; set; }\n    public DbSet<AppPurchase> AppPurchases { get; set; }\n    public DbSet<AppScreenshot> AppScreenshots { get; set; }\n    public DbSet<AppSubmission> AppSubmissions { get; set; }\n    public DbSet<AppReview> AppReviews { get; set; }\n    public DbSet<AppReviewReply> AppReviewReplies { get; set; }\n    public DbSet<AppReviewTask> AppReviewTasks { get; set; }\n    public DbSet<AppInstallCount> AppInstallCounts { get; set; }\n    public DbSet<DeveloperProfile> DeveloperProfiles { get; set; }\n    public DbSet<DeveloperPayout> DeveloperPayouts { get; set; }\n}",
    "filename": ""
  },
  {
    "type": "heading",
    "level": 3,
    "titleKey": "modules.marketplace..overview.section_20_title",
    "id": "sec_20"
  },
  {
    "type": "paragraph",
    "contentKey": "modules.marketplace..overview.section_21_content"
  },
  {
    "type": "table",
    "headers": [
      "modules.marketplace..overview.section_22_hdr_0",
      "modules.marketplace..overview.section_22_hdr_1",
      "modules.marketplace..overview.section_22_hdr_2"
    ],
    "rows": [
      [
        "modules.marketplace..overview.section_22_cell_0_0",
        "modules.marketplace..overview.section_22_cell_0_1",
        "modules.marketplace..overview.section_22_cell_0_2"
      ],
      [
        "modules.marketplace..overview.section_22_cell_1_0",
        "modules.marketplace..overview.section_22_cell_1_1",
        "modules.marketplace..overview.section_22_cell_1_2"
      ],
      [
        "modules.marketplace..overview.section_22_cell_2_0",
        "modules.marketplace..overview.section_22_cell_2_1",
        "modules.marketplace..overview.section_22_cell_2_2"
      ],
      [
        "modules.marketplace..overview.section_22_cell_3_0",
        "modules.marketplace..overview.section_22_cell_3_1",
        "modules.marketplace..overview.section_22_cell_3_2"
      ],
      [
        "modules.marketplace..overview.section_22_cell_4_0",
        "modules.marketplace..overview.section_22_cell_4_1",
        "modules.marketplace..overview.section_22_cell_4_2"
      ],
      [
        "modules.marketplace..overview.section_22_cell_5_0",
        "modules.marketplace..overview.section_22_cell_5_1",
        "modules.marketplace..overview.section_22_cell_5_2"
      ],
      [
        "modules.marketplace..overview.section_22_cell_6_0",
        "modules.marketplace..overview.section_22_cell_6_1",
        "modules.marketplace..overview.section_22_cell_6_2"
      ]
    ]
  },
  {
    "type": "heading",
    "level": 2,
    "titleKey": "modules.marketplace..overview.section_23_title",
    "id": "sec_23"
  },
  {
    "type": "list",
    "variant": "unordered",
    "items": [
      "modules.marketplace..overview.section_24_item_0",
      "modules.marketplace..overview.section_24_item_1",
      "modules.marketplace..overview.section_24_item_2",
      "modules.marketplace..overview.section_24_item_3"
    ]
  }
],
  relatedSlugs: [
  "modules/marketplace-catalog",
  "modules/marketplace-submissions",
  "modules/marketplace-financials",
  "infrastructure/background-jobs"
],
  lastUpdated: "2026-06-09",
});
