/**
 * Admin Service Interface
 *
 * Defines the contract for Admin API operations.
 * Service returns AdminModel (DTO), not domain entities.
 * Repository uses Mapper to convert to entities.
 *
 * @module admin/domain
 */
import type {
  AdminModel,
  AdminRoleJson,
  CreateAdminJson,
  UpdateAdminJson,
  AssignRoleJson,
  BulkAdminsFilterJson,
  TransferAdminJson,
  SyncRoleAssignmentJson,
} from "../types/AdminTypes";

/**
 * Admin list query parameters
 */
export interface ServiceAdminListParams {
  page: number;
  pageSize: number;
  search?: string;
  isActive?: boolean;
}

/**
 * Paginated result from service
 */
export interface AdminListResult {
  items: AdminModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**

 * Admin Service Interface
 */
export interface IAdminService {
  /**
   * Get paginated list of admins based on user's data scope
   */
  getAll(params: ServiceAdminListParams): Promise<AdminListResult>;

  /**
   * Get admins for a specific tenant by tenant ID
   */
  getByTenantId(tenantId: string, params: ServiceAdminListParams): Promise<AdminListResult>;

  /**
   * Get admins belonging to current user's tenant
   */
  getMyTenantAdmins(params: ServiceAdminListParams): Promise<AdminListResult>;

  /**
   * Get admin by ID
   */
  getById(id: string): Promise<AdminModel>;

  /**
   * Create a new admin (with explicit tenantId)
   */
  create(json: CreateAdminJson): Promise<{ id: string }>;

  /**
   * Create admin for current user's tenant (tenantId from token)
   */
  createForMyTenant(json: Omit<CreateAdminJson, "tenantId">): Promise<{ id: string }>;

  /**
   * Update an existing admin
   */
  update(id: string, json: UpdateAdminJson): Promise<void>;

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
  assignRole(adminId: string, json: AssignRoleJson): Promise<void>;

  /**
   * Remove a role from an admin
   */
  removeRole(adminId: string, roleId: string, tenantId?: string): Promise<void>;

  /**
   * Sync all roles for an admin (Nuke & Pave pattern).
   */
  /**
   * Sync all roles for an admin (Nuke & Pave pattern).
   */
  syncRoles(
    adminId: string,
    assignments: SyncRoleAssignmentJson[],
    scopeTenantId?: string
  ): Promise<void>;

  /**
   * Get all roles assigned to an admin
   */
  getRoles(adminId: string): Promise<AdminRoleJson[]>;

  /**
   * Reset admin's password
   */
  resetPassword(id: string, newPassword: string): Promise<void>;

  /**
   * Change admin's own password
   */
  changePassword(id: string, currentPassword: string, newPassword: string): Promise<void>;

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
  bulkActivateAll(filter: BulkAdminsFilterJson): Promise<number>;

  /**
   * Bulk deactivate all matching admins
   */
  bulkDeactivateAll(filter: BulkAdminsFilterJson): Promise<number>;

  /**
   * Bulk delete all matching admins
   */
  bulkDeleteAll(filter: BulkAdminsFilterJson): Promise<number>;



  /**
   * Transfer admin to another tenant
   */
  transfer(id: string, json: TransferAdminJson): Promise<void>;

  /**
   * Transfer IsProtected flag from the current protected admin to another
   */
  transferProtection(targetAdminId: string): Promise<void>;
}
