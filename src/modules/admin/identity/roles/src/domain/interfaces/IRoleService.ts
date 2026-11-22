/**
 * Role Service Interface
 *
 * Defines the contract for role API operations.
 * Implementation in data/services/RoleService.ts
 *
 * @module roles/domain
 */
import type { RoleModel } from "../types/RoleModelTypes";
import type {
  RoleJson,
  CreateRoleJson,
  UpdateRoleJson,
  AssignPermissionsJson,
  RoleWorkspaceEntryPolicyDto,
  UpsertRoleWorkspaceEntriesRequestDto,
} from "../types/RoleModelTypes";
import type { PermissionModel, PermissionModuleGroupJson } from "@modules/identity/core";
import type { CurrentTenantRoleListParams } from "./IRoleRepository";

/**
 * Interface defining property specifications, keys types, and structural contract rules for service role list params.
 */
export interface ServiceRoleListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tenantId?: string;
  strict?: boolean;
}

// Re-export for convenience (single source of truth in IRoleRepository)
/**
 * Exported type in the identity/roles module.
 */
export type { CurrentTenantRoleListParams };

/**
 * Interface defining property specifications, keys types, and structural contract rules for role list result.
 */
export interface RoleListResult {
  items: RoleModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Http API network service for i role.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IRoleService {
  getAll(params: ServiceRoleListParams): Promise<RoleListResult>;
  getCurrentTenantRoles(params: CurrentTenantRoleListParams): Promise<RoleListResult>;
  getCurrentTenantAvailablePermissions(category?: string): Promise<PermissionModel[]>;
  getCurrentTenantAvailablePermissionsGrouped(
    search?: string
  ): Promise<PermissionModuleGroupJson[]>;
  getById(id: string): Promise<RoleModel>;
  create(json: CreateRoleJson): Promise<{ id: string }>;
  createInCurrentTenant(json: Omit<CreateRoleJson, "tenantId">): Promise<{ id: string }>;
  update(id: string, json: UpdateRoleJson): Promise<void>;
  delete(id: string): Promise<void>;
  assignPermissions(roleId: string, json: AssignPermissionsJson): Promise<void>;
  removePermission(roleId: string, permissionId: string): Promise<void>;
  getRolePermissions(roleId: string): Promise<RoleJson["permissions"]>;
  getTenantPermissions(tenantId: string): Promise<PermissionModel[]>;
  /** GET /Tenants/{id}/permissions/grouped — backend groups by Module → Category */
  getTenantPermissionsGrouped(
    tenantId: string,
    search?: string
  ): Promise<PermissionModuleGroupJson[]>;

  getAdminCount(roleId: string): Promise<number>;
  clone(
    id: string,
    json: { nameEn: string; nameAr: string; descriptionEn?: string; descriptionAr?: string }
  ): Promise<{ id: string }>;
  bulkDelete(ids: string[]): Promise<number>;
  getRoleWorkspaceEntries(roleId: string): Promise<RoleWorkspaceEntryPolicyDto[]>;
  upsertRoleWorkspaceEntries(
    roleId: string,
    body: UpsertRoleWorkspaceEntriesRequestDto
  ): Promise<RoleWorkspaceEntryPolicyDto[]>;
  deleteRoleWorkspaceEntry(roleId: string, workspaceKey: string): Promise<void>;
}
