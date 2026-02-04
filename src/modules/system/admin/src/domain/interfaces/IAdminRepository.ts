/**
 * Admin Repository Interface
 *
 * Defines the contract for admin data operations.
 */
import type { Admin } from "../entities/Admin";
import type {
      CreateAdminRequest,
      UpdateAdminRequest,
      AssignRoleRequest,
      // ResetPasswordRequest,
      BulkAdminsFilterRequest,
} from "../entities/AdminRequests";
import type { PagedResult } from "@modules/system/core/domain/types";

/**
 * Admin list query parameters
 */
export interface AdminListParams {
      page: number;
      pageSize: number;
      search?: string;
      isActive?: boolean;
}

/**
 * Admin repository interface
 */
export interface IAdminRepository {
      /**
       * Get paginated list of admins based on user's data scope
       */
      getAll(params: AdminListParams): Promise<PagedResult<Admin>>;

      /**
       * Get admins for a specific tenant by tenant ID
       */
      getByTenantId(tenantId: string, params: AdminListParams): Promise<PagedResult<Admin>>;

      /**
       * Get admins belonging to current user's tenant
       */
      getMyTenantAdmins(params: AdminListParams): Promise<PagedResult<Admin>>;

      /**
       * Get admin by ID
       */
      getById(id: string): Promise<Admin>;

      /**
       * Create a new admin (with explicit tenantId)
       */
      create(request: CreateAdminRequest): Promise<string>;

      /**
       * Create admin for current user's tenant (tenantId from token)
       */
      createForMyTenant(request: Omit<CreateAdminRequest, 'tenantId'>): Promise<string>;

      /**
       * Update an existing admin
       */
      update(id: string, request: UpdateAdminRequest): Promise<void>;

      /**
       * Delete an admin (soft delete)
       */
      delete(id: string): Promise<void>;

      /**
       * Set admin active status
       */
      setActive(id: string, isActive: boolean): Promise<void>;

      /**
       * Assign a role to an admin
       */
      assignRole(adminId: string, request: AssignRoleRequest): Promise<void>;

      /**
       * Remove a role from an admin
       */
      removeRole(adminId: string, roleId: string, tenantId?: string): Promise<void>;

      /**
       * Get all roles assigned to an admin
       */
      getRoles(adminId: string): Promise<import("../entities/Admin").AdminRoleData[]>;

      /**
       * Reset admin's password
       */
      resetPassword(id: string, newPassword: string): Promise<void>;

      /**
       * Bulk activate admins by IDs
       */
      bulkActivate(ids: string[]): Promise<number>;

      /**
       * Bulk deactivate admins by IDs
       */
      bulkDeactivate(ids: string[]): Promise<number>;

      /**
       * Bulk delete admins by IDs
       */
      bulkDelete(ids: string[]): Promise<number>;

      /**
       * Bulk activate all matching admins
       */
      bulkActivateAll(filter: BulkAdminsFilterRequest): Promise<number>;

      /**
       * Bulk deactivate all matching admins
       */
      bulkDeactivateAll(filter: BulkAdminsFilterRequest): Promise<number>;

      /**
       * Bulk delete all matching admins
       */
      bulkDeleteAll(filter: BulkAdminsFilterRequest): Promise<number>;
}
