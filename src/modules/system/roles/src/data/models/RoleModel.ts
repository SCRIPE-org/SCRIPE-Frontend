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
      name: string;
      code: string;
      description?: string;
      tenantId?: string;
      tenantName?: string;
      isSystem: boolean;
      priority: number;
      isActive: boolean;
      permissions: RolePermissionJson[];
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
      name: string;
      code: string;
      description?: string;
      priority: number;
      permissionIds?: string[];
}

export interface UpdateRoleJson {
      name?: string;
      description?: string;
      priority?: number;
      isActive?: boolean;
}

export interface AssignPermissionsJson {
      permissionIds: string[];
}

// ===== Model Classes =====

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

export class RoleModel {
      constructor(
            public readonly id: string,
            public readonly name: string,
            public readonly code: string,
            public readonly isSystem: boolean,
            public readonly priority: number,
            public readonly isActive: boolean,
            public readonly permissions: RolePermissionModel[],
            public readonly createdAt: string,
            public readonly description?: string,
            public readonly tenantId?: string,
            public readonly tenantName?: string,
            public readonly modifiedAt?: string
      ) { }

      static fromJson(json: RoleJson): RoleModel {
            return new RoleModel(
                  json.id,
                  json.name,
                  json.code,
                  json.isSystem,
                  json.priority,
                  json.isActive,
                  json.permissions.map((p) => RolePermissionModel.fromJson(p)),
                  json.createdAt,
                  json.description,
                  json.tenantId,
                  json.tenantName,
                  json.modifiedAt
            );
      }

      toJson(): RoleJson {
            return {
                  id: this.id,
                  name: this.name,
                  code: this.code,
                  description: this.description,
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

export class CreateRoleModel {
      constructor(
            public readonly name: string,
            public readonly code: string,
            public readonly priority: number,
            public readonly description?: string,
            public readonly permissionIds?: string[]
      ) { }

      toJson(): CreateRoleJson {
            return {
                  name: this.name,
                  code: this.code,
                  priority: this.priority,
                  description: this.description,
                  permissionIds: this.permissionIds,
            };
      }
}

export class UpdateRoleModel {
      constructor(
            public readonly name?: string,
            public readonly description?: string,
            public readonly priority?: number,
            public readonly isActive?: boolean
      ) { }

      toJson(): UpdateRoleJson {
            return {
                  name: this.name,
                  description: this.description,
                  priority: this.priority,
                  isActive: this.isActive,
            };
      }
}

export class AssignPermissionsModel {
      constructor(public readonly permissionIds: string[]) { }

      toJson(): AssignPermissionsJson {
            return { permissionIds: this.permissionIds };
      }
}
