/**
 * TenantPlan Service — API calls only
 *
 * Uses centralized API_ENDPOINTS for all endpoint paths.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { ITenantPlanService } from "../../domain/interfaces/ITenantPlanService";
import type { TenantPlanModel, TenantPlanListModel } from "../models/TenantPlanModels";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";

export class TenantPlanService implements ITenantPlanService {
  constructor(private readonly api: IApiService) {}

  async getAll(tenantId: string, params: PaginationParams): Promise<PagedResult<TenantPlanListModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.LIST, {
      tenantId,
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
    });
    return this.api.get<PagedResult<TenantPlanListModel>>(url);
  }

  async getById(id: string, tenantId: string): Promise<TenantPlanModel> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.BY_ID(id), { tenantId });
    return this.api.get<TenantPlanModel>(url);
  }

  async create(tenantId: string, data: Record<string, unknown>): Promise<{ id: string }> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.CREATE, { tenantId });
    return this.api.post<{ id: string }>(url, data);
  }

  async update(id: string, tenantId: string, data: Record<string, unknown>): Promise<void> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.UPDATE(id), { tenantId });
    await this.api.put(url, data);
  }

  async delete(id: string, tenantId: string): Promise<void> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.DELETE(id), { tenantId });
    await this.api.delete(url);
  }
}
