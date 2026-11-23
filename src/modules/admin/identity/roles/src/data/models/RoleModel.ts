/**
 * Role Model (DTO)
 *
 * Represents the raw API response/request for roles.
 * Contains static methods for JSON serialization/deserialization.
 *
 * @module roles/data
 */

// ===== JSON Shapes (API contracts) =====

import { PermissionScopes } from "../../domain/types/PermissionTypes";
import type {
  PermissionAssignmentJson,
  PermissionScopeType,
} from "../../domain/types/PermissionTypes";
/**
 * Exported type in the identity/roles module.
 */
export type { PermissionAssignmentJson, PermissionScopeType };
export { PermissionScopes };

/**
 * Interface defining property specifications, keys types, and structural contract rules for role permission json.
 */
export interface RolePermissionJson {
  permissionId: string;
  permissionCode: string;
  scope?: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for role json.
 */
export interface RoleJson {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  tenantId?: string;
  tenantName?: string;
  isSystem: boolean;
  isTenantSuperAdmin?: boolean;
  isPermissionLocked?: boolean;
  priority: number;
  isActive: boolean;
  permissions?: RolePermissionJson[]; // Optional for list responses
  createdAt: string;
  modifiedAt?: string;
  groupNamesEn?: string[];
  groupNamesAr?: string[];
  defaultLandingTarget?: string | null;
  isLandingEnforced?: boolean;
  rowVersion?: string | null;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for role list response json.
 */
export interface RoleListResponseJson {
  items: RoleJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for create role json.
 */
export interface CreateRoleJson {
  nameEn: string;
  nameAr: string;
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  priority: number;
  tenantId?: string;
  permissionIds?: string[];
  defaultLandingTarget?: string | null;
  isLandingEnforced?: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for update role json.
 */
export interface UpdateRoleJson {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  priority: number;
  isActive?: boolean;
  defaultLandingTarget?: string | null;
  isLandingEnforced?: boolean;
  rowVersion?: string | null;
}

// PermissionAssignmentJson re-exported from domain/types/PermissionTypes.ts

/**
 * Interface defining property specifications, keys types, and structural contract rules for assign permissions json.
 */
export interface AssignPermissionsJson {
  permissions: PermissionAssignmentJson[];
}

/**
 * Exported class defining parameters and fields for role model configurations.
 */
export class RoleModel {
  constructor(
    public readonly id: string,
    public readonly nameEn: string,
    public readonly nameAr: string,
    public readonly code: string,
    public readonly isSystem: boolean,
    public readonly priority: number,
    public readonly isActive: boolean,
    public readonly permissions: RolePermissionModel[],
    public readonly createdAt: string,
    public readonly descriptionEn?: string,
    public readonly descriptionAr?: string,
    public readonly tenantId?: string,
    public readonly tenantName?: string,
    public readonly modifiedAt?: string,
    public readonly groupNamesEn?: string[],
    public readonly groupNamesAr?: string[],
    public readonly defaultLandingTarget?: string | null,
    public readonly isLandingEnforced?: boolean,
    public readonly rowVersion?: string | null,
    public readonly isTenantSuperAdmin?: boolean,
    public readonly isPermissionLocked?: boolean
  ) {}

