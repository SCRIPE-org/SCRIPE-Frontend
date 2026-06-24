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
 * Interface structure detailing the properties and attributes of User Group Role Json.
 */
export interface UserGroupRoleJson {
  roleId: string;
  nameEn: string;
  nameAr: string;
  code: string;
  permissionCount: number;
}

/**
 * Interface structure detailing the properties and attributes of User Group Restriction Json.
 */
export interface UserGroupRestrictionJson {
  permissionCode: string;
  restrictedFields: string[];
}

/**
 * Interface structure detailing the properties and attributes of User Group Json.
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
 * Interface structure detailing the properties and attributes of User Group List Response Json.
 */
export interface UserGroupListResponseJson {
  items: UserGroupJson[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Domain entity class representing a User Group Model.
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
