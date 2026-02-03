/**
 * Tenant Requests
 *
 * DTOs for tenant API operations.
 * Matches backend Identity.Application.DTOs.Tenant
 */

/**
 * Create tenant request
 * Backend auto-creates {CODE}_SUPER_ADMIN and {CODE}_DEFAULT roles
 */
export interface CreateTenantRequest {
      name: string;
      code: string;
      parentId?: string;
      description?: string;
      address?: string;
      /** Encrypted permission IDs to assign to this tenant */
      availablePermissionIds?: string[];
}

/**
 * Update tenant request
 */
export interface UpdateTenantRequest {
      name?: string;
      description?: string;
      address?: string;
      isActive?: boolean;
}
