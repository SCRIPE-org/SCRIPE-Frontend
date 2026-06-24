/**
 * Feature Service — API calls only
 *
 * Uses centralized API_ENDPOINTS for all endpoint paths.
 * Returns raw DTOs (models) — never domain entities.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IFeatureService } from "../../domain/interfaces/IFeatureService";
import type {
  FeatureModel,
  TenantEffectiveFeatureModel,
  FeatureModuleGroupModel,
} from "../models/FeatureModels";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type {
  CreateFeatureRequest,
  UpdateFeatureRequest,
} from "../../domain/entities/FeatureRequests";

export class FeatureService implements IFeatureService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: PaginationParams): Promise<PagedResult<FeatureModel>> {
    return this.api.get<PagedResult<FeatureModel>>(API_ENDPOINTS.ENTITLEMENTS.FEATURES.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
    });
  }

  async getById(id: string): Promise<FeatureModel> {
    return this.api.get<FeatureModel>(API_ENDPOINTS.ENTITLEMENTS.FEATURES.BY_ID(id));
  }

  async create(data: CreateFeatureRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.FEATURES.CREATE, data);
  }

  async update(id: string, data: UpdateFeatureRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.FEATURES.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.FEATURES.DELETE(id));
  }

  async getTenantResolvedFeatures(tenantId: string): Promise<TenantEffectiveFeatureModel[]> {
    return this.api.get<TenantEffectiveFeatureModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURES.RESOLVED(tenantId)
    );
  }

  async getEffective(tenantId?: string): Promise<TenantEffectiveFeatureModel[]> {
    const params: Record<string, string> = {};
    if (tenantId) params.tenantId = tenantId;
    return this.api.get<TenantEffectiveFeatureModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.FEATURES.EFFECTIVE,
      params
    );
  }

  async getGrouped(search?: string): Promise<FeatureModuleGroupModel[]> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    return this.api.get<FeatureModuleGroupModel[]>(
      API_ENDPOINTS.ENTITLEMENTS.FEATURES.GROUPED,
      params
    );
  }
}
