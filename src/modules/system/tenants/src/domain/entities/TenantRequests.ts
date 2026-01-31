/**
 * Tenant Requests
 *
 * DTOs for tenant API operations.
 */

/**
 * Create tenant request
 */
export interface CreateTenantRequest {
      name: string;
      code: string;
      parentId?: string;
      description?: string;
      settings?: Record<string, unknown>;
}

/**
 * Update tenant request
 */
export interface UpdateTenantRequest {
      name?: string;
      description?: string;
      isActive?: boolean;
      settings?: Record<string, unknown>;
}
