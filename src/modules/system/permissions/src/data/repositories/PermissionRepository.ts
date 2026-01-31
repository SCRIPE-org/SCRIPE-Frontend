/**
 * Permission Repository Implementation
 *
 * Implements IPermissionRepository using the API service.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type {
      IPermissionRepository,
      PermissionListParams,
} from "../../domain/interfaces/IPermissionRepository";
import { Permission, PermissionData } from "../../domain/entities/Permission";
import type {
      CreatePermissionRequest,
      UpdatePermissionRequest,
} from "../../domain/entities/PermissionRequests";

export class PermissionRepository implements IPermissionRepository {
      constructor(private readonly api: IApiService) { }

      async getAll(params?: PermissionListParams): Promise<Permission[]> {
            const url = buildUrl(API_ENDPOINTS.PERMISSIONS.LIST, {
                  category: params?.category,
                  search: params?.search,
            });

            const response = await this.api.get<PermissionData[]>(url);

            return response.map((data) => new Permission(data));
      }

      async getById(id: string): Promise<Permission> {
            const data = await this.api.get<PermissionData>(
                  API_ENDPOINTS.PERMISSIONS.BY_ID(id)
            );
            return new Permission(data);
      }

      async getCategories(): Promise<string[]> {
            return await this.api.get<string[]>(API_ENDPOINTS.PERMISSIONS.CATEGORIES);
      }

      async create(request: CreatePermissionRequest): Promise<string> {
            const response = await this.api.post<{ id: string }>(
                  API_ENDPOINTS.PERMISSIONS.CREATE,
                  request
            );
            return response.id;
      }

      async update(id: string, request: UpdatePermissionRequest): Promise<void> {
            await this.api.put(API_ENDPOINTS.PERMISSIONS.UPDATE(id), request);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.PERMISSIONS.DELETE(id));
      }
}
