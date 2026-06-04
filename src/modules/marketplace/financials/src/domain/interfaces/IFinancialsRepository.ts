import type { AppPurchase, DeveloperPayout } from "../entities/FinancialEntities";

/**
 * Financials Repository Interface
 *
 * Contract for marketplace purchase and payout operations.
 * Paginated responses match Core.Application.Common.PagedResult<T>.
 */
export interface IFinancialsRepository {
  /** Paginated list of app purchases with optional tenant filter. */
  getPurchases(params: { page: number; pageSize: number; tenantId?: string }): Promise<{
    items: AppPurchase[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;

  /**
   * Record a new app purchase.
   * Backend CreateAppPurchaseRequest expects appListingId + tenantId.
   */
  createPurchase(data: { appListingId: string; tenantId: string }): Promise<string>;

  /** Paginated list of developer payouts for a specific developer profile. */
  getPayouts(params: { developerProfileId: string; page: number; pageSize: number }): Promise<{
    items: DeveloperPayout[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }>;

  /**
   * Process a pending payout.
   * Backend expects optional externalReference (Stripe transfer ID).
   */
  processPayout(id: string, externalReference?: string): Promise<void>;
}
