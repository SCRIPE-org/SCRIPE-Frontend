/**
 * Permission Requests
 *
 * DTOs for permission API operations.
 */

/**
 * Create permission request
 */
export interface CreatePermissionRequest {
      resource: string;
      action: string;
      description?: string;
      category?: string;
      defaultScope?: string;
      displayOrder?: number;
}

/**
 * Update permission request
 */
export interface UpdatePermissionRequest {
      description?: string;
      category?: string;
      defaultScope?: string;
      displayOrder?: number;
}
