/**
 * Edition Pricing Entities — Multi-currency pricing for editions
 */

export interface EditionPriceItem {
  currency: string;
  billingCycle: string;
  amount: number;
}

/**
 * Interface structure detailing the properties and attributes of Edition Price List Response.
 */
export interface EditionPriceListResponse {
  editionId: string;
  prices: EditionPriceItem[];
}

/**
 * Interface structure detailing the properties and attributes of Set Edition Prices Request.
 */
export interface SetEditionPricesRequest {
  prices: EditionPriceItem[];
}

/** Re-exported from @core/constants/currencies — single source of truth */
export { SUPPORTED_CURRENCIES, getCurrencyInfo, formatPrice } from "@core/constants/currencies";

export const BILLING_CYCLES = [
  { value: "Monthly", label: "Monthly" },
  { value: "Yearly", label: "Yearly" },
  { value: "Lifetime", label: "Lifetime" },
] as const;
