/**
 * Tenant Model (DTO)
 *
 * Represents the raw API response/request for tenants.
 * Contains static methods for JSON serialization/deserialization.
 *
 * @module tenants/data
 */

// ===== JSON Shapes (API contracts) =====

/**
 * Interface structure detailing the properties and attributes of Tenant Json.
 */
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
  editionName?: string;
  editionEndDate?: string;
  primaryDomain?: string;
  domainCount?: number;
  adminEmail?: string;
}
/**
 * Interface structure detailing the properties and attributes of Tenant Tree Node Json.
 */
export interface TenantTreeNodeJson {
  id: string | null; // null for "System" pseudo-tenant (Super Admin)
  name: string;
  code: string;
  level: number;
  isActive: boolean;
  isSuspended?: boolean;
  suspensionType?: string;
  suspensionReason?: string;
  description?: string;
  parentId?: string;
  editionName?: string;
  editionEndDate?: string;
  subscriptionStatus?: string;
  children: TenantTreeNodeJson[];
}
/**
 * Interface structure detailing the properties and attributes of Tenant List Response Json.
 */
export interface TenantListResponseJson {
  items: TenantJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
/**
 * Interface structure detailing the properties and attributes of Create Tenant Json.
 */
export interface CreateTenantJson {
  name: string;
  code: string;
  parentTenantId?: string;
  description?: string;
  address?: string;
  // Step 2: Admin
  adminEmail: string;
  adminUsername?: string;
  // Step 3: Edition & Billing
  editionId?: string;
  subscriptionType?: string;
  currency?: string;
  promotionId?: string;
  promoCode?: string;
  skipPayment?: boolean;
}
/** Backend returns this enriched result after tenant creation */
export interface CreateTenantResultJson {
  tenantId: string;
  adminId: string;
  adminUsername: string;
  adminEmail: string;
  accountSetupUrl: string;
  subscriptionId?: string;
}
/**
 * Interface structure detailing the properties and attributes of Update Tenant Json.
 */
export interface UpdateTenantJson {
  name?: string;
  description?: string;
  isActive?: boolean;
  address?: string;
}
// ===== Model Classes =====
/**
 * Domain entity class representing a Tenant Model.
 */
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
    public readonly address?: string,
    public readonly editionName?: string,
    public readonly editionEndDate?: string,
    public readonly primaryDomain?: string,
    public readonly domainCount?: number,
    public readonly adminEmail?: string
  ) {}
  static fromJson(json: TenantJson): TenantModel {
    return new TenantModel(
      json.id,
      json.name,
      json.code,
      // Backend returns hierarchyLevel, frontend uses level
      json.level ?? json.hierarchyLevel ?? 0,
      json.path ?? "",
      json.isActive,
      json.createdAt,
      // Backend returns parentTenantId, frontend uses parentId
      json.parentId ?? json.parentTenantId,
      json.parentName ?? json.parentTenantName,
      json.description,
      json.settings,
      json.modifiedAt,
      json.children?.map((c) => TenantModel.fromJson(c)),
      json.address,
      json.editionName,
      json.editionEndDate,
      json.primaryDomain,
      json.domainCount,
      json.adminEmail
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
      editionName: this.editionName,
      editionEndDate: this.editionEndDate,
      primaryDomain: this.primaryDomain,
      domainCount: this.domainCount,
      adminEmail: this.adminEmail,
    };
  }
}
/**
 * Domain entity class representing a Tenant Tree Node Model.
 */
export class TenantTreeNodeModel {
  constructor(
    public readonly id: string | null, // null for "System" pseudo-tenant
    public readonly name: string,
    public readonly code: string,
    public readonly level: number,
    public readonly isActive: boolean,
    public readonly children: TenantTreeNodeModel[],
    public readonly description?: string,
    public readonly parentId?: string,
    public readonly editionName?: string,
    public readonly editionEndDate?: string,
    public readonly isSuspended?: boolean,
    public readonly suspensionType?: string,
    public readonly suspensionReason?: string,
    public readonly subscriptionStatus?: string
  ) {}
  static fromJson(json: TenantTreeNodeJson): TenantTreeNodeModel {
    return new TenantTreeNodeModel(
      json.id,
      json.name,
      json.code,
      json.level,
      json.isActive,
      (json.children || []).map((c) => TenantTreeNodeModel.fromJson(c)),
      json.description,
      json.parentId,
      json.editionName,
      json.editionEndDate,
      json.isSuspended,
      json.suspensionType,
      json.suspensionReason,
      json.subscriptionStatus
    );
  }
  toJson(): TenantTreeNodeJson {
    return {
      id: this.id,
      name: this.name,
      code: this.code,
      level: this.level,
      isActive: this.isActive,
      isSuspended: this.isSuspended,
      suspensionType: this.suspensionType,
      suspensionReason: this.suspensionReason,
      description: this.description,
      parentId: this.parentId,
      editionName: this.editionName,
      editionEndDate: this.editionEndDate,
      subscriptionStatus: this.subscriptionStatus,
      children: this.children.map((c) => c.toJson()),
    };
  }
}
/**
 * Domain entity class representing a Create Tenant Model.
 */
export class CreateTenantModel {
  constructor(
    public readonly name: string,
    public readonly code: string,
    public readonly adminEmail: string,
    public readonly parentId?: string,
    public readonly description?: string,
    public readonly address?: string,
    public readonly adminUsername?: string,
    public readonly editionId?: string,
    public readonly subscriptionType?: string,
    public readonly currency?: string,
    public readonly promotionId?: string,
    public readonly promoCode?: string,
    public readonly skipPayment?: boolean
  ) {}
  toJson(): CreateTenantJson {
    return {
      name: this.name,
      code: this.code,
      parentTenantId: this.parentId,
      description: this.description,
      address: this.address,
      adminEmail: this.adminEmail,
      adminUsername: this.adminUsername,
      editionId: this.editionId,
      subscriptionType: this.subscriptionType,
      currency: this.currency,
      promotionId: this.promotionId,
      promoCode: this.promoCode,
      skipPayment: this.skipPayment,
    };
  }
}
/**
 * Domain entity class representing a Update Tenant Model.
 */
export class UpdateTenantModel {
  constructor(
    public readonly name?: string,
    public readonly description?: string,
    public readonly isActive?: boolean,
    public readonly address?: string
  ) {}
  toJson(): UpdateTenantJson {
    return {
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      address: this.address,
    };
  }
}