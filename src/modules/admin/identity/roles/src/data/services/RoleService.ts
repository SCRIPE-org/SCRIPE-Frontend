/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Role Service
 *
 * Handles all API calls for the Roles module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * @module roles/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  RoleModel,
  type RoleJson,
  type RoleListResponseJson,
  type CreateRoleJson,
  type UpdateRoleJson,
  type AssignPermissionsJson,
} from "../models/RoleModel";
import type {
  RoleWorkspaceEntryPolicyDto,
  UpsertRoleWorkspaceEntriesRequestDto,
} from "../models/RoleWorkspaceEntryPolicyModel";
import { PermissionModel } from "@modules/identity/core";
import type { PermissionModuleGroupJson } from "@modules/identity/core";
import type {
  IRoleService,
  RoleListResult,
  ServiceRoleListParams,
  CurrentTenantRoleListParams,
} from "../../domain/interfaces/IRoleService";
import { ROLES_ENDPOINTS } from "./roles.endpoints";

/**
 * Http API network service for role.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class RoleService implements IRoleService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: ServiceRoleListParams): Promise<RoleListResult> {
    const url = buildUrl(ROLES_ENDPOINTS.LIST, {
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
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getCurrentTenantRoles(params: CurrentTenantRoleListParams): Promise<RoleListResult> {
    const url = buildUrl(ROLES_ENDPOINTS.CURRENT_TENANT, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
    });

    const response = await this.api.get<RoleListResponseJson>(url);

    return {
      items: response.items.map((json) => RoleModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<RoleModel> {
    const json = await this.api.get<RoleJson>(ROLES_ENDPOINTS.BY_ID(id));
    return RoleModel.fromJson(json);
  }

  async create(json: CreateRoleJson): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(ROLES_ENDPOINTS.CREATE, json);
  }

  async createInCurrentTenant(json: Omit<CreateRoleJson, "tenantId">): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(ROLES_ENDPOINTS.CREATE_IN_CURRENT_TENANT, json);
  }

  async update(id: string, json: UpdateRoleJson): Promise<void> {
    await this.api.put(ROLES_ENDPOINTS.UPDATE(id), json);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(ROLES_ENDPOINTS.DELETE(id));
  }

  async assignPermissions(roleId: string, json: AssignPermissionsJson): Promise<void> {
    await this.api.post(ROLES_ENDPOINTS.PERMISSIONS(roleId), json);
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await this.api.delete(ROLES_ENDPOINTS.REMOVE_PERMISSION(roleId, permissionId));
  }

  async getRolePermissions(roleId: string): Promise<RoleJson["permissions"]> {
    return this.api.get<RoleJson["permissions"]>(ROLES_ENDPOINTS.PERMISSIONS(roleId));
  }

  async getTenantPermissions(tenantId: string): Promise<PermissionModel[]> {
    // Get permissions assigned to this specific tenant
    const response = await this.api.get<any[]>(ROLES_ENDPOINTS.TENANTS.PERMISSIONS(tenantId));

    // If tenant has no assigned permissions, fall back to creation-permissions
    if (!response || response.length === 0) {
      const url = buildUrl(ROLES_ENDPOINTS.TENANTS.CREATION_PERMISSIONS, { parentId: tenantId });
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
    const url = buildUrl(ROLES_ENDPOINTS.TENANTS.PERMISSIONS_GROUPED(tenantId), { search });
    return this.api.get(url);
  }

  async getCurrentTenantAvailablePermissions(category?: string): Promise<PermissionModel[]> {
    const url = buildUrl(ROLES_ENDPOINTS.CURRENT_TENANT_AVAILABLE_PERMISSIONS, {
      category: category || undefined,
    });

    const response = await this.api.get<any[]>(url);
    return response.map((p) => PermissionModel.fromJson(p));
  }

  async getCurrentTenantAvailablePermissionsGrouped(
    search?: string
  ): Promise<PermissionModuleGroupJson[]> {
    const url = buildUrl(ROLES_ENDPOINTS.CURRENT_TENANT_AVAILABLE_PERMISSIONS_GROUPED, {
      search,
    });
    return this.api.get(url);
  }

  async getAdminCount(roleId: string): Promise<number> {
    return this.api.get<number>(`${ROLES_ENDPOINTS.BY_ID(roleId)}/admin-count`);
  }

  async clone(
    id: string,
    json: { nameEn: string; nameAr: string; descriptionEn?: string; descriptionAr?: string }
  ): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(ROLES_ENDPOINTS.CLONE(id), json);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    const response = await this.api.post<{ affectedRows?: number } | number>(
      ROLES_ENDPOINTS.BULK.DELETE,
      { ids }
    );
    if (typeof response === "number") return response;
    return response?.affectedRows ?? ids.length;
  }

  async getRoleWorkspaceEntries(roleId: string): Promise<RoleWorkspaceEntryPolicyDto[]> {
    const raw = await this.api.get<unknown>(ROLES_ENDPOINTS.WORKSPACE_ENTRIES(roleId));
    if (Array.isArray(raw)) return raw as RoleWorkspaceEntryPolicyDto[];
    const wrapped = raw as { data?: unknown } | null | undefined;
    return Array.isArray(wrapped?.data) ? (wrapped.data as RoleWorkspaceEntryPolicyDto[]) : [];
  }

  async upsertRoleWorkspaceEntries(
    roleId: string,
    body: UpsertRoleWorkspaceEntriesRequestDto
  ): Promise<RoleWorkspaceEntryPolicyDto[]> {
    const raw = await this.api.put<unknown>(ROLES_ENDPOINTS.WORKSPACE_ENTRIES(roleId), body);
    if (Array.isArray(raw)) return raw as RoleWorkspaceEntryPolicyDto[];
    const wrapped = raw as { data?: unknown } | null | undefined;
    return Array.isArray(wrapped?.data) ? (wrapped.data as RoleWorkspaceEntryPolicyDto[]) : [];
  }

  async deleteRoleWorkspaceEntry(roleId: string, workspaceKey: string): Promise<void> {
    await this.api.delete<void>(ROLES_ENDPOINTS.DELETE_WORKSPACE_ENTRY(roleId, workspaceKey));
  }
}
