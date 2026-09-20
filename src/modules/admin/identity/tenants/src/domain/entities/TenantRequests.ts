/**
 * Tenant Requests
 *
 * DTOs for tenant API operations.
 * Matches backend Identity.Application.DTOs.Tenant
 */

/**
 * Create tenant request — 3-step stepper
 * Step 1: Tenant info (name, code, parent)
 * Step 2: Admin setup (email, username)
 * Step 3: Edition & billing
 */
export interface CreateTenantRequest {
  name: string;
  code: string;
  parentId?: string;
  description?: string;
  address?: string;
  countryCode?: string;
  timeZone?: string;
  organizationType?: string;
  // Step 2: Admin
  adminEmail: string;
  adminUsername?: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminPhoneNumber?: string;
  adminPhone?: string;
  adminCustomFieldValues?: Record<string, unknown>;
  // Step 3: Edition & Billing
  editionId?: string;
  subscriptionType?: string;
  currency?: string;
  skipPayment?: boolean;
  promotionId?: string;
  promoCode?: string;
  availablePermissionIds?: string[];
}

/**
 * Result returned by the backend after tenant creation
 */
export interface CreateTenantResult {
  tenantId: string;
  adminId: string;
  adminUsername: string;
  adminEmail: string;
  accountSetupUrl: string;
  subscriptionId?: string;
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
