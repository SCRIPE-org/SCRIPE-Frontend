/**
 * IFinancialsService
 *
 * Contract for the Marketplace Financials HTTP service layer.
 * Returns raw API DTOs — conversion to domain entities happens in the Repository.
 */

/**
 * API response shape for a purchase record.
 * Maps to backend AppPurchaseResponse:
 *   - purchaseDate (not purchasedAt)
 *   - amountPaid (not amount)
 *   - status (payment status string)
 *
 * Note: pricingModel and tenantName are NOT in the backend response;
 * they must be resolved client-side or added to the backend DTO later.
 */
export interface PurchaseDto {
  id: string;
  appListingId: string;
  appName?: string;
  tenantId: string;
  /** Backend field name: PurchaseDate */
  purchaseDate?: string;
  /** Backend field name: AmountPaid */
  amountPaid?: number;
  currency?: string;
  /** Backend field name: Status (payment status) */
  status?: string;
  createdAt?: string;
}

/** API response shape for a developer payout record. */
export interface PayoutDto {
  id: string;
  developerProfileId: string;
  developerName?: string;
  amount?: number;
  currency?: string;
  periodStart?: string;
  periodEnd?: string;
  status?: string;
  stripeTransferId?: string | null;
  createdAt?: string;
}

/** Paginated API response wrapper matching Core.Application.Common.PagedResult<T>. */
export interface PaginatedFinancialsResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Payload for initiating an app purchase. */
export interface CreatePurchasePayload {
  appListingId: string;
  tenantId: string;
}

/**
 * Http API network service for i financials.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IFinancialsService {
  /** Fetch paginated purchase transactions. */
  getPurchases(params: {
    page: number;
    pageSize: number;
    tenantId?: string;
  }): Promise<PaginatedFinancialsResponse<PurchaseDto>>;
  /** Create (initiate) an app purchase. Returns new purchase ID. */
  createPurchase(payload: CreatePurchasePayload): Promise<{ id: string }>;
  /** Fetch paginated developer payouts. */
  getPayouts(params: {
    developerProfileId: string;
    page: number;
    pageSize: number;
  }): Promise<PaginatedFinancialsResponse<PayoutDto>>;
  /** Process (disburse) a pending payout. */
  processPayout(id: string, externalReference?: string): Promise<void>;
}
