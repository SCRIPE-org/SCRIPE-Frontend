/**
 * Stripe Connect Repository — wraps service + mapper → returns domain entities.
 */
import type {
  IConnectRepository,
  PagedResult,
  EligibleTenant,
} from "../../domain/interfaces/IConnectRepository";
import type { IConnectService } from "../../domain/interfaces/IConnectService";
import { ConnectMapper } from "../mappers/ConnectMapper";
import type {
  ConnectAccount,
  ConnectAccountListItem,
  Commission,
  CommissionDashboard,
  CommissionTrendPoint,
  TopTenantData,
} from "../../domain/entities/ConnectAccount";

export class ConnectRepository implements IConnectRepository {
  constructor(private readonly service: IConnectService) {}

  // ── Account Lifecycle ──

  async getAccount(tenantId: string): Promise<ConnectAccount> {
    const dto = await this.service.getAccount(tenantId);
    return ConnectMapper.toAccountEntity(dto);
  }

  async getAccounts(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
  }): Promise<PagedResult<ConnectAccountListItem>> {
    const result = await this.service.getAccounts(params);
    return {
      items: result.items.map(ConnectMapper.toAccountListEntity),
      totalCount: result.totalCount,
    };
  }

  async createAccount(
    tenantId: string
  ): Promise<{ accountId: string; onboardingUrl: string; status: string }> {
    const result = await this.service.createAccount(tenantId);
    return {
      accountId: result.accountId,
      onboardingUrl: result.onboardingUrl,
      status: result.status,
    };
  }

  async refreshOnboardingLink(tenantId: string): Promise<string> {
    const result = await this.service.refreshOnboardingLink(tenantId);
    return result.onboardingUrl;
  }

  async getDashboardLink(tenantId: string): Promise<string> {
    const result = await this.service.getDashboardLink(tenantId);
    return result.dashboardUrl;
  }

  async updateCommissionRate(tenantId: string, rate: number | null): Promise<void> {
    await this.service.updateCommissionRate(tenantId, rate);
  }

  // ── Tenant-Facing Lifecycle ──

  async getTenantStatus(): Promise<ConnectAccount> {
    const dto = await this.service.getTenantStatus();
    return ConnectMapper.toAccountEntity(dto);
  }

  async tenantOnboard(): Promise<{ accountId: string; onboardingUrl: string; status: string }> {
    const result = await this.service.tenantOnboard();
    return {
      accountId: result.accountId,
      onboardingUrl: result.onboardingUrl,
      status: result.status,
    };
  }

  async tenantRefreshLink(): Promise<string> {
    const result = await this.service.tenantRefreshLink();
    return result.onboardingUrl;
  }

  async tenantDashboard(): Promise<string> {
    const result = await this.service.tenantDashboard();
    return result.dashboardUrl;
  }

  // ── Commissions ──

  async getCommissions(params: {
    page: number;
    pageSize: number;
    status?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<PagedResult<Commission>> {
    const result = await this.service.getCommissions(params);
    return {
      items: result.items.map(ConnectMapper.toCommissionEntity),
      totalCount: result.totalCount,
    };
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
  ): Promise<PagedResult<Commission>> {
    const result = await this.service.getTenantCommissions(tenantId, params);
    return {
      items: result.items.map(ConnectMapper.toCommissionEntity),
      totalCount: result.totalCount,
    };
  }

  async getDashboard(): Promise<CommissionDashboard> {
    const dto = await this.service.getDashboard();
    return ConnectMapper.toDashboardEntity(dto);
  }

  async getTrends(days: number, tenantId?: string): Promise<CommissionTrendPoint[]> {
    return this.service.getTrends(days, tenantId);
  }

  async getTopTenants(top: number, fromDate?: string): Promise<TopTenantData[]> {
    return this.service.getTopTenants(top, fromDate);
  }

  async searchEligibleTenants(search?: string): Promise<EligibleTenant[]> {
    // DTO shape == value-object shape: {id, name, code} — no mapper needed.
    const items = await this.service.searchEligibleTenants(search);
    return items.map((item) => ({
      id: item.id ?? "",
      name: item.name ?? "",
      code: item.code ?? "",
    }));
  }

  // ── Tenant Self-Service ──

  async getMyTransactions(params: {
    page: number;
    pageSize: number;
    status?: string;
    type?: string;
    fromDate?: string;
    toDate?: string;
  }) {
    return this.service.getMyTransactions(params);
  }

  async syncMyAccount(): Promise<ConnectAccount> {
    const dto = await this.service.syncMyAccount();
    return ConnectMapper.toAccountEntity(dto);
  }
}
