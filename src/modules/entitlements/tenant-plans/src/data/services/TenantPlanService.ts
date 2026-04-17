/**
 * TenantPlan Service — API calls only
 *
 * TenantId is resolved server-side from JWT context — not sent as query param.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { ITenantPlanService } from "../../domain/interfaces/ITenantPlanService";
import type { TenantPlanModel, TenantPlanListModel } from "../models/TenantPlanModels";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";

export class TenantPlanService implements ITenantPlanService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: PaginationParams): Promise<PagedResult<TenantPlanListModel>> {
    const url = buildUrl(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
    });
    return this.api.get<PagedResult<TenantPlanListModel>>(url);
  }

  async getById(id: string): Promise<TenantPlanModel> {
    return this.api.get<TenantPlanModel>(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.BY_ID(id));
  }

  async create(data: Record<string, unknown>): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.CREATE, data);
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.TENANT_PLANS.DELETE(id));
  }
}
