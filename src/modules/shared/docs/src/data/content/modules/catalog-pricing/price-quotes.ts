import { registerPage } from "../../../repositories/DocsRepository";
import type { DocSection } from "../../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "modules.catalogPricing.priceQuotes.intro" },
  {
    type: "info",
    variant: "tip",
    titleKey: "modules.catalogPricing.priceQuotes.infoTitle",
    contentKey: "modules.catalogPricing.priceQuotes.infoContent",
  },

  // ─── Cryptographic Price Quote Seals ──────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.priceQuotes.sealsTitle",
    id: "cryptographic-seals",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.priceQuotes.sealsDesc" },
  {
    type: "code",
    language: "csharp",
    filename: "src/Modules/CatalogPricing/CatalogPricing.Domain/Entities/PriceQuote.cs",
    code: `public sealed class PriceQuote : TenantAggregateRoot
{
    public Guid QuotationReferenceId { get; private set; }
    public decimal SubtotalAmount { get; private set; }
    public decimal DiscountAmount { get; private set; }
    public decimal TaxAmount { get; private set; }
    public decimal FinalAmount { get; private set; }
    public string Currency { get; private set; } = "USD";
    public DateTimeOffset ExpiresAtUtc { get; private set; }
    public string CryptographicSignature { get; private set; } = string.Empty;

    public bool IsValidAt(DateTimeOffset timestamp) =>
        timestamp <= ExpiresAtUtc && !IsConsumed;
}`,
  },

  // ─── Quote Expiration & Verification Hand-off ─────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.priceQuotes.verificationTitle",
    id: "quote-verification",
  },
  { type: "paragraph", contentKey: "modules.catalogPricing.priceQuotes.verificationDesc" },

  // ─── API Reference Table ──────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "modules.catalogPricing.priceQuotes.apiTitle",
    id: "api-endpoints",
  },
  {
    type: "api-table",
    endpoints: [
      {
        method: "POST",
        path: "/api/v1/pricing/quotes/calculate",
        descriptionKey: "modules.catalogPricing.priceQuotes.apiCalculate",
        auth: "Bearer JWT",
        permission: "pricing.quotes.calculate",
      },
      {
        method: "GET",
        path: "/api/v1/pricing/quotes/{id}",
        descriptionKey: "modules.catalogPricing.priceQuotes.apiGet",
        auth: "Bearer JWT",
        permission: "pricing.quotes.view",
      },
    ],
  },
];

registerPage({
  slug: "modules/catalog-pricing/price-quotes",
  titleKey: "modules.catalogPricing.priceQuotes.title",
  descriptionKey: "modules.catalogPricing.priceQuotes.description",
  category: "module-catalog-pricing",
  order: 4,
  sections,
  relatedSlugs: [
    "modules/catalog-pricing-overview",
    "modules/catalog-pricing/rate-cards",
    "modules/venue/booking-workspace",
  ],
  lastUpdated: "2026-10-03",
});
