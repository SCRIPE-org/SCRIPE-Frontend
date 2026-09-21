import { describe, expect, it, vi } from "vitest";
import { CommercialPricingService } from "./CommercialPricingService";

describe("CommercialPricingService", () => {
  it("uses the authoritative CatalogPricing endpoints for configuration and quote calculation", async () => {
    const api = { get: vi.fn(), post: vi.fn() } as any;
    const service = new CommercialPricingService(api);

    await service.getResourceConfiguration("resource-1");
    await service.calculateQuote({
      offeringId: "offering-1", resourceId: "resource-1", partyId: "party-1", quantity: 1,
      requestedStartUtc: "2026-10-01T09:00:00Z", requestedEndUtc: "2026-10-01T10:00:00Z",
      currencyCode: "USD", expiresAtUtc: "2026-10-01T09:15:00Z", idempotencyKey: "quote-key",
    });

    expect(api.get).toHaveBeenCalledWith("/v1/catalog-pricing/resource-rental-prices/resource-1");
    expect(api.post).toHaveBeenCalledWith("/v1/catalog-pricing/price-quotes/calculate", expect.objectContaining({
      offeringId: "offering-1", schedulableResourceId: "resource-1", partyId: "party-1", idempotencyKey: "quote-key",
    }));
  });

  it("submits a resource rate through the explicit Catalog Pricing configuration command", async () => {
    const api = { get: vi.fn(), post: vi.fn() } as any;
    const input = {
      schedulableResourceId: "resource-1", displayName: "Court 1 standard rental", currencyCode: "EGP",
      unitPrice: 250, effectiveFromUtc: "2026-09-19T00:00:00Z", minDurationMinutes: 30,
      maxDurationMinutes: 180, incrementMinutes: 30, taxCategoryId: null, idempotencyKey: "price-config-1",
    };

    await new CommercialPricingService(api).configureResourcePrice(input);

    expect(api.post).toHaveBeenCalledWith("/v1/catalog-pricing/resource-rental-prices", input);
  });

  it("uses the dedicated privileged quote-override action with its audit reason", async () => {
    const api = { get: vi.fn(), post: vi.fn() } as any;
    const input = { adjustmentAmount: -20, reason: "approved concession", idempotencyKey: "override-1" };

    await new CommercialPricingService(api).overrideQuote("quote-1", input);

    expect(api.post).toHaveBeenCalledWith("/v1/catalog-pricing/price-quotes/quote-1/override", input);
  });

  it("uses CatalogPricing's tax-category configuration endpoint", async () => {
    const api = { get: vi.fn(), post: vi.fn() } as any;
    const service = new CommercialPricingService(api);
    const input = { name: "VAT", code: "VAT14", ratePercentage: .14, isInclusive: false };

    await service.getTaxCategories();
    await service.createTaxCategory(input);

    expect(api.get).toHaveBeenCalledWith("/v1/catalog-pricing/tax-categories");
    expect(api.post).toHaveBeenCalledWith("/v1/catalog-pricing/tax-categories", input);
  });
});
