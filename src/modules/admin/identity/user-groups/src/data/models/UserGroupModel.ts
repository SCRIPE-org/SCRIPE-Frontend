/**
 * UserGroup Model (DTO)
 *
 * Represents the API JSON shape. Mapper converts to domain entity.
 *
 * @module user-groups/data
 */

export interface UserGroupMemberJson {
  adminId: string;
  firstName?: string;
  lastName?: string;
  username: string;
  email?: string;
  isActive: boolean;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for user group role json.
 */
export interface UserGroupRoleJson {
  roleId: string;
  nameEn: string;
  nameAr: string;
  code: string;
  permissionCount: number;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for user group restriction json.
 */
export interface UserGroupRestrictionJson {
  permissionCode: string;
  restrictedFields: string[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for user group json.
 */
export interface UserGroupJson {
  id: string;
  nameEn: string;
  nameAr: string;
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  tenantId: string;
  tenantName?: string;
  isActive: boolean;
  memberCount: number;
  roleCount: number;
  createdAt: string;
  modifiedAt?: string;
  members?: UserGroupMemberJson[];
  roles?: UserGroupRoleJson[];
  restrictions?: UserGroupRestrictionJson[];
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for user group list response json.
 */
export interface UserGroupListResponseJson {
  items: UserGroupJson[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Exported class defining parameters and fields for user group model configurations.
 */
export class UserGroupModel {
  constructor(private readonly json: UserGroupJson) {}

  static fromJson(json: UserGroupJson): UserGroupModel {
    return new UserGroupModel(json);
  }

  toJson(): UserGroupJson {
    return this.json;
  }

  get id() {
    return this.json.id;
  }
  get nameEn() {
    return this.json.nameEn;
  }
  get nameAr() {
    return this.json.nameAr;
  }
  get code() {
    return this.json.code;
  }
  get descriptionEn() {
    return this.json.descriptionEn;
  }
  get descriptionAr() {
    return this.json.descriptionAr;
  }
  get tenantId() {
    return this.json.tenantId;
  }
  get tenantName() {
    return this.json.tenantName;
  }
  get isActive() {
    return this.json.isActive;
  }
  get memberCount() {
    return this.json.memberCount;
  }
  get roleCount() {
    return this.json.roleCount;
  }
  get createdAt() {
    return this.json.createdAt;
  }
  get modifiedAt() {
    return this.json.modifiedAt;
  }
  get members() {
    return this.json.members;
  }
  get roles() {
    return this.json.roles;
  }
  get restrictions() {
    return this.json.restrictions;
  }
}
