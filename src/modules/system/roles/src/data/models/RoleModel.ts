/**
 * Role Model (DTO)
 *
 * Represents the raw API response/request for roles.
 * Contains static methods for JSON serialization/deserialization.
 *
 * @module roles/data
 */

// ===== JSON Shapes (API contracts) =====

export interface RolePermissionJson {
  permissionId: string;
  permissionCode: string;
  scope?: string;
}

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
  priority: number;
  isActive: boolean;
  permissions?: RolePermissionJson[]; // Optional for list responses
  createdAt: string;
  modifiedAt?: string;
}

export interface RoleListResponseJson {
  items: RoleJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateRoleJson {
  nameEn: string;
  nameAr: string;
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  priority: number;
  tenantId?: string;
  permissionIds?: string[];
}

export interface UpdateRoleJson {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  priority: number;
  isActive?: boolean;
}

export interface PermissionAssignmentJson {
  permissionId: string;
  scopeOverride?: string | null;
  restrictedFields?: string[] | null;
}

export interface AssignPermissionsJson {
  permissions: PermissionAssignmentJson[];
}

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
    public readonly modifiedAt?: string
  ) { }

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
      json.modifiedAt
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
      priority: this.priority,
      isActive: this.isActive,
      permissions: this.permissions.map((p) => p.toJson()),
      createdAt: this.createdAt,
      modifiedAt: this.modifiedAt,
    };
  }
}

export class RolePermissionModel {
  constructor(
    public readonly permissionId: string,
    public readonly permissionCode: string,
    public readonly scope?: string
  ) { }

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

export class CreateRoleModel {
  constructor(
    public readonly nameEn: string,
    public readonly nameAr: string,
    public readonly code: string,
    public readonly priority: number,
    public readonly descriptionEn?: string,
    public readonly descriptionAr?: string,
    public readonly tenantId?: string,
    public readonly permissionIds?: string[]
  ) { }

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
    };
  }
}

export class UpdateRoleModel {
  constructor(
    public readonly nameEn: string,
    public readonly nameAr: string,
    public readonly priority: number,
    public readonly descriptionEn?: string,
    public readonly descriptionAr?: string,
    public readonly isActive?: boolean
  ) { }

  toJson(): UpdateRoleJson {
    return {
      nameEn: this.nameEn,
      nameAr: this.nameAr,
      descriptionEn: this.descriptionEn,
      descriptionAr: this.descriptionAr,
      priority: this.priority,
      isActive: this.isActive,
    };
  }
}

export class AssignPermissionsModel {
  constructor(public readonly permissions: PermissionAssignmentJson[]) { }

  toJson(): AssignPermissionsJson {
    return {
      permissions: this.permissions,
    };
  }
}
// ===== Constants (Frontend Enums) =====

export const PermissionScopes = {
  /** No override - uses permission's default scope */
  Default: "default",
  /** Only own records (CreatedBy == CurrentUserId) */
  Own: "own",
  /** All records in own tenant */
  OwnTenant: "own_tenant",
  /** All records in own tenant + child tenants */
  Hierarchy: "hierarchy",
  /** All records in all tenants */
  AllTenants: "all_tenants",
} as const;

export type PermissionScopeType = (typeof PermissionScopes)[keyof typeof PermissionScopes];
