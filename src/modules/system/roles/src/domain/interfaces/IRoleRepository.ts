/**
 * Role Repository Interface
 *
 * Defines the contract for role data operations.
 */
import type { Role, RoleData } from "../entities/Role";
import type { Permission } from "@modules/system/permissions/src/domain/entities/Permission";
import type {
      CreateRoleRequest,
      UpdateRoleRequest,
      AssignPermissionsRequest,
      DeleteRoleRequest,
} from "../entities/RoleRequests";
import type { PagedResult } from "@modules/system/core/domain/types";

/**
 * Role list query parameters
 */
export interface RoleListParams {
      page: number;
      pageSize: number;
      search?: string;
      tenantId?: string;
      strict?: boolean;
}

export interface MyTenantRoleListParams {
      page: number;
      pageSize: number;
      search?: string;
}

/**
 * Role repository interface
 */
export interface IRoleRepository {
      /**
       * Get paginated list of roles
       */
      getAll(params: RoleListParams): Promise<PagedResult<Role>>;

      /**
       * Get paginated list of roles belonging to current user's tenant
       */
      getMyTenantRoles(params: MyTenantRoleListParams): Promise<PagedResult<Role>>;

      /**
       * Get role by ID
       */
      getById(id: string): Promise<Role>;

      /**
       * Create a new role
       */
      create(request: CreateRoleRequest): Promise<string>;

      /**
       * Create a role for the current user's tenant (tenantId from JWT)
       */
      createForMyTenant(request: Omit<CreateRoleRequest, 'tenantId'>): Promise<string>;

      /**
       * Update an existing role
       */
      update(id: string, request: UpdateRoleRequest): Promise<void>;

      /**
       * Delete a role (soft delete)
       * @param options - Optional fallback role for admin transfer
       */
      delete(id: string, options?: DeleteRoleRequest): Promise<void>;

      /**
       * Assign permissions to a role (replaces all permissions)
       */
      assignPermissions(roleId: string, request: AssignPermissionsRequest): Promise<void>;

      /**
       * Remove a single permission from a role
       */
      removePermission(roleId: string, permissionId: string): Promise<void>;

      /**
       * Get permissions assigned to a role
       */
      getRolePermissions(roleId: string): Promise<any[]>;

      /**
       * Get available permissions for role assignment in current user's tenant
       */
      getMyTenantAvailablePermissions(category?: string): Promise<Permission[]>;

      /**
       * Get count of admins assigned to this role
       */
      getAdminCount(roleId: string): Promise<number>;
}
