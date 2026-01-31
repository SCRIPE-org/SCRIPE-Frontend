/**
 * Admin Requests
 *
 * DTOs for admin API operations.
 */

/**
 * Create admin request
 */
export interface CreateAdminRequest {
      username: string;
      password: string;
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      notes?: string;
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
