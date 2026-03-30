/**
 * Permission Service Interface
 *
 * Defines the contract for permission API operations.
 * Implementation in data/services/PermissionService.ts
 *
 * @module permissions/domain
 */
import type { PermissionModel } from "../types/PermissionModelTypes";
import type { CreatePermissionJson, UpdatePermissionJson } from "../types/PermissionModelTypes";
import type { PermissionListParams } from "./IPermissionRepository";

export interface IPermissionService {
  getAll(params?: PermissionListParams): Promise<PermissionModel[]>;
  getMyPermissions(params?: PermissionListParams): Promise<PermissionModel[]>;
  getForTenant(tenantId: string, params?: PermissionListParams): Promise<PermissionModel[]>;
  getById(id: string): Promise<PermissionModel>;
  getCategories(): Promise<string[]>;
  create(json: CreatePermissionJson): Promise<{ id: string }>;
  update(id: string, json: UpdatePermissionJson): Promise<void>;
  delete(id: string): Promise<void>;
}
