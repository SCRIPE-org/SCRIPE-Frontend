/**
 * Admin Requests
 *
 * DTOs for admin API operations.
 */

/**
 * Create admin request
 * Supports two modes:
 * 1. Email invitation (sendSetupEmail=true, default): password not needed, email required
 * 2. Manual password (sendSetupEmail=false): password required, optional mustChangePassword
 */
export interface CreateAdminRequest {
  username: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  roleIds?: string[]; // Optional - at least one role OR group required
  userGroupIds?: string[]; // Optional - at least one role OR group required
  tenantId?: string;
  /** When true (default), sends email invitation. When false, uses provided password. */
  sendSetupEmail?: boolean;
  /** Only valid when sendSetupEmail=false. Forces password change on first login. */
  mustChangePassword?: boolean;
}

/**
 * Update admin request
 */
export interface UpdateAdminRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
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

/**
 * Transfer protection request
 */
export interface TransferProtectionRequest {
  targetAdminId: string;
}
