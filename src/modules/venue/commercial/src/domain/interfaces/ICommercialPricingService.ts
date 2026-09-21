import type { CalculatePriceQuoteInput, ConfigureResourceRentalPriceInput, CreateTaxCategoryInput, OverridePriceQuoteInput, PriceQuote, PriceQuoteOverride, ResourceRentalPriceConfiguration, TaxCategory } from "../entities/CommercialPricing";

export interface ICommercialPricingService {
  getResourceConfiguration(resourceId: string): Promise<ResourceRentalPriceConfiguration>;
  configureResourcePrice(input: ConfigureResourceRentalPriceInput): Promise<ResourceRentalPriceConfiguration>;
  calculateQuote(input: CalculatePriceQuoteInput): Promise<PriceQuote>;
  overrideQuote(quoteId: string, input: OverridePriceQuoteInput): Promise<PriceQuoteOverride>;
  getTaxCategories(): Promise<TaxCategory[]>;
  createTaxCategory(input: CreateTaxCategoryInput): Promise<TaxCategory>;
}
