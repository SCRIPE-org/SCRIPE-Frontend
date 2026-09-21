import { V1 } from "@/core/config/api-endpoints/_shared";

export const COMMERCIAL_PRICING_ENDPOINTS = {
  RESOURCE_CONFIGURATION: (resourceId: string) => `${V1}/catalog-pricing/resource-rental-prices/${resourceId}`,
  RESOURCE_PRICING: `${V1}/catalog-pricing/resource-rental-prices`,
  CALCULATE_QUOTE: `${V1}/catalog-pricing/price-quotes/calculate`,
  OVERRIDE_QUOTE: (quoteId: string) => `${V1}/catalog-pricing/price-quotes/${quoteId}/override`,
  TAX_CATEGORIES: `${V1}/catalog-pricing/tax-categories`,
} as const;