  static fromJson(json: RoleJson): RoleModel {
    return new RoleModel(
      json.id,
      json.nameEn,
      json.nameAr,
      json.code,
      json.isSystem,
      json.priority,
      json.isActive,
      json.permissions?.map((p) => RolePermissionModel.fromJson(p)) ?? [],
      json.createdAt,
      json.descriptionEn,
      json.descriptionAr,
      json.tenantId,
      json.tenantName,
      json.modifiedAt,
      json.groupNamesEn,
      json.groupNamesAr,
      json.defaultLandingTarget ?? null,
      Boolean(json.isLandingEnforced),
      json.rowVersion ?? null,
      Boolean(json.isTenantSuperAdmin),
      Boolean(json.isPermissionLocked)
    );
  }
  toJson(): RoleJson {
    return {
      id: this.id,
      nameEn: this.nameEn,
      nameAr: this.nameAr,
      code: this.code,
      descriptionEn: this.descriptionEn,
      descriptionAr: this.descriptionAr,
      tenantId: this.tenantId,
      tenantName: this.tenantName,
      isSystem: this.isSystem,
      isTenantSuperAdmin: Boolean(this.isTenantSuperAdmin),
      isPermissionLocked: Boolean(this.isPermissionLocked),
      priority: this.priority,
      isActive: this.isActive,
      permissions: this.permissions.map((p) => p.toJson()),
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
      groupNamesEn: this.groupNamesEn,
      groupNamesAr: this.groupNamesAr,
      defaultLandingTarget: this.defaultLandingTarget ?? null,
      isLandingEnforced: Boolean(this.isLandingEnforced),
      rowVersion: this.rowVersion ?? null,
    };
  }
}

/**
 * Exported class defining parameters and fields for role permission model configurations.
 */
export class RolePermissionModel {
  constructor(
    public readonly permissionId: string,
    public readonly permissionCode: string,
    public readonly scope?: string
  ) {}

  static fromJson(json: RolePermissionJson): RolePermissionModel {
    return new RolePermissionModel(json.permissionId, json.permissionCode, json.scope);
  }

  toJson(): RolePermissionJson {
    return {
      permissionId: this.permissionId,
      permissionCode: this.permissionCode,
      scope: this.scope,
    };
  }
}

/**
 * Exported class defining parameters and fields for create role model configurations.
 */
export class CreateRoleModel {
  constructor(
    public readonly nameEn: string,
    public readonly nameAr: string,
    public readonly code: string,
    public readonly priority: number,
    public readonly descriptionEn?: string,
    public readonly descriptionAr?: string,
    public readonly tenantId?: string,
    public readonly permissionIds?: string[],
    public readonly defaultLandingTarget?: string | null,
    public readonly isLandingEnforced?: boolean
  ) {}

  toJson(): CreateRoleJson {
    return {
      nameEn: this.nameEn,
      nameAr: this.nameAr,
      code: this.code,
      priority: this.priority,
      descriptionEn: this.descriptionEn,
      descriptionAr: this.descriptionAr,
      tenantId: this.tenantId,
      permissionIds: this.permissionIds,
      ...(this.defaultLandingTarget !== undefined
        ? { defaultLandingTarget: this.defaultLandingTarget }
        : {}),
      ...(this.isLandingEnforced !== undefined
        ? { isLandingEnforced: this.isLandingEnforced }
        : {}),
    };
  }
}

/**
 * Exported class defining parameters and fields for update role model configurations.
 */
export class UpdateRoleModel {
  constructor(
    public readonly nameEn: string,
    public readonly nameAr: string,
    public readonly priority: number,
    public readonly descriptionEn?: string,
    public readonly descriptionAr?: string,
    public readonly isActive?: boolean,
    public readonly defaultLandingTarget?: string | null,
    public readonly isLandingEnforced?: boolean,
    public readonly rowVersion?: string | null
  ) {}

  toJson(): UpdateRoleJson {
    return {
      nameEn: this.nameEn,
      nameAr: this.nameAr,
      descriptionEn: this.descriptionEn,
      descriptionAr: this.descriptionAr,
      priority: this.priority,
      isActive: this.isActive,
      ...(this.defaultLandingTarget !== undefined
        ? { defaultLandingTarget: this.defaultLandingTarget }
        : {}),
      ...(this.isLandingEnforced !== undefined
        ? { isLandingEnforced: this.isLandingEnforced }
        : {}),
      ...(this.rowVersion !== undefined ? { rowVersion: this.rowVersion } : {}),
    };
  }
}

/**
 * Exported class defining parameters and fields for assign permissions model configurations.
 */
export class AssignPermissionsModel {
  constructor(public readonly permissions: PermissionAssignmentJson[]) {}

  toJson(): AssignPermissionsJson {
    return {
      permissions: this.permissions,
    };
  }
}
// PermissionScopes and PermissionScopeType re-exported from domain/types/PermissionTypes.ts
