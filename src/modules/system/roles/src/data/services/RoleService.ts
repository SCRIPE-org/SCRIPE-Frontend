/**
 * Role Service
 *
 * Handles all API calls for the Roles module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * @module roles/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import {
      RoleModel,
      type RoleJson,
      type RoleListResponseJson,
      type CreateRoleJson,
      type UpdateRoleJson,
      type AssignPermissionsJson,
} from "../models/RoleModel";

export interface RoleListParams {
      page?: number;
      pageSize?: number;
      search?: string;
      tenantId?: string;
}

export interface RoleListResult {
      items: RoleModel[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
}

export interface IRoleService {
      getAll(params: RoleListParams): Promise<RoleListResult>;
      getById(id: string): Promise<RoleModel>;
      create(json: CreateRoleJson): Promise<{ id: string }>;
      update(id: string, json: UpdateRoleJson): Promise<void>;
      delete(id: string): Promise<void>;
      assignPermissions(roleId: string, json: AssignPermissionsJson): Promise<void>;
      removePermission(roleId: string, permissionId: string): Promise<void>;
      getRolePermissions(roleId: string): Promise<RoleJson["permissions"]>;
      getAdminCount(roleId: string): Promise<number>;
}

export class RoleService implements IRoleService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: RoleListParams): Promise<RoleListResult> {
            const url = buildUrl(API_ENDPOINTS.ROLES.LIST, {
                  page: params.page,
                  pageSize: params.pageSize,
                  search: params.search,
                  tenantId: params.tenantId,
            });

            const response = await this.api.get<RoleListResponseJson>(url);

            return {
                  items: response.items.map((json) => RoleModel.fromJson(json)),
                  totalCount: response.totalCount,
                  page: response.page,
                  pageSize: response.pageSize,
                  totalPages: response.totalPages,
                  hasNextPage: response.hasNextPage,
                  hasPreviousPage: response.hasPreviousPage,
            };
      }

      async getById(id: string): Promise<RoleModel> {
            const json = await this.api.get<RoleJson>(API_ENDPOINTS.ROLES.BY_ID(id));
            return RoleModel.fromJson(json);
      }

      async create(json: CreateRoleJson): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.ROLES.CREATE, json);
      }

      async update(id: string, json: UpdateRoleJson): Promise<void> {
            await this.api.put(API_ENDPOINTS.ROLES.UPDATE(id), json);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.ROLES.DELETE(id));
      }

      async assignPermissions(
            roleId: string,
            json: AssignPermissionsJson
      ): Promise<void> {
            await this.api.post(API_ENDPOINTS.ROLES.PERMISSIONS(roleId), json);
      }

      async removePermission(roleId: string, permissionId: string): Promise<void> {
            await this.api.delete(
                  API_ENDPOINTS.ROLES.REMOVE_PERMISSION(roleId, permissionId)
            );
      }

      async getRolePermissions(roleId: string): Promise<RoleJson["permissions"]> {
            return this.api.get<RoleJson["permissions"]>(
                  API_ENDPOINTS.ROLES.PERMISSIONS(roleId)
            );
      }

      async getAdminCount(roleId: string): Promise<number> {
            return this.api.get<number>(`${API_ENDPOINTS.ROLES.BY_ID(roleId)}/admin-count`);
      }
}
