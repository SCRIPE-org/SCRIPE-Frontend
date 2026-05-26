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
  code: string; // Backend returns 'code', not 'permissionCode'
  defaultScope: string;
  descriptionEn?: string;
  descriptionAr?: string;
  nameEn?: string;
  nameAr?: string;
  category: string;
  displayOrder: number;
}

/** Backend response for a single category within a module group */
export interface PermissionCategoryGroupJson {
  category: string;
  permissions: PermissionJson[];
}

/** Backend response for grouped permissions: Module → Category → Permissions */
export interface PermissionModuleGroupJson {
  module: string;
  categories: PermissionCategoryGroupJson[];
}

export interface CreatePermissionJson {
  resource: string;
  action: string;
  permissionCode: string;
  descriptionEn?: string;
  descriptionAr?: string;
  nameEn?: string;
  nameAr?: string;
  category: string;
  displayOrder?: number;
}

export interface UpdatePermissionJson {
  descriptionEn?: string;
  descriptionAr?: string;
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
    public readonly descriptionEn?: string,
    public readonly descriptionAr?: string,
    public readonly nameEn?: string,
    public readonly nameAr?: string
  ) {}

  /**
   * Create Model from JSON (API response)
   * Note: Backend returns 'code' field, we map it to 'permissionCode'
   */
  static fromJson(json: PermissionJson): PermissionModel {
    return new PermissionModel(
      json.id,
      json.resource,
      json.action,
      json.code, // Backend uses 'code', not 'permissionCode'
      json.defaultScope,
      json.category,
      json.displayOrder,
      json.descriptionEn,
      json.descriptionAr,
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
      code: this.permissionCode, // Map internal permissionCode to 'code' for API
      defaultScope: this.defaultScope,
      category: this.category,
      displayOrder: this.displayOrder,
      descriptionEn: this.descriptionEn,
      descriptionAr: this.descriptionAr,
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
    public readonly descriptionEn?: string,
    public readonly descriptionAr?: string,
    public readonly nameEn?: string,
    public readonly nameAr?: string
  ) {}

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
      descriptionEn: this.descriptionEn,
      descriptionAr: this.descriptionAr,
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
    public readonly descriptionEn?: string,
    public readonly descriptionAr?: string,
    public readonly nameEn?: string,
    public readonly nameAr?: string,
    public readonly category?: string,
    public readonly displayOrder?: number
  ) {}

  /**
   * Convert to JSON for API request
   */
  toJson(): UpdatePermissionJson {
    return {
      descriptionEn: this.descriptionEn,
      descriptionAr: this.descriptionAr,
      nameEn: this.nameEn,
      nameAr: this.nameAr,
      category: this.category,
      displayOrder: this.displayOrder,
    };
  }
}
