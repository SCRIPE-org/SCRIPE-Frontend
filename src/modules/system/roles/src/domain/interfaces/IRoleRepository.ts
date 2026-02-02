/**
 * Role Repository Interface
 *
 * Defines the contract for role data operations.
 */
import type { Role, RoleData } from "../entities/Role";
import type {
      CreateRoleRequest,
      UpdateRoleRequest,
      AssignPermissionsRequest,
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
       * Get role by ID
       */
      getById(id: string): Promise<Role>;

      /**
       * Create a new role
       */
      create(request: CreateRoleRequest): Promise<string>;

      /**
       * Update an existing role
       */
      update(id: string, request: UpdateRoleRequest): Promise<void>;

      /**
       * Delete a role
       */
      delete(id: string): Promise<void>;

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
}
