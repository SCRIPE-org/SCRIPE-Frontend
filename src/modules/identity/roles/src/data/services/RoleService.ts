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
import { PermissionModel } from "@modules/identity/permissions";
import type { PermissionModuleGroupJson } from "@modules/identity/permissions";
import type {
  IRoleService,
  RoleListResult,
  ServiceRoleListParams,
  MyTenantRoleListParams,
} from "../../domain/interfaces/IRoleService";

export class RoleService implements IRoleService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: ServiceRoleListParams): Promise<RoleListResult> {
    const url = buildUrl(API_ENDPOINTS.ROLES.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      tenantId: params.tenantId,
      strict: params.strict,
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

  async getMyTenantRoles(params: MyTenantRoleListParams): Promise<RoleListResult> {
    const url = buildUrl(API_ENDPOINTS.ROLES.MY_TENANT_ROLES, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
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

  async createForMyTenant(json: Omit<CreateRoleJson, "tenantId">): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ROLES.CREATE_FOR_MY_TENANT, json);
  }

  async update(id: string, json: UpdateRoleJson): Promise<void> {
    await this.api.put(API_ENDPOINTS.ROLES.UPDATE(id), json);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ROLES.DELETE(id));
  }

  async assignPermissions(roleId: string, json: AssignPermissionsJson): Promise<void> {
    await this.api.post(API_ENDPOINTS.ROLES.PERMISSIONS(roleId), json);
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ROLES.REMOVE_PERMISSION(roleId, permissionId));
  }

  async getRolePermissions(roleId: string): Promise<RoleJson["permissions"]> {
    return this.api.get<RoleJson["permissions"]>(API_ENDPOINTS.ROLES.PERMISSIONS(roleId));
  }

  async getTenantPermissions(tenantId: string): Promise<PermissionModel[]> {
    // Get permissions assigned to this specific tenant
    const response = await this.api.get<any[]>(API_ENDPOINTS.TENANTS.PERMISSIONS(tenantId));

    // If tenant has no assigned permissions, fall back to creation-permissions
    if (!response || response.length === 0) {
      const url = buildUrl(API_ENDPOINTS.TENANTS.CREATION_PERMISSIONS, { parentId: tenantId });
      const fallback = await this.api.get<any[]>(url);
      return (fallback ?? []).map((p) => PermissionModel.fromJson(p));
    }

    return response.map((p) => PermissionModel.fromJson(p));
  }

  async getTenantPermissionsGrouped(
    tenantId: string,
    search?: string
  ): Promise<PermissionModuleGroupJson[]> {
    // GET /Tenants/{id}/permissions/grouped — backend groups by Module → Category
    const url = buildUrl(API_ENDPOINTS.TENANTS.PERMISSIONS_GROUPED(tenantId), { search });
    return this.api.get(url);
  }

  async getMyTenantAvailablePermissions(category?: string): Promise<PermissionModel[]> {
    const params = new URLSearchParams();
    if (category) params.set("category", category);

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.ROLES.MY_TENANT_AVAILABLE_PERMISSIONS}?${queryString}`
      : API_ENDPOINTS.ROLES.MY_TENANT_AVAILABLE_PERMISSIONS;

    const response = await this.api.get<any[]>(url);
    return response.map((p) => PermissionModel.fromJson(p));
  }

  async getMyTenantAvailablePermissionsGrouped(search?: string): Promise<PermissionModuleGroupJson[]> {
    const url = buildUrl(API_ENDPOINTS.ROLES.MY_TENANT_AVAILABLE_PERMISSIONS_GROUPED, { search });
    return this.api.get(url);
  }

  async getAdminCount(roleId: string): Promise<number> {
    return this.api.get<number>(`${API_ENDPOINTS.ROLES.BY_ID(roleId)}/admin-count`);
  }

  async clone(
    id: string,
    json: { nameEn: string; nameAr: string; descriptionEn?: string; descriptionAr?: string }
  ): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ROLES.CLONE(id), json);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const response = await this.api.post<{ affectedRows?: number } | number>(
      API_ENDPOINTS.ROLES.BULK.DELETE,
      { ids }
    );
    if (typeof response === "number") return response;
    return response.affectedRows ?? ids.length;
  }
}
