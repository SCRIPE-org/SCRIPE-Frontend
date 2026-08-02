/**
 * Domain model representing a Create User Group Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Update User Group Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
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
 * Domain model representing a Add Members Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface AddMembersRequest {
  adminIds: string[];
}

/**
 * Domain model representing a Set Group Roles Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface SetGroupRolesRequest {
  roleIds: string[];
}

/**
 * Domain model representing a Group Restriction Dto structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface GroupRestrictionDto {
  permissionCode: string;
  restrictedFields: string[];
}

/**
 * Domain model representing a Set Group Restrictions Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface SetGroupRestrictionsRequest {
  restrictions: GroupRestrictionDto[];
}

/**
 * Domain model representing a Bulk User Groups Action Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface BulkUserGroupsActionRequest {
  ids: string[];
  cascadeAdmins?: boolean;
}

/**
 * Domain model representing a Bulk User Groups Filter Request structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface BulkUserGroupsFilterRequest {
  tenantId?: string;
  search?: string;
  isActive?: boolean;
  cascadeAdmins?: boolean;
}
