/**
 * Tenant Service
 *
 * Handles all API calls for the Tenants module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * @module tenants/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import {
      TenantModel,
      TenantTreeNodeModel,
      type TenantJson,
      type TenantTreeNodeJson,
      type TenantListResponseJson,
      type CreateTenantJson,
      type UpdateTenantJson,
} from "../models/TenantModel";

export interface TenantListParams {
      page?: number;
      pageSize?: number;
      search?: string;
      parentId?: string;
}

export interface TenantListResult {
      items: TenantModel[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
}

/**
 * Tenant statistics response
 */
export interface TenantStats {
      adminsCount: number;
      rolesCount: number;
      subTenantsCount: number;
      permissionsCount: number;
}

export interface ITenantService {
      getAll(params: TenantListParams): Promise<TenantListResult>;
      getTree(): Promise<TenantTreeNodeModel[]>;
      getById(id: string): Promise<TenantModel>;
      getStats(id: string): Promise<TenantStats>;
      create(json: CreateTenantJson): Promise<{ id: string }>;
      update(id: string, json: UpdateTenantJson): Promise<void>;
      delete(id: string): Promise<void>;
      getDescendantCount(id: string): Promise<number>;
}

export class TenantService implements ITenantService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: TenantListParams): Promise<TenantListResult> {
            const url = buildUrl(API_ENDPOINTS.TENANTS.LIST, {
                  page: params.page,
                  pageSize: params.pageSize,
                  search: params.search,
                  parentId: params.parentId,
            });

            const response = await this.api.get<TenantListResponseJson>(url);

            return {
                  items: response.items.map((json) => TenantModel.fromJson(json)),
                  totalCount: response.totalCount,
                  page: response.page,
                  pageSize: response.pageSize,
                  totalPages: response.totalPages,
                  hasNextPage: response.hasNextPage,
                  hasPreviousPage: response.hasPreviousPage,
            };
      }

      async getTree(): Promise<TenantTreeNodeModel[]> {
            const jsonList = await this.api.get<TenantTreeNodeJson[]>(
                  API_ENDPOINTS.TENANTS.TREE
            );
            return jsonList.map((json) => TenantTreeNodeModel.fromJson(json));
      }

      async getById(id: string): Promise<TenantModel> {
            const json = await this.api.get<TenantJson>(
                  API_ENDPOINTS.TENANTS.BY_ID(id)
            );
            return TenantModel.fromJson(json);
      }

      async create(json: CreateTenantJson): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.TENANTS.CREATE, json);
      }

      async update(id: string, json: UpdateTenantJson): Promise<void> {
            await this.api.put(API_ENDPOINTS.TENANTS.UPDATE(id), json);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.TENANTS.DELETE(id));
      }

      async getStats(id: string): Promise<TenantStats> {
            return this.api.get<TenantStats>(API_ENDPOINTS.TENANTS.STATS(id));
      }

      async getDescendantCount(id: string): Promise<number> {
            return this.api.get<number>(`${API_ENDPOINTS.TENANTS.BY_ID(id)}/descendant-count`);
      }
}
