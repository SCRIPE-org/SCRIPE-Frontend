import type { CalculatePriceQuoteInput, ConfigureResourceRentalPriceInput, CreateTaxCategoryInput, OverridePriceQuoteInput, PriceQuote, PriceQuoteOverride, ResourceRentalPriceConfiguration, TaxCategory } from "../../domain/entities/CommercialPricing";
import type { ICommercialPricingRepository } from "../../domain/interfaces/ICommercialPricingRepository";
import type { ICommercialPricingService } from "../../domain/interfaces/ICommercialPricingService";

/**
 * Documentation for module export
 */
export class CommercialPricingRepository implements ICommercialPricingRepository {
  constructor(private readonly service: ICommercialPricingService) {}

  getResourceConfiguration(resourceId: string): Promise<ResourceRentalPriceConfiguration> {
    return this.service.getResourceConfiguration(resourceId);
  }

  configureResourcePrice(input: ConfigureResourceRentalPriceInput): Promise<ResourceRentalPriceConfiguration> {
    return this.service.configureResourcePrice(input);
  }

  calculateQuote(input: CalculatePriceQuoteInput): Promise<PriceQuote> {
    return this.service.calculateQuote(input);
  }

  overrideQuote(quoteId: string, input: OverridePriceQuoteInput): Promise<PriceQuoteOverride> {
    return this.service.overrideQuote(quoteId, input);
  }

  getTaxCategories(): Promise<TaxCategory[]> {
    return this.service.getTaxCategories();
  }

  createTaxCategory(input: CreateTaxCategoryInput): Promise<TaxCategory> {
    return this.service.createTaxCategory(input);
  }
}
