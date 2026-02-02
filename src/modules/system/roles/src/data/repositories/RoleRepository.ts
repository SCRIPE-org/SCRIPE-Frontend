/**
 * Role Repository Implementation
 *
 * Implements IRoleRepository using the API service.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
      IRoleRepository,
      RoleListParams,
} from "../../domain/interfaces/IRoleRepository";
import { Role, RoleData } from "../../domain/entities/Role";
import type {
      CreateRoleRequest,
      UpdateRoleRequest,
      AssignPermissionsRequest,
} from "../../domain/entities/RoleRequests";
import type { PagedResult } from "@modules/system/core/domain/types";

/**
 * API response shape for paginated roles
 */
interface RoleListApiResponse {
      items: RoleData[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
}

export class RoleRepository implements IRoleRepository {
      constructor(private readonly api: IApiService) { }

      async getAll(params: RoleListParams): Promise<PagedResult<Role>> {
            const url = buildUrl(API_ENDPOINTS.ROLES.LIST, {
                  page: params.page,
                  pageSize: params.pageSize,
                  search: params.search,
                  tenantId: params.tenantId,
            });

            const response = await this.api.get<RoleListApiResponse>(url);

            return {
                  items: response.items.map((data) => new Role(data)),
                  totalCount: response.totalCount,
                  page: response.page,
                  pageSize: response.pageSize,
                  totalPages: response.totalPages,
                  hasNextPage: response.hasNextPage,
                  hasPreviousPage: response.hasPreviousPage,
            };
      }

      async getById(id: string): Promise<Role> {
            const data = await this.api.get<RoleData>(API_ENDPOINTS.ROLES.BY_ID(id));
            return new Role(data);
      }

      async create(request: CreateRoleRequest): Promise<string> {
            const response = await this.api.post<{ id: string }>(
                  API_ENDPOINTS.ROLES.CREATE,
                  request
            );
            return response.id;
      }

      async update(id: string, request: UpdateRoleRequest): Promise<void> {
            await this.api.put(API_ENDPOINTS.ROLES.UPDATE(id), request);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.ROLES.DELETE(id));
      }

      async assignPermissions(
            roleId: string,
            request: AssignPermissionsRequest
      ): Promise<void> {
            await this.api.post(API_ENDPOINTS.ROLES.PERMISSIONS(roleId), request);
      }

      async removePermission(roleId: string, permissionId: string): Promise<void> {
            await this.api.delete(
                  API_ENDPOINTS.ROLES.REMOVE_PERMISSION(roleId, permissionId)
            );
      }

      async getRolePermissions(roleId: string): Promise<any[]> {
            return await this.api.get<any[]>(API_ENDPOINTS.ROLES.PERMISSIONS(roleId));
      }
}
