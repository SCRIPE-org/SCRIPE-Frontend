import type { IApiService } from "@core/interfaces/api.interface";
import type {
  CalculatePriceQuoteInput,
  ConfigureResourceRentalPriceInput,
  CreateTaxCategoryInput,
  OverridePriceQuoteInput,
  PriceQuote,
  PriceQuoteOverride,
  ResourceRentalPriceConfiguration,
  TaxCategory,
} from "../../domain/entities/CommercialPricing";
import type { ICommercialPricingService } from "../../domain/interfaces/ICommercialPricingService";
import { COMMERCIAL_PRICING_ENDPOINTS } from "./commercial-pricing.endpoints";

/** Transport-only adapter. CatalogPricing remains the sole price calculation authority. */
export class CommercialPricingService implements ICommercialPricingService {
  constructor(private readonly api: IApiService) {}

  getResourceConfiguration(resourceId: string): Promise<ResourceRentalPriceConfiguration> {
    return this.api.get(COMMERCIAL_PRICING_ENDPOINTS.RESOURCE_CONFIGURATION(resourceId));
  }

  configureResourcePrice(
    input: ConfigureResourceRentalPriceInput
  ): Promise<ResourceRentalPriceConfiguration> {
    return this.postIntent(COMMERCIAL_PRICING_ENDPOINTS.RESOURCE_PRICING, input, input.idempotencyKey);
  }

  calculateQuote(input: CalculatePriceQuoteInput): Promise<PriceQuote> {
    return this.postIntent(
      COMMERCIAL_PRICING_ENDPOINTS.CALCULATE_QUOTE,
      {
        offeringId: input.offeringId,
        schedulableResourceId: input.resourceId,
        partyId: input.partyId,
        quantity: input.quantity,
        requestedStartUtc: input.requestedStartUtc,
        requestedEndUtc: input.requestedEndUtc,
        currencyCode: input.currencyCode,
        expiresAtUtc: input.expiresAtUtc,
        idempotencyKey: input.idempotencyKey,
      },
      input.idempotencyKey
    );
  }

  overrideQuote(quoteId: string, input: OverridePriceQuoteInput): Promise<PriceQuoteOverride> {
    return this.postIntent(
      COMMERCIAL_PRICING_ENDPOINTS.OVERRIDE_QUOTE(quoteId),
      input,
      input.idempotencyKey
    );
  }

  getTaxCategories(): Promise<TaxCategory[]> {
    return this.api.get(COMMERCIAL_PRICING_ENDPOINTS.TAX_CATEGORIES);
  }

  createTaxCategory(input: CreateTaxCategoryInput): Promise<TaxCategory> {
    return this.api.post(COMMERCIAL_PRICING_ENDPOINTS.TAX_CATEGORIES, input);
  }

  private postIntent<T>(endpoint: string, payload: unknown, idempotencyKey: string): Promise<T> {
    const intent = { idempotencyKey };
    return (
      this.api.postWithRetry?.(endpoint, payload, undefined, intent) ??
      this.api.post(endpoint, payload, undefined, intent)
    );
  }
}
