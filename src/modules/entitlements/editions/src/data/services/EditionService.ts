/**
 * Edition Service — API calls only
 *
 * Uses centralized API_ENDPOINTS for all endpoint paths.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export interface EditionModel {
      id: string;
      name: string;
      displayNameEn: string;
      displayNameAr: string;
      description?: string;
      isSystem: boolean;
      isRetired: boolean;
      createdByTenantId?: string;
      features?: { featureId: string; featureName: string; value: string; valueType: string }[];
      createdAt: string;
      modifiedAt?: string;
}

export class EditionService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: PaginationParams & { includeRetired?: boolean }): Promise<PagedResult<EditionModel>> {
            return this.api.get<PagedResult<EditionModel>>(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.LIST, {
                  params: {
                        page: params.page,
                        pageSize: params.pageSize,
                        search: params.search || undefined,
                        includeRetired: params.includeRetired,
                  },
            });
      }

      async getById(id: string): Promise<EditionModel> {
            return this.api.get<EditionModel>(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.BY_ID(id));
      }

      async create(data: Record<string, unknown>): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.CREATE, data);
      }

      async update(id: string, data: Record<string, unknown>): Promise<void> {
            await this.api.put(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.UPDATE(id), data);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.EDITIONS.DELETE(id));
      }
}
