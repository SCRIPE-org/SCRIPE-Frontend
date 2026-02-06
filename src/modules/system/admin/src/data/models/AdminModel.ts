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
      roleName: string;
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
      isActive: boolean;
      lastLoginAt?: string;
      notes?: string;
      createdAt: string;
      /** Full role data (from details API) */
      roles?: AdminRoleJson[];
      /** Simple role names (from list API) */
      roleNames?: string[];
      /** The tenant this admin belongs to */
      tenantId?: string;
      tenantName?: string;
      /** Whether this admin is a super/system admin */
      isSuperAdmin?: boolean;
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
            public readonly lastLoginAt?: string,
            public readonly notes?: string,
            public readonly roles?: AdminRoleJson[],
            public readonly roleNames?: string[],
            public readonly tenantId?: string,
            public readonly tenantName?: string,
            public readonly isSuperAdmin?: boolean
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
                  json.lastLoginAt,
                  json.notes,
                  json.roles,
                  json.roleNames,
                  json.tenantId,
                  json.tenantName,
                  json.isSuperAdmin
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
                  lastLoginAt: this.lastLoginAt,
                  notes: this.notes,
                  roles: this.roles,
                  roleNames: this.roleNames,
                  tenantId: this.tenantId,
                  tenantName: this.tenantName,
                  isSuperAdmin: this.isSuperAdmin,
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
