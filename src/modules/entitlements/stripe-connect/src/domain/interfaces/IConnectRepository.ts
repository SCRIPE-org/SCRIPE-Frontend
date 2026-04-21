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
  createAccount(tenantId: string): Promise<{ accountId: string; onboardingUrl: string; status: string }>;
  refreshOnboardingLink(tenantId: string): Promise<string>;
  getDashboardLink(tenantId: string): Promise<string>;
  updateCommissionRate(tenantId: string, rate: number | null): Promise<void>;

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
}
