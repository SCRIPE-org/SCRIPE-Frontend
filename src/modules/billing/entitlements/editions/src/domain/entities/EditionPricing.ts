/**
 * Edition Pricing Entities — Multi-currency pricing for editions
 */

export interface EditionPriceItem {
  currency: string;
  billingCycle: string;
  amount: number;
}

/**
 * Domain model representing a Edition Price List Response structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface EditionPriceListResponse {
  editionId: string;
  prices: EditionPriceItem[];
}

/**
 * Domain model representing a Set Edition Prices Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
