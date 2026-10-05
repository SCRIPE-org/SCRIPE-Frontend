import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.catalogPricing.overview.intro" },
  {
    type: "info",
    variant: "note",
    titleKey: "modules.catalogPricing.overview.infoTitle",
    contentKey: "modules.catalogPricing.overview.infoContent",
  },

  // ─── Architectural Overview ────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.overview.archTitle",
    id: "catalog-pricing-architecture",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.overview.archIntro" },
  {
    type: "feature-grid",
    columns: 3,
    items: [
      {
        icon: "Package",
        titleKey: "modules.catalogPricing.overview.featureCatalog",
        descriptionKey: "modules.catalogPricing.overview.featureCatalogDesc",
      },
      {
        icon: "BookOpen",
        titleKey: "modules.catalogPricing.overview.featurePriceBooks",
        descriptionKey: "modules.catalogPricing.overview.featurePriceBooksDesc",
      },
      {
        icon: "TrendingUp",
        titleKey: "modules.catalogPricing.overview.featureDynamicPricing",
        descriptionKey: "modules.catalogPricing.overview.featureDynamicPricingDesc",
      },
      {
        icon: "Percent",
        titleKey: "modules.catalogPricing.overview.featureDiscounts",
        descriptionKey: "modules.catalogPricing.overview.featureDiscountsDesc",
      },
      {
        icon: "FileText",
        titleKey: "modules.catalogPricing.overview.featureQuotes",
        descriptionKey: "modules.catalogPricing.overview.featureQuotesDesc",
      },
      {
        icon: "ShieldCheck",
        titleKey: "modules.catalogPricing.overview.featureAgreements",
        descriptionKey: "modules.catalogPricing.overview.featureAgreementsDesc",
      },
    ],
  },

  // ─── Domain Model & Entities ──────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.overview.modelTitle",
    id: "domain-entities",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.overview.modelIntro" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/CatalogPricing/CatalogPricing.Domain/Entities/PriceQuote.cs",
    code: `public sealed class PriceQuote : TenantAggregateRoot
{
    public Guid OfferingId { get; private set; }
    public Guid PriceBookVersionId { get; private set; }
    public string Currency { get; private set; } = "USD";
    public decimal SubtotalAmount { get; private set; }
    public decimal TotalDiscountAmount { get; private set; }
    public decimal TotalTaxAmount { get; private set; }
    public decimal GrandTotalAmount { get; private set; }
    public PriceQuoteStatus Status { get; private set; }
    public DateTimeOffset ExpiresAtUtc { get; private set; }
    public List<PriceQuoteLine> Lines { get; private set; } = new();

    public void ApplyCustomerAgreement(CustomerAgreementRate agreement)
    {
        // Custom negotiated rate calculation logic
        GrandTotalAmount = agreement.CalculateNegotiatedTotal(SubtotalAmount);
        RaiseDomainEvent(new PriceQuoteRecalculatedDomainEvent(Id, TenantId, GrandTotalAmount));
    }
}`,
  },

  // ─── Multi-Tier Pricing Resolution Engine ────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.overview.pricingFlowTitle",
    id: "pricing-resolution-engine",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.overview.pricingFlowIntro" },
  {
    type: "flowchart",
    direction: "vertical",
    nodes: [
      { id: "A", label: "Quotation Requested with Target Offerings & Quantity", type: "default" },
      { id: "B", label: "Check Customer Agreement Rate overrides (VIP / Negotiated)", type: "primary" },
      { id: "C", label: "Locate Active Price Book Version by Effective Date & Currency", type: "info" },
      { id: "D", label: "Calculate Base Item Subtotals & Rental Multipliers", type: "default" },
      { id: "E", label: "Evaluate Stackable Discount Rules & Promotional Coupons", type: "warning" },
      { id: "F", label: "Compute Jurisdictional Taxes via Tax Categories", type: "info" },
      { id: "G", label: "Freeze PriceSnapshot with Immutable Line Item Hash", type: "success" },
    ],
    connections: [
      { from: "A", to: "B" },
      { from: "B", to: "C" },
      { from: "C", to: "D" },
      { from: "D", to: "E" },
      { from: "E", to: "F" },
      { from: "F", to: "G" },
    ],
  },

  // ─── API Reference ────────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.overview.apiTitle",
    id: "api-endpoints",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.overview.apiIntro" },
  {
    type: "api-table",
    endpoints: [
      {
        method: "GET",
        path: "/api/v1/catalog-pricing/catalog-items",
        descriptionKey: "modules.catalogPricing.api.listItems",
        auth: "Bearer JWT",
        permission: "catalog-pricing.items.view",
      },
      {
        method: "POST",
        path: "/api/v1/catalog-pricing/catalog-items",
        descriptionKey: "modules.catalogPricing.api.createItem",
        auth: "Bearer JWT",
        permission: "catalog-pricing.items.create",
      },
      {
        method: "GET",
        path: "/api/v1/catalog-pricing/offerings",
        descriptionKey: "modules.catalogPricing.api.listOfferings",
        auth: "Bearer JWT",
        permission: "catalog-pricing.offerings.view",
      },
      {
        method: "GET",
        path: "/api/v1/catalog-pricing/price-books",
        descriptionKey: "modules.catalogPricing.api.listPriceBooks",
        auth: "Bearer JWT",
        permission: "catalog-pricing.price-books.view",
      },
      {
        method: "POST",
        path: "/api/v1/catalog-pricing/price-quotes/calculate",
        descriptionKey: "modules.catalogPricing.api.calculateQuote",
        auth: "Bearer JWT",
        permission: "catalog-pricing.quotes.create",
      },
      {
        method: "POST",
        path: "/api/v1/catalog-pricing/price-quotes",
        descriptionKey: "modules.catalogPricing.api.createQuote",
        auth: "Bearer JWT",
        permission: "catalog-pricing.quotes.create",
      },
    ],
  },
];

registerPage({
  slug: "modules/catalog-pricing-overview",
  titleKey: "modules.catalogPricing.overview.title",
  descriptionKey: "modules.catalogPricing.overview.description",
  category: "modules",
  order: 2.2,
  sections,
  relatedSlugs: [
    "modules/venue-overview",
    "modules/finance-overview",
    "modules/entitlements-overview",
  ],
  lastUpdated: "2026-10-03",
});
