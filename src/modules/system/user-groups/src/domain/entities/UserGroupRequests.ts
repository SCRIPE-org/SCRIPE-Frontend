export interface CreateUserGroupRequest {
      nameEn: string;
      nameAr: string;
      code: string;
      descriptionEn?: string;
      descriptionAr?: string;
      roleIds: string[];
      tenantId?: string;
}

export interface UpdateUserGroupRequest {
      nameEn: string;
      nameAr: string;
      descriptionEn?: string;
      descriptionAr?: string;
      roleIds: string[];
      isActive: boolean;
}

export interface AddMembersRequest {
      adminIds: string[];
}

export interface SetGroupRolesRequest {
      roleIds: string[];
}

export interface GroupRestrictionDto {
      permissionCode: string;
      restrictedFields: string[];
}

export interface SetGroupRestrictionsRequest {
      restrictions: GroupRestrictionDto[];
}
