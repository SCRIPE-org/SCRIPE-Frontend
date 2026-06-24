/**
 * IFinancialsService
 *
 * Contract for the Marketplace Financials HTTP service layer.
 * Returns raw API DTOs — conversion to domain entities happens in the Repository.
 */

/** API response shape for a purchase record. */
export interface PurchaseDto {
  id: string;
  appListingId: string;
  appName?: string;
  tenantId: string;
  tenantName?: string;
  amount?: number;
  currency?: string;
  pricingModel?: string;
  purchasedAt?: string;
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
 * Interface defining operations for the Financials network service.
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
