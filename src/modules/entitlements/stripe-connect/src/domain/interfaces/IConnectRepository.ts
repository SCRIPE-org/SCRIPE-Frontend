/**
 * Stripe Connect Repository Interface
 *
 * Returns domain entities — never raw DTOs.
 * Used by ViewModels via DI container.
 */
import type {
  ConnectAccount,
  ConnectAccountListItem,
  Commission,
  CommissionDashboard,
  CommissionTrendPoint,
  TopTenantData,
} from "../entities/ConnectAccount";

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

export interface IConnectRepository {
  // ── Account Lifecycle ──
  getAccount(tenantId: string): Promise<ConnectAccount>;
  getAccounts(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
  }): Promise<PagedResult<ConnectAccountListItem>>;
  createAccount(
    tenantId: string
  ): Promise<{ accountId: string; onboardingUrl: string; status: string }>;
  refreshOnboardingLink(tenantId: string): Promise<string>;
  getDashboardLink(tenantId: string): Promise<string>;
  updateCommissionRate(tenantId: string, rate: number | null): Promise<void>;

  // ── Tenant-Facing Lifecycle ──
  getTenantStatus(): Promise<ConnectAccount>;
  tenantOnboard(): Promise<{ accountId: string; onboardingUrl: string; status: string }>;
  tenantRefreshLink(): Promise<string>;
  tenantDashboard(): Promise<string>;

  // ── Commissions ──
  getCommissions(params: {
    page: number;
    pageSize: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<PagedResult<Commission>>;
  getTenantCommissions(
    tenantId: string,
    params: {
      page: number;
      pageSize: number;
      status?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<PagedResult<Commission>>;
  getDashboard(): Promise<CommissionDashboard>;
  getTrends(days: number, tenantId?: string): Promise<CommissionTrendPoint[]>;
  getTopTenants(top: number, fromDate?: string): Promise<TopTenantData[]>;

  /**
   * Search tenants eligible for Stripe Connect onboarding.
   * Returns lightweight picker items — not full domain entities.
   * Excludes the System/root tenant (filtered server-side).
   */
  searchEligibleTenants(search?: string): Promise<EligibleTenant[]>;

  // ── Tenant Self-Service ──
  getMyTransactions(params: {
    page: number;
    pageSize: number;
    status?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<import("../../data/models/ConnectModels").TenantTransactionsResponseModel>;
  syncMyAccount(): Promise<ConnectAccount>;
}

/** Lightweight value-object for the tenant picker — not a full entity. */
export interface EligibleTenant {
  id: string;
  name: string;
  code: string;
}
