/**
 * Tenant Model (DTO)
 *
 * Represents the raw API response/request for tenants.
 * Contains static methods for JSON serialization/deserialization.
 *
 * @module tenants/data
 */

// ===== JSON Shapes (API contracts) =====

export interface TenantJson {
      id: string;
      name: string;
      code: string;
      level?: number;
      hierarchyLevel?: number;
      path?: string;
      isActive: boolean;
      createdAt: string;
      // Backend uses parentTenantId, we map to parentId
      parentId?: string;
      parentTenantId?: string;
      parentName?: string;
      parentTenantName?: string;
      description?: string;
      settings?: Record<string, unknown>;
      modifiedAt?: string;
      children?: TenantJson[];
      // Stats from backend
      childCount?: number;
      adminCount?: number;
      address?: string;
}

export interface TenantTreeNodeJson {
      id: string;
      name: string;
      code: string;
      level: number;
      isActive: boolean;
      description?: string;
      parentId?: string;
      children: TenantTreeNodeJson[];
}

export interface TenantListResponseJson {
      items: TenantJson[];
      totalCount: number;
      page: number;
      pageSize: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
}

export interface CreateTenantJson {
      name: string;
      code: string;
      parentTenantId?: string;
      description?: string;
      availablePermissionIds?: string[];
      address?: string;
}

export interface UpdateTenantJson {
      name?: string;
      description?: string;
      isActive?: boolean;
      address?: string;
}

// ===== Model Classes =====

export class TenantModel {
      constructor(
            public readonly id: string,
            public readonly name: string,
            public readonly code: string,
            public readonly level: number,
            public readonly path: string,
            public readonly isActive: boolean,
            public readonly createdAt: string,
            public readonly parentId?: string,
            public readonly parentName?: string,
            public readonly description?: string,
            public readonly settings?: Record<string, unknown>,
            public readonly modifiedAt?: string,
            public readonly children?: TenantModel[],
            public readonly address?: string
      ) { }

      static fromJson(json: TenantJson): TenantModel {
            return new TenantModel(
                  json.id,
                  json.name,
                  json.code,
                  // Backend returns hierarchyLevel, frontend uses level
                  json.level ?? json.hierarchyLevel ?? 0,
                  json.path ?? '',
                  json.isActive,
                  json.createdAt,
                  // Backend returns parentTenantId, frontend uses parentId
                  json.parentId ?? json.parentTenantId,
                  json.parentName ?? json.parentTenantName,
                  json.description,
                  json.settings,
                  json.modifiedAt,
                  json.children?.map((c) => TenantModel.fromJson(c)),
                  json.address
            );
      }

      toJson(): TenantJson {
            return {
                  id: this.id,
                  name: this.name,
                  code: this.code,
                  level: this.level,
                  path: this.path,
                  isActive: this.isActive,
                  createdAt: this.createdAt,
                  parentId: this.parentId,
                  parentName: this.parentName,
                  description: this.description,
                  settings: this.settings,
                  modifiedAt: this.modifiedAt,
                  children: this.children?.map((c) => c.toJson()),
                  address: this.address,
            };
      }
}

export class TenantTreeNodeModel {
      constructor(
            public readonly id: string,
            public readonly name: string,
            public readonly code: string,
            public readonly level: number,
            public readonly isActive: boolean,
            public readonly children: TenantTreeNodeModel[],
            public readonly description?: string,
            public readonly parentId?: string
      ) { }

      static fromJson(json: TenantTreeNodeJson): TenantTreeNodeModel {
            return new TenantTreeNodeModel(
                  json.id,
                  json.name,
                  json.code,
                  json.level,
                  json.isActive,
                  json.children.map((c) => TenantTreeNodeModel.fromJson(c)),
                  json.description,
                  json.parentId
            );
      }

      toJson(): TenantTreeNodeJson {
            return {
                  id: this.id,
                  name: this.name,
                  code: this.code,
                  level: this.level,
                  isActive: this.isActive,
                  description: this.description,
                  parentId: this.parentId,
                  children: this.children.map((c) => c.toJson()),
            };
      }
}

export class CreateTenantModel {
      constructor(
            public readonly name: string,
            public readonly code: string,
            public readonly parentId?: string,
            public readonly description?: string,
            public readonly availablePermissionIds?: string[],
            public readonly address?: string
      ) { }

      toJson(): CreateTenantJson {
            return {
                  name: this.name,
                  code: this.code,
                  parentTenantId: this.parentId,
                  description: this.description,
                  availablePermissionIds: this.availablePermissionIds,
                  address: this.address,
            };
      }
}

export class UpdateTenantModel {
      constructor(
            public readonly name?: string,
            public readonly description?: string,
            public readonly isActive?: boolean,
            public readonly address?: string
      ) { }

      toJson(): UpdateTenantJson {
            return {
                  name: this.name,
                  description: this.description,
                  isActive: this.isActive,
                  address: this.address,
            };
      }
}
