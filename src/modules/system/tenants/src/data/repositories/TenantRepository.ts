/**
 * Tenant Repository Implementation
 *
 * Implements ITenantRepository using the API service.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
      ITenantRepository,
      TenantListParams,
} from "../../domain/interfaces/ITenantRepository";
import { Tenant, TenantData, TenantTreeNode } from "../../domain/entities/Tenant";
import type {
      CreateTenantRequest,
      UpdateTenantRequest,
} from "../../domain/entities/TenantRequests";
import type { PagedResult } from "@modules/system/core/domain/types";

/**
 * API response shape for paginated tenants
 */
interface TenantListApiResponse {
      items: TenantData[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
}

export class TenantRepository implements ITenantRepository {
      constructor(private readonly api: IApiService) { }

      async getAll(params: TenantListParams): Promise<PagedResult<Tenant>> {
            const url = buildUrl(API_ENDPOINTS.TENANTS.LIST, {
                  page: params.page,
                  pageSize: params.pageSize,
                  search: params.search,
                  parentId: params.parentId,
            });

            const response = await this.api.get<TenantListApiResponse>(url);

            return {
                  items: response.items.map((data) => new Tenant(data)),
                  totalCount: response.totalCount,
                  page: response.page,
                  pageSize: response.pageSize,
                  totalPages: response.totalPages,
                  hasNextPage: response.hasNextPage,
                  hasPreviousPage: response.hasPreviousPage,
            };
      }

      async getTree(): Promise<TenantTreeNode[]> {
            return await this.api.get<TenantTreeNode[]>(API_ENDPOINTS.TENANTS.TREE);
      }

      async getById(id: string): Promise<Tenant> {
            const data = await this.api.get<TenantData>(API_ENDPOINTS.TENANTS.BY_ID(id));
            return new Tenant(data);
      }

      async create(request: CreateTenantRequest): Promise<string> {
            const response = await this.api.post<{ id: string }>(
                  API_ENDPOINTS.TENANTS.CREATE,
                  request
            );
            return response.id;
      }

      async update(id: string, request: UpdateTenantRequest): Promise<void> {
            await this.api.put(API_ENDPOINTS.TENANTS.UPDATE(id), request);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.TENANTS.DELETE(id));
      }
}
