/**
 * Permission Repository Interface
 *
 * Defines the contract for permission data operations.
 */
import type { Permission, PermissionModuleGroup } from "../entities/Permission";

/**
 * Permission list query parameters
 */
export interface PermissionListParams {
  category?: string;
  search?: string;
}

/**
 * Permission repository interface
 */
export interface IPermissionRepository {
  /**
   * Get all permissions with optional filtering
   */
  getAll(params?: PermissionListParams): Promise<Permission[]>;

  /**
   * Get only current user's assigned permissions
   */
  getMyPermissions(params?: PermissionListParams): Promise<Permission[]>;

  /**
   * Get permissions assigned to a specific tenant
   */
  getForTenant(tenantId: string, params?: PermissionListParams): Promise<Permission[]>;

  /**
   * Get permission by ID
   */
  getById(id: string): Promise<Permission>;

  /**
   * Get all permission categories
   */
  getCategories(): Promise<string[]>;

  /**
   * Get ALL permissions grouped by Module → Category (backend-driven).
   * Used by the Permissions page. Zero client-side grouping.
   */
  getGrouped(search?: string): Promise<PermissionModuleGroup[]>;

  /**
   * Get permissions assigned to a specific tenant, grouped by Module → Category.
   * Used in tenant drill-down / tenant admin mode.
   */
  getGroupedForTenant(tenantId: string, search?: string): Promise<PermissionModuleGroup[]>;
}
