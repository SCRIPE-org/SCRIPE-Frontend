/**
 * Stripe Connect Service — API calls only, no business logic.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IConnectService } from "../../domain/interfaces/IConnectService";
import type {
  ConnectAccountResponseModel,
  ConnectAccountListResponseModel,
  ConnectAccountResultModel,
  CommissionResponseModel,
  CommissionDashboardResponseModel,
  CommissionTrendPointModel,
  TopTenantResponseModel,
  PagedResultModel,
} from "../models/ConnectModels";

export class ConnectService implements IConnectService {
  constructor(private readonly api: IApiService) {}

  // ── Account Lifecycle ──

  async getAccount(tenantId: string): Promise<ConnectAccountResponseModel> {
    return this.api.get<ConnectAccountResponseModel>(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.ACCOUNTS.BY_ID(tenantId)
    );
  }

  async getAccounts(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
  }): Promise<PagedResultModel<ConnectAccountListResponseModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.ACCOUNTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      status: params.status,
    });
    return this.api.get<PagedResultModel<ConnectAccountListResponseModel>>(url);
  }

  async createAccount(tenantId: string): Promise<ConnectAccountResultModel> {
    return this.api.post<ConnectAccountResultModel>(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.ACCOUNTS.CREATE,
      { tenantId }
    );
  }

  async refreshOnboardingLink(tenantId: string): Promise<{ onboardingUrl: string }> {
    return this.api.post<{ onboardingUrl: string }>(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.ACCOUNTS.REFRESH_LINK(tenantId),
      {}
    );
  }

  async getDashboardLink(tenantId: string): Promise<{ dashboardUrl: string }> {
    return this.api.get<{ dashboardUrl: string }>(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.ACCOUNTS.DASHBOARD_LINK(tenantId)
    );
  }

  async updateCommissionRate(tenantId: string, rate: number | null): Promise<void> {
    await this.api.put(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.ACCOUNTS.COMMISSION_RATE(tenantId),
      { rate }
    );
  }

  // ── Tenant-Facing Lifecycle ──

  async getTenantStatus(): Promise<ConnectAccountResponseModel> {
    return this.api.get<ConnectAccountResponseModel>(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.TENANT_STRIPE_CONNECT.STATUS
    );
  }

  async tenantOnboard(): Promise<ConnectAccountResultModel> {
    return this.api.post<ConnectAccountResultModel>(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.TENANT_STRIPE_CONNECT.ONBOARD,
      {}
    );
  }

  async tenantRefreshLink(): Promise<{ onboardingUrl: string }> {
    return this.api.post<{ onboardingUrl: string }>(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.TENANT_STRIPE_CONNECT.REFRESH_LINK,
      {}
    );
  }

  async tenantDashboard(): Promise<{ dashboardUrl: string }> {
    return this.api.post<{ dashboardUrl: string }>(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.TENANT_STRIPE_CONNECT.DASHBOARD_LINK,
      {}
    );
  }

  // ── Commissions ──

  async getCommissions(params: {
    page: number;
    pageSize: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<PagedResultModel<CommissionResponseModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.COMMISSIONS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      status: params.status,
      fromDate: params.fromDate,
      toDate: params.toDate,
    });
    return this.api.get<PagedResultModel<CommissionResponseModel>>(url);
  }

  async getTenantCommissions(
    tenantId: string,
    params: {
      page: number;
      pageSize: number;
      status?: string;
      fromDate?: string;
      toDate?: string;
    }
  ): Promise<PagedResultModel<CommissionResponseModel>> {
    const url = buildUrl(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.COMMISSIONS.BY_TENANT(tenantId),
      {
        page: params.page,
        pageSize: params.pageSize,
        status: params.status,
        fromDate: params.fromDate,
        toDate: params.toDate,
      }
    );
    return this.api.get<PagedResultModel<CommissionResponseModel>>(url);
  }

  async getDashboard(): Promise<CommissionDashboardResponseModel> {
    return this.api.get<CommissionDashboardResponseModel>(
      API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.COMMISSIONS.DASHBOARD
    );
  }

  async getTrends(days: number, tenantId?: string): Promise<CommissionTrendPointModel[]> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.COMMISSIONS.TRENDS, {
      days,
      tenantId,
    });
    return this.api.get<CommissionTrendPointModel[]>(url);
  }

  async getTopTenants(top: number, fromDate?: string): Promise<TopTenantResponseModel[]> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.STRIPE_CONNECT.COMMISSIONS.TOP_TENANTS, {
      top,
      fromDate,
    });
    return this.api.get<TopTenantResponseModel[]>(url);
  }
}
