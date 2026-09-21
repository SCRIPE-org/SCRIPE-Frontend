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

export interface TaxCategory {
  id: string;
  name: string;
  code: string;
  ratePercentage: number;
  isInclusive: boolean;
  status: string;
}

export interface CreateTaxCategoryInput {
  name: string;
  code: string;
  ratePercentage: number;
  isInclusive: boolean;
}

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

export interface OverridePriceQuoteInput {
  adjustmentAmount: number;
  reason: string;
  idempotencyKey: string;
}

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
