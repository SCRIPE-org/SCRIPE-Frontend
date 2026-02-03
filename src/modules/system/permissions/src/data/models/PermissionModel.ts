/**
 * Permission Model (DTO)
 *
 * Represents the raw API response/request for permissions.
 * Contains static methods for JSON serialization/deserialization.
 *
 * Clean Architecture:
 * - Service receives JSON → Model.fromJson() → Model
 * - Repository uses Mapper → Model.toEntity() → Entity
 * - For requests: Entity → Model.fromEntity() → Model.toJson() → JSON
 */

export interface PermissionJson {
      id: string;
      resource: string;
      action: string;
      permissionCode: string;
      defaultScope: string;
      description?: string;
      nameEn?: string;
      nameAr?: string;
      category: string;
      displayOrder: number;
}

export interface CreatePermissionJson {
      resource: string;
      action: string;
      permissionCode: string;
      description?: string;
      nameEn?: string;
      nameAr?: string;
      category: string;
      displayOrder?: number;
}

export interface UpdatePermissionJson {
      description?: string;
      nameEn?: string;
      nameAr?: string;
      category?: string;
      displayOrder?: number;
}

/**
 * Permission Model class with serialization methods
 */
export class PermissionModel {
      constructor(
            public readonly id: string,
            public readonly resource: string,
            public readonly action: string,
            public readonly permissionCode: string,
            public readonly defaultScope: string,
            public readonly category: string,
            public readonly displayOrder: number,
            public readonly description?: string,
            public readonly nameEn?: string,
            public readonly nameAr?: string
      ) { }

      /**
       * Create Model from JSON (API response)
       */
      static fromJson(json: PermissionJson): PermissionModel {
            return new PermissionModel(
                  json.id,
                  json.resource,
                  json.action,
                  json.permissionCode,
                  json.defaultScope,
                  json.category,
                  json.displayOrder,
                  json.description,
                  json.nameEn,
                  json.nameAr
            );
      }

      /**
       * Convert Model to JSON (for API requests - rarely needed for Permission)
       */
      toJson(): PermissionJson {
            return {
                  id: this.id,
                  resource: this.resource,
                  action: this.action,
                  permissionCode: this.permissionCode,
                  defaultScope: this.defaultScope,
                  category: this.category,
                  displayOrder: this.displayOrder,
                  description: this.description,
                  nameEn: this.nameEn,
                  nameAr: this.nameAr,
            };
      }
}

/**
 * Create Permission Request Model
 */
export class CreatePermissionModel {
      constructor(
            public readonly resource: string,
            public readonly action: string,
            public readonly permissionCode: string,
            public readonly category: string,
            public readonly displayOrder: number = 0,
            public readonly description?: string,
            public readonly nameEn?: string,
            public readonly nameAr?: string
      ) { }

      /**
       * Convert to JSON for API request
       */
      toJson(): CreatePermissionJson {
            return {
                  resource: this.resource,
                  action: this.action,
                  permissionCode: this.permissionCode,
                  category: this.category,
                  displayOrder: this.displayOrder,
                  description: this.description,
                  nameEn: this.nameEn,
                  nameAr: this.nameAr,
            };
      }
}

/**
 * Update Permission Request Model
 */
export class UpdatePermissionModel {
      constructor(
            public readonly description?: string,
            public readonly nameEn?: string,
            public readonly nameAr?: string,
            public readonly category?: string,
            public readonly displayOrder?: number
      ) { }

      /**
       * Convert to JSON for API request
       */
      toJson(): UpdatePermissionJson {
            return {
                  description: this.description,
                  nameEn: this.nameEn,
                  nameAr: this.nameAr,
                  category: this.category,
                  displayOrder: this.displayOrder,
            };
      }
}
