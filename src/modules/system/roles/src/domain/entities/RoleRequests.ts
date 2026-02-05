/**
 * Role Requests
 *
 * DTOs for role API operations.
 */

/**
 * Create role request
 */
export interface CreateRoleRequest {
      nameEn: string;
      nameAr: string;
      code: string;
      descriptionEn?: string;
      descriptionAr?: string;
      tenantId?: string;
      priority?: number;
}

/**
 * Update role request
 */
export interface UpdateRoleRequest {
      nameEn: string;
      nameAr: string;
      descriptionEn?: string;
      descriptionAr?: string;
      priority: number;
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

/**
 * Delete role request
 * Supports admin transfer before deletion
 */
export interface DeleteRoleRequest {
      /** Role ID to transfer admins to before deletion */
      fallbackRoleId?: string;
}
