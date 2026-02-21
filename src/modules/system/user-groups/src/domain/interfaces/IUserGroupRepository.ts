import type { PagedResult } from "@modules/system/core/domain/types";
import type { UserGroup } from "../entities/UserGroup";
import type {
      CreateUserGroupRequest,
      UpdateUserGroupRequest,
      AddMembersRequest,
      SetGroupRolesRequest,
      SetGroupRestrictionsRequest,
} from "../entities/UserGroupRequests";

export interface UserGroupListParams {
      page: number;
      pageSize: number;
      search?: string;
      tenantId?: string;
      isActive?: boolean;
}

export interface IUserGroupRepository {
      getAll(params: UserGroupListParams): Promise<PagedResult<UserGroup>>;
      getMyTenantGroups(params: UserGroupListParams): Promise<PagedResult<UserGroup>>;
      getById(id: string): Promise<UserGroup>;
      getByTenantId(tenantId: string): Promise<UserGroup[]>;
      create(request: CreateUserGroupRequest): Promise<string>;
      createForMyTenant(request: Omit<CreateUserGroupRequest, "tenantId">): Promise<string>;
      update(id: string, request: UpdateUserGroupRequest): Promise<void>;
      delete(id: string): Promise<void>;
      addMembers(groupId: string, request: AddMembersRequest): Promise<void>;
      removeMember(groupId: string, adminId: string): Promise<void>;
      setRoles(groupId: string, request: SetGroupRolesRequest): Promise<void>;
      setRestrictions(groupId: string, request: SetGroupRestrictionsRequest): Promise<void>;
      bulkActivate(ids: string[]): Promise<number>;
      bulkDeactivate(ids: string[]): Promise<number>;
      bulkDelete(ids: string[]): Promise<number>;
}
