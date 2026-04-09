/**
 * Feature Service — API calls only
 *
 * Uses centralized API_ENDPOINTS for all endpoint paths.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IFeatureService, FeatureModel, TenantEffectiveFeatureModel } from "../../domain/interfaces/IFeatureService";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export class FeatureService implements IFeatureService {
      constructor(private readonly api: IApiService) { }

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

      async create(data: Record<string, unknown>): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.FEATURES.CREATE, data);
      }

      async update(id: string, data: Record<string, unknown>): Promise<void> {
            await this.api.put(API_ENDPOINTS.ENTITLEMENTS.FEATURES.UPDATE(id), data);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.FEATURES.DELETE(id));
      }

      async getTenantResolvedFeatures(tenantId: string): Promise<any[]> {
            return this.api.get<any[]>(API_ENDPOINTS.ENTITLEMENTS.TENANT_FEATURES.RESOLVED(tenantId));
      }

      async getEffective(tenantId?: string): Promise<TenantEffectiveFeatureModel[]> {
            const params: Record<string, string> = {};
            if (tenantId) params.tenantId = tenantId;
            return this.api.get<TenantEffectiveFeatureModel[]>(
                  API_ENDPOINTS.ENTITLEMENTS.FEATURES.EFFECTIVE,
                  params
            );
      }
}
