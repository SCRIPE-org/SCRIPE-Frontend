/**
 * Role Service Interface
 *
 * Defines the contract for role API operations.
 * Implementation in data/services/RoleService.ts
 *
 * @module roles/domain
 */
import type { RoleModel } from "../../data/models/RoleModel";
import type {
      RoleJson,
      CreateRoleJson,
      UpdateRoleJson,
      AssignPermissionsJson,
} from "../../data/models/RoleModel";
import type { PermissionModel } from "@modules/system/permissions/src/data/models/PermissionModel";
import type { MyTenantRoleListParams } from "./IRoleRepository";

export interface ServiceRoleListParams {
      page?: number;
      pageSize?: number;
      search?: string;
      tenantId?: string;
}

// Re-export for convenience (single source of truth in IRoleRepository)
export type { MyTenantRoleListParams };

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
      getAll(params: ServiceRoleListParams): Promise<RoleListResult>;
      getMyTenantRoles(params: MyTenantRoleListParams): Promise<RoleListResult>;
      getMyTenantAvailablePermissions(category?: string): Promise<PermissionModel[]>;
      getById(id: string): Promise<RoleModel>;
      create(json: CreateRoleJson): Promise<{ id: string }>;
      createForMyTenant(json: Omit<CreateRoleJson, 'tenantId'>): Promise<{ id: string }>;
      update(id: string, json: UpdateRoleJson): Promise<void>;
      delete(id: string): Promise<void>;
      assignPermissions(roleId: string, json: AssignPermissionsJson): Promise<void>;
      removePermission(roleId: string, permissionId: string): Promise<void>;
      getRolePermissions(roleId: string): Promise<RoleJson["permissions"]>;
      getAdminCount(roleId: string): Promise<number>;
}
