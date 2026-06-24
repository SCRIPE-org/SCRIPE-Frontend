/**
 * Interface structure detailing the properties and attributes of Create User Group Request.
 */
export interface CreateUserGroupRequest {
  nameEn: string;
  nameAr: string;
  code: string;
  descriptionEn?: string;
  descriptionAr?: string;
  roleIds: string[];
  tenantId?: string;
}

/**
 * Interface structure detailing the properties and attributes of Update User Group Request.
 */
export interface UpdateUserGroupRequest {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  roleIds: string[];
  isActive: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Add Members Request.
 */
export interface AddMembersRequest {
  adminIds: string[];
}

/**
 * Interface structure detailing the properties and attributes of Set Group Roles Request.
 */
export interface SetGroupRolesRequest {
  roleIds: string[];
}

/**
 * Interface structure detailing the properties and attributes of Group Restriction Dto.
 */
export interface GroupRestrictionDto {
  permissionCode: string;
  restrictedFields: string[];
}

/**
 * Interface structure detailing the properties and attributes of Set Group Restrictions Request.
 */
export interface SetGroupRestrictionsRequest {
  restrictions: GroupRestrictionDto[];
}

/**
 * Interface structure detailing the properties and attributes of Bulk User Groups Action Request.
 */
export interface BulkUserGroupsActionRequest {
  ids: string[];
  cascadeAdmins?: boolean;
}

/**
 * Interface structure detailing the properties and attributes of Bulk User Groups Filter Request.
 */
export interface BulkUserGroupsFilterRequest {
  tenantId?: string;
  search?: string;
  isActive?: boolean;
  cascadeAdmins?: boolean;
}
