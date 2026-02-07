/**
 * Admin Requests
 *
 * DTOs for admin API operations.
 */

/**
 * Create admin request
 * roleIds is required - every admin must be assigned to at least one role at creation
 */
export interface CreateAdminRequest {
      username: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      notes?: string;
      roleIds: string[]; // Required - at least one role
      tenantId?: string;
}

/**
 * Update admin request
 */
export interface UpdateAdminRequest {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      notes?: string;
      isActive?: boolean;
}

/**
 * Assign role to admin request
 */
export interface AssignRoleRequest {
      roleId: string;
      tenantId?: string;
      inheritToChildren?: boolean;
      expiresAt?: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
      newPassword: string;
}

/**
 * Change password request
 */
export interface ChangePasswordRequest {
      currentPassword: string;
      newPassword: string;
}

/**
 * Bulk admins filter request
 */
export interface BulkAdminsFilterRequest {
      search?: string;
      isActive?: boolean;
}

/**
 * Transfer admin request
 */
export interface TransferAdminRequest {
      targetTenantId: string | null; // Null for System (Super Admin)
      targetRoleId: string;
}
