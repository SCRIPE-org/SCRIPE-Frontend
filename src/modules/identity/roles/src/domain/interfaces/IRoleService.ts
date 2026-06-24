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
} from "../types/RoleModelTypes";
import type { PermissionModel, PermissionModuleGroupJson } from "@modules/identity/core";
import type { MyTenantRoleListParams } from "./IRoleRepository";

/**
 * Interface structure detailing the properties and attributes of Service Role List Params.
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
export type { MyTenantRoleListParams };

/**
 * Interface structure detailing the properties and attributes of Role List Result.
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
 * Interface defining operations for the Role network service.
 */
export interface IRoleService {
  getAll(params: ServiceRoleListParams): Promise<RoleListResult>;
  getMyTenantRoles(params: MyTenantRoleListParams): Promise<RoleListResult>;
  getMyTenantAvailablePermissions(category?: string): Promise<PermissionModel[]>;
  getMyTenantAvailablePermissionsGrouped(search?: string): Promise<PermissionModuleGroupJson[]>;
  getById(id: string): Promise<RoleModel>;
  create(json: CreateRoleJson): Promise<{ id: string }>;
  createForMyTenant(json: Omit<CreateRoleJson, "tenantId">): Promise<{ id: string }>;
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
  /** GET /roles/my-tenant/available-permissions/grouped — grouped for current tenant role assignment */
  getMyTenantAvailablePermissionsGrouped(search?: string): Promise<PermissionModuleGroupJson[]>;

  getAdminCount(roleId: string): Promise<number>;
  clone(
    id: string,
    json: { nameEn: string; nameAr: string; descriptionEn?: string; descriptionAr?: string }
  ): Promise<{ id: string }>;
  bulkDelete(ids: string[]): Promise<number>;
}
