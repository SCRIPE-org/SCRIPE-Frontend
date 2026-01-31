/**
 * Admin Repository Implementation
 *
 * Implements IAdminRepository using the API service.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
      IAdminRepository,
      AdminListParams,
} from "../../domain/interfaces/IAdminRepository";
import { Admin, AdminData } from "../../domain/entities/Admin";
import type {
      CreateAdminRequest,
      UpdateAdminRequest,
      AssignRoleRequest,
      BulkAdminsFilterRequest,
} from "../../domain/entities/AdminRequests";
import type { PagedResult } from "@modules/system/core/domain/types";

/**
 * API response shape for paginated admins (matches backend)
 */
interface AdminListApiResponse {
      items: AdminData[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
}

export class AdminRepository implements IAdminRepository {
      constructor(private readonly api: IApiService) { }

      async getAll(params: AdminListParams): Promise<PagedResult<Admin>> {
            const url = buildUrl(API_ENDPOINTS.ADMINS.LIST, {
                  page: params.page,
                  pageSize: params.pageSize,
                  search: params.search,
                  isActive: params.isActive,
            });

            const response = await this.api.get<AdminListApiResponse>(url);

            return {
                  items: response.items.map((data) => new Admin(data)),
                  totalCount: response.totalCount,
                  page: response.page,
                  pageSize: response.pageSize,
                  totalPages: response.totalPages,
                  hasNextPage: response.hasNextPage,
                  hasPreviousPage: response.hasPreviousPage,
            };
      }

      async getById(id: string): Promise<Admin> {
            const data = await this.api.get<AdminData>(API_ENDPOINTS.ADMINS.BY_ID(id));
            return new Admin(data);
      }

      async create(request: CreateAdminRequest): Promise<string> {
            const response = await this.api.post<{ id: string }>(
                  API_ENDPOINTS.ADMINS.CREATE,
                  request
            );
            return response.id;
      }

      async update(id: string, request: UpdateAdminRequest): Promise<void> {
            await this.api.put(API_ENDPOINTS.ADMINS.UPDATE(id), request);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.ADMINS.DELETE(id));
      }

      async setActive(id: string, isActive: boolean): Promise<void> {
            await this.api.patch(API_ENDPOINTS.ADMINS.SET_ACTIVE(id), isActive);
      }

      async assignRole(adminId: string, request: AssignRoleRequest): Promise<void> {
            await this.api.post(API_ENDPOINTS.ADMINS.ROLES(adminId), request);
      }

      async removeRole(
            adminId: string,
            roleId: string,
            tenantId?: string
      ): Promise<void> {
            const url = buildUrl(API_ENDPOINTS.ADMINS.REMOVE_ROLE(adminId, roleId), {
                  tenantId,
            });
            await this.api.delete(url);
      }

      async resetPassword(id: string, newPassword: string): Promise<void> {
            await this.api.post(API_ENDPOINTS.ADMINS.RESET_PASSWORD(id), { newPassword });
      }

      async bulkActivate(ids: string[]): Promise<number> {
            const response = await this.api.post<number>(
                  API_ENDPOINTS.ADMINS.BULK.ACTIVATE,
                  ids
            );
            return response;
      }

      async bulkDeactivate(ids: string[]): Promise<number> {
            const response = await this.api.post<number>(
                  API_ENDPOINTS.ADMINS.BULK.DEACTIVATE,
                  ids
            );
            return response;
      }

      async bulkDelete(ids: string[]): Promise<number> {
            const response = await this.api.post<number>(
                  API_ENDPOINTS.ADMINS.BULK.DELETE,
                  ids
            );
            return response;
      }

      async bulkActivateAll(filter: BulkAdminsFilterRequest): Promise<number> {
            const response = await this.api.post<number>(
                  API_ENDPOINTS.ADMINS.BULK.ACTIVATE,
                  filter
            );
            return response;
      }

      async bulkDeactivateAll(filter: BulkAdminsFilterRequest): Promise<number> {
            const response = await this.api.post<number>(
                  API_ENDPOINTS.ADMINS.BULK.DEACTIVATE,
                  filter
            );
            return response;
      }

      async bulkDeleteAll(filter: BulkAdminsFilterRequest): Promise<number> {
            const response = await this.api.post<number>(
                  API_ENDPOINTS.ADMINS.BULK.DELETE,
                  filter
            );
            return response;
      }
}
