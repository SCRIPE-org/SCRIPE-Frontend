/**
 * Admin Model (DTO)
 *
 * Represents the API data transfer object for Admin.
 * Used by AdminService for API communication.
 * Mapper converts between AdminModel &lt;-&gt; Admin Entity.
 *
 * @module admin/data
 */

/**
 * Admin role assignment JSON from API
 */
export interface AdminRoleJson {
  roleId: string;
  roleNameEn: string;
  roleNameAr: string;
  roleCode: string;
  tenantId?: string;
  tenantName?: string;
  expiresAt?: string;
  inheritToChildren?: boolean;
}

/**
 * Admin JSON shape from API (list response)
 */
export interface AdminJson {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  isActive: boolean;
  lastLoginAt?: string;
  notes?: string;
  createdAt: string;
  /** Full role data (from details API) */
  roles?: AdminRoleJson[];
  /** Simple role names (from list API) */
  roleNamesEn?: string[];
  roleNamesAr?: string[];
  /** The tenant this admin belongs to */
  tenantId?: string;
  tenantName?: string;
  /** Whether this admin is a super/system admin */
  isSuperAdmin?: boolean;
  /** Server-computed: whether this admin can be modified */
  canModify?: boolean;
  /** Effective permissions calculated by backend */
  permissions?: string[];
  /** Group names from user groups */
  groupNamesEn?: string[];
  groupNamesAr?: string[];
}

/**
 * Paginated admin list response from API
 */
export interface AdminListResponseJson {
  items: AdminJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Create admin request JSON
 */
export interface CreateAdminJson {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  tenantId?: string;
  roleIds?: string[];
  forcePasswordChange?: boolean;
}

/**
 * Update admin request JSON
 */
export interface UpdateAdminJson {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  notes?: string;
  isActive?: boolean;
}

/**
 * Assign role request JSON
 */
export interface AssignRoleJson {
  roleId: string;
  tenantId?: string;
  expiresAt?: string;
  inheritToChildren?: boolean;
}

/**
 * Bulk filter request JSON
 */
export interface BulkAdminsFilterJson {
  tenantId?: string;
  search?: string;
  isActive?: boolean;
}

/**
 * Transfer admin model
 */
export interface TransferAdminJson {
  targetTenantId: string | null;
  targetRoleId: string;
}

/**
 * Role assignment for sync operation
 */
export interface SyncRoleAssignmentJson {
  roleId: string;
  tenantId?: string;
  inheritToChildren?: boolean;
}

/**
 * Admin Model class
 *
 * Wraps API JSON with fromJson/toJson methods.
 */
export class AdminModel {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly isActive: boolean,
    public readonly createdAt: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly phoneNumber?: string,
    public readonly email?: string,
    public readonly lastLoginAt?: string,
    public readonly notes?: string,
    public readonly roles?: AdminRoleJson[],
    public readonly roleNamesEn?: string[],
    public readonly roleNamesAr?: string[],
    public readonly tenantId?: string,
    public readonly tenantName?: string,
    public readonly isSuperAdmin?: boolean,
    public readonly canModify?: boolean,
    public readonly permissions?: string[],
    public readonly groupNamesEn?: string[],
    public readonly groupNamesAr?: string[]
  ) { }

  /**
   * Create AdminModel from API JSON
   */
  static fromJson(json: AdminJson): AdminModel {
    return new AdminModel(
      json.id,
      json.username,
      json.isActive,
      json.createdAt,
      json.firstName,
      json.lastName,
      json.phoneNumber,
      json.email,
      json.lastLoginAt,
      json.notes,
      json.roles,
      json.roleNamesEn,
      json.roleNamesAr,
      json.tenantId,
      json.tenantName,
      json.isSuperAdmin,
      json.canModify,
      json.permissions,
      json.groupNamesEn,
      json.groupNamesAr
    );
  }

  /**
   * Convert AdminModel to API JSON
   */
  toJson(): AdminJson {
    return {
      id: this.id,
      username: this.username,
      isActive: this.isActive,
      createdAt: this.createdAt,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      email: this.email,
      lastLoginAt: this.lastLoginAt,
      notes: this.notes,
      roles: this.roles,
      roleNamesEn: this.roleNamesEn,
      roleNamesAr: this.roleNamesAr,
      tenantId: this.tenantId,
      tenantName: this.tenantName,
      isSuperAdmin: this.isSuperAdmin,
      canModify: this.canModify,
      permissions: this.permissions,
      groupNamesEn: this.groupNamesEn,
      groupNamesAr: this.groupNamesAr,
    };
  }

  /**
   * Get display name (firstName lastName or username)
   */
  get displayName(): string {
    const name = `${this.firstName ?? ""} ${this.lastName ?? ""}`.trim();
    return name || this.username;
  }
}

/**
 * Create admin request model
 *
 * Maps CreateAdminRequest (domain) → CreateAdminJson (API).
 * Used by AdminMapper.toCreateModel().
 */
export class CreateAdminModel {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly phoneNumber?: string,
    public readonly email?: string,
    public readonly notes?: string,
    public readonly tenantId?: string,
    public readonly roleIds?: string[]
  ) { }

  toJson(): CreateAdminJson {
    return {
      username: this.username,
      password: this.password,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      email: this.email,
      notes: this.notes,
      tenantId: this.tenantId,
      roleIds: this.roleIds,
    };
  }
}

/**
 * Update admin request model
 *
 * Maps UpdateAdminRequest (domain) → UpdateAdminJson (API).
 * Used by AdminMapper.toUpdateModel().
 */
export class UpdateAdminModel {
  constructor(
    public readonly firstName?: string,
    public readonly lastName?: string,
    public readonly phoneNumber?: string,
    public readonly email?: string,
    public readonly notes?: string,
    public readonly isActive?: boolean
  ) { }

  toJson(): UpdateAdminJson {
    return {
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      email: this.email,
      notes: this.notes,
      isActive: this.isActive,
    };
  }
}
