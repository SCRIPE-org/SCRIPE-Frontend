/**
 * Documentation for module export
 */
export interface ResourceRentalPriceConfiguration {
  resourceRentalOfferingId: string;
  schedulableResourceId: string;
  offeringId: string;
  priceBookId: string;
  priceBookVersionId: string;
  displayName: string;
  currencyCode: string;
  unitPrice: number;
  effectiveFromUtc: string;
  minDurationMinutes: number | null;
  maxDurationMinutes: number | null;
  incrementMinutes: number | null;
  taxCategoryId: string | null;
}

/**
 * Documentation for module export
 */
export interface ConfigureResourceRentalPriceInput {
  schedulableResourceId: string;
  displayName: string;
  currencyCode: string;
  unitPrice: number;
  effectiveFromUtc: string;
  minDurationMinutes: number | null;
  maxDurationMinutes: number | null;
  incrementMinutes: number | null;
  taxCategoryId: string | null;
  idempotencyKey: string;
}

/**
 * Documentation for module export
 */
export interface TaxCategory {
  id: string;
  name: string;
  code: string;
  ratePercentage: number;
  isInclusive: boolean;
  status: string;
}

/**
 * Documentation for module export
 */
export interface CreateTaxCategoryInput {
  name: string;
  code: string;
  ratePercentage: number;
  isInclusive: boolean;
}

/**
 * Documentation for module export
 */
export interface CalculatePriceQuoteInput {
  offeringId: string;
  resourceId: string;
  partyId: string;
  quantity: number;
  requestedStartUtc: string;
  requestedEndUtc: string;
  currencyCode: string;
  expiresAtUtc: string;
  idempotencyKey: string;
}

/**
 * Documentation for module export
 */
export interface PriceQuote {
  id: string;
  quoteNumber: string;
  offeringId: string;
  schedulableResourceId: string | null;
  partyId: string;
  quantity: number;
  requestedStartUtc: string;
  requestedEndUtc: string;
  currencyCode: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  roundingAdjustment: number;
  grandTotal: number;
  status: string;
  expiresAtUtc: string;
  wasIdempotentReplay: boolean;
}

/**
 * Documentation for module export
 */
export interface OverridePriceQuoteInput {
  adjustmentAmount: number;
  reason: string;
  idempotencyKey: string;
}

/**
 * Documentation for module export
 */
export interface PriceQuoteOverride {
  id: string;
  priceQuoteId: string;
  originalGrandTotal: number;
  adjustmentAmount: number;
  overriddenGrandTotal: number;
  reason: string;
  appliedAtUtc: string;
  wasIdempotentReplay: boolean;
}
