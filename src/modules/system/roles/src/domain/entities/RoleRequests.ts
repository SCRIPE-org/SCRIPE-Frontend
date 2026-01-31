/**
 * Role Requests
 *
 * DTOs for role API operations.
 */

/**
 * Create role request
 */
export interface CreateRoleRequest {
      name: string;
      code: string;
      description?: string;
      tenantId?: string;
      priority?: number;
}

/**
 * Update role request
 */
export interface UpdateRoleRequest {
      name?: string;
      description?: string;
      priority?: number;
}

/**
 * Assign permissions to role request
 */
export interface AssignPermissionsRequest {
      permissions: PermissionAssignment[];
}

/**
 * Permission assignment with optional scope
 */
export interface PermissionAssignment {
      permissionId: string;
      scope?: string;
}
