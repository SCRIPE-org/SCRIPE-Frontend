import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  // ─── Introduction ────────────────────────────────────────────
  { type: "paragraph", contentKey: "modules.marketplacePurchases.intro" },

  // ─── AppPricing Entity ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplacePurchases.pricingTitle",
    id: "app-pricing",
  },
  { type: "paragraph", contentKey: "modules.marketplacePurchases.pricingIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["AppListingId", "Guid", "FK to the app listing this pricing belongs to"],
      [
        "Model",
        "PricingModel",
        "The pricing model (Free, PaidOnce, Subscription, Freemium, PerSeat, UsageBased)",
      ],
      ["Price", "decimal", "Base price in the specified currency (0 for free apps)"],
      ["Currency", "string", 'ISO 4217 currency code for the price (e.g. "USD")'],
      ["TrialDays", "int", "Number of trial days before payment is required (0 = no trial)"],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "modules.marketplacePurchases.pricingNote",
  },

  // ─── AppPurchase Entity ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplacePurchases.purchaseTitle",
    id: "app-purchase",
  },
  { type: "paragraph", contentKey: "modules.marketplacePurchases.purchaseIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["AppListingId", "Guid", "FK to the purchased app listing"],
      ["TenantId", "Guid", "Tenant that made the purchase"],
      ["PurchaseDate", "DateTime", "UTC date and time when the purchase was completed"],
      ["AmountPaid", "decimal", "Total amount charged (after any discounts or trials)"],
      ["Currency", "string", 'ISO 4217 currency code (e.g. "USD", "EUR")'],
      ["Status", "string", "Payment status (Completed, Refunded, Pending)"],
    ],
  },

  // ─── AppInstallCount Entity ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplacePurchases.installCountTitle",
    id: "app-install-count",
  },
  { type: "paragraph", contentKey: "modules.marketplacePurchases.installCountIntro" },
  {
    type: "table",
    headers: ["Field", "Type", "Description"],
    rows: [
      ["Id", "Guid", "Primary key"],
      ["AppListingId", "Guid", "FK to the app listing being tracked"],
      ["Date", "DateTime", "The date this snapshot represents (UTC, time component = 00:00:00)"],
      ["NetInstalls", "int", "Net new installs on this date (installs minus uninstalls)"],
      ["TotalActiveInstalls", "int", "Total number of active installations as of end-of-day"],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "modules.marketplacePurchases.installCountTip",
  },

  // ─── Purchase Flowchart ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.marketplacePurchases.flowTitle",
    id: "purchase-flow",
  },
  { type: "paragraph", contentKey: "modules.marketplacePurchases.flowIntro" },
  {
    type: "flowchart",
    direction: "horizontal",
    nodes: [
      { id: "browse", label: "Browse Catalog", type: "default" },
      { id: "trial", label: "Start Trial", type: "info" },
      { id: "checkout", label: "Checkout", type: "warning" },
      { id: "paid", label: "Purchase Recorded", type: "success" },
      { id: "install", label: "Plugin Installed", type: "success" },
      { id: "count", label: "Install Count Updated", type: "default" },
    ],
    connections: [
      { from: "browse", to: "trial", label: "free trial" },
      { from: "browse", to: "checkout", label: "paid app" },
      { from: "trial", to: "checkout", label: "trial expires" },
      { from: "checkout", to: "paid", label: "payment success" },
      { from: "paid", to: "install", label: "triggers install" },
      { from: "install", to: "count", label: "daily snapshot" },
    ],
  },
];

registerPage({
  slug: "modules/marketplace/app-purchases",
  titleKey: "modules.marketplacePurchases.title",
  descriptionKey: "modules.marketplacePurchases.description",
  category: "modules",
  order: 73,
  sections,
  relatedSlugs: [
    "modules/marketplace/marketplace-overview",
    "modules/marketplace/developer-portal",
    "modules/marketplace/app-listings",
  ],
  lastUpdated: "2026-06-29",
});
