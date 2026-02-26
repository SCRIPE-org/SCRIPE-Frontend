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
  /** Edition ID to assign upon creation */
  editionId?: string;
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

/**
 * Delete tenant request
 * Supports cascade delete of entire hierarchy
 */
export interface DeleteTenantRequest {
  /** If true, cascade soft delete all descendant tenants, admins, and roles */
  cascadeChildren?: boolean;
}
