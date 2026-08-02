/**
 * Permission Service Interface
 *
 * Defines the contract for permission API operations.
 * Implementation in data/services/PermissionService.ts
 *
 * @module permissions/domain
 */
import type { PermissionModel } from "../types/PermissionModelTypes";
import type { PermissionListParams } from "./IPermissionRepository";
import type { PermissionModuleGroupJson } from "../../data/models/PermissionModel";

/**
 * Http API network service for i permission.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IPermissionService {
  getAll(params?: PermissionListParams): Promise<PermissionModel[]>;
  getMyPermissions(params?: PermissionListParams): Promise<PermissionModel[]>;
  getForTenant(tenantId: string, params?: PermissionListParams): Promise<PermissionModel[]>;
  getById(id: string): Promise<PermissionModel>;
  getCategories(): Promise<string[]>;
  /** Get permissions grouped by Module → Category from backend */
  getGrouped(search?: string): Promise<PermissionModuleGroupJson[]>;
  /** Get tenant's permissions grouped by Module → Category from backend */
  getGroupedForTenant(tenantId: string, search?: string): Promise<PermissionModuleGroupJson[]>;
}
