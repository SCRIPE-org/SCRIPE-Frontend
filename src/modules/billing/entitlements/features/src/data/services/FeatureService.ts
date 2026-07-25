/**
 * Feature Service — API calls only
 *
 * Uses local FEATURES_ENDPOINTS for all endpoint paths.
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
import { FEATURES_ENDPOINTS } from "./features.endpoints";
import type {
  CreateFeatureRequest,
  UpdateFeatureRequest,
} from "../../domain/entities/FeatureRequests";

/**
 * Http API network service for feature.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class FeatureService implements IFeatureService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: PaginationParams): Promise<PagedResult<FeatureModel>> {
    return this.api.get<PagedResult<FeatureModel>>(FEATURES_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
    });
  }

  async getById(id: string): Promise<FeatureModel> {
    return this.api.get<FeatureModel>(FEATURES_ENDPOINTS.BY_ID(id));
  }

  async create(data: CreateFeatureRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(FEATURES_ENDPOINTS.CREATE, data);
  }

  async update(id: string, data: UpdateFeatureRequest): Promise<void> {
    await this.api.put(FEATURES_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(FEATURES_ENDPOINTS.DELETE(id));
  }

  async getTenantResolvedFeatures(tenantId: string): Promise<TenantEffectiveFeatureModel[]> {
    return this.api.get<TenantEffectiveFeatureModel[]>(
      FEATURES_ENDPOINTS.TENANT_RESOLVED(tenantId)
    );
  }

  async getEffective(tenantId?: string): Promise<TenantEffectiveFeatureModel[]> {
    const params: Record<string, string> = {};
    if (tenantId) params.tenantId = tenantId;
    return this.api.get<TenantEffectiveFeatureModel[]>(FEATURES_ENDPOINTS.EFFECTIVE, params);
  }

  async getGrouped(search?: string): Promise<FeatureModuleGroupModel[]> {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    return this.api.get<FeatureModuleGroupModel[]>(FEATURES_ENDPOINTS.GROUPED, params);
  }
}
