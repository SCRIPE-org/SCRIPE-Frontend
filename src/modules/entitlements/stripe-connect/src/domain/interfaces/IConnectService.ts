/**
 * Stripe Connect Service Interface (API contract)
 */
import type {
  ConnectAccountResponseModel,
  ConnectAccountListResponseModel,
  ConnectAccountResultModel,
  CommissionResponseModel,
  CommissionDashboardResponseModel,
  CommissionTrendPointModel,
  TopTenantResponseModel,
  EligibleTenantItemModel,
  PagedResultModel,
  TenantTransactionsResponseModel,
} from "../../data/models/ConnectModels";

/**
 * Interface defining operations for the Connect network service.
 */
export interface IConnectService {
  // ── Account Lifecycle ──
  getAccount(tenantId: string): Promise<ConnectAccountResponseModel>;
  getAccounts(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
  }): Promise<PagedResultModel<ConnectAccountListResponseModel>>;
  createAccount(tenantId: string): Promise<ConnectAccountResultModel>;
  refreshOnboardingLink(tenantId: string): Promise<{ onboardingUrl: string }>;
  getDashboardLink(tenantId: string): Promise<{ dashboardUrl: string }>;
  updateCommissionRate(tenantId: string, rate: number | null): Promise<void>;

  /** Search tenants eligible for Stripe Connect onboarding (excludes System/root tenant). */
  searchEligibleTenants(search?: string): Promise<EligibleTenantItemModel[]>;

  // ── Tenant-Facing Lifecycle ──
  getTenantStatus(): Promise<ConnectAccountResponseModel>;
  tenantOnboard(): Promise<ConnectAccountResultModel>;
  tenantRefreshLink(): Promise<{ onboardingUrl: string }>;
  tenantDashboard(): Promise<{ dashboardUrl: string }>;

  // ── Commissions ──
  getCommissions(params: {
    page: number;
    pageSize: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<PagedResultModel<CommissionResponseModel>>;
  getTenantCommissions(
    tenantId: string,
    params: {
      page: number;
      pageSize: number;
      status?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<PagedResultModel<CommissionResponseModel>>;
  getDashboard(): Promise<CommissionDashboardResponseModel>;
  getTrends(days: number, tenantId?: string): Promise<CommissionTrendPointModel[]>;
  getTopTenants(top: number, fromDate?: string): Promise<TopTenantResponseModel[]>;

  // ── Tenant Self-Service ──
  getMyTransactions(params: {
    page: number;
    pageSize: number;
    status?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<TenantTransactionsResponseModel>;
  syncMyAccount(): Promise<ConnectAccountResponseModel>;
}
