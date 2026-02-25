/**
 * Bundle Service — API calls only
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export interface BundleModel {
      id: string;
      name: string;
      displayNameEn?: string;
      displayNameAr?: string;
      description?: string;
      scope: string;
      createdByTenantId?: string;
      isSystem: boolean;
      isRetired: boolean;
      permissionRuleCount?: number;
      featureRuleCount?: number;
      permissionRules?: { id: string; permissionCode: string; mode: string }[];
      featureRules?: { id: string; featureName: string; value: string }[];
      createdAt: string;
      modifiedAt?: string;
}

export class BundleService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: PaginationParams): Promise<PagedResult<BundleModel>> {
            return this.api.get<PagedResult<BundleModel>>(API_ENDPOINTS.ENTITLEMENTS.BUNDLES.LIST, {
                  page: params.page,
                  pageSize: params.pageSize,
                  search: params.search || undefined,
            });
      }

      async getById(id: string): Promise<BundleModel> {
            return this.api.get<BundleModel>(API_ENDPOINTS.ENTITLEMENTS.BUNDLES.BY_ID(id));
      }

      async create(data: Record<string, unknown>): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.BUNDLES.CREATE, data);
      }

      async update(id: string, data: Record<string, unknown>): Promise<void> {
            await this.api.put(API_ENDPOINTS.ENTITLEMENTS.BUNDLES.UPDATE(id), data);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.BUNDLES.DELETE(id));
      }
}
