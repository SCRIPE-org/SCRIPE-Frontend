import type { UserGroupModel } from "../../data/models/UserGroupModel";
import type {
  CreateUserGroupRequest,
  UpdateUserGroupRequest,
  AddMembersRequest,
  SetGroupRolesRequest,
  SetGroupRestrictionsRequest,
} from "../entities/UserGroupRequests";

export interface UserGroupServiceListParams {
  page: number;
  pageSize: number;
  search?: string;
  tenantId?: string;
  isActive?: boolean;
}

export interface UserGroupListResult {
  items: UserGroupModel[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IUserGroupService {
  getAll(params: UserGroupServiceListParams): Promise<UserGroupListResult>;
  getMyTenantGroups(
    params: Omit<UserGroupServiceListParams, "tenantId">
  ): Promise<UserGroupListResult>;
  getById(id: string): Promise<UserGroupModel>;
  getByTenantId(tenantId: string): Promise<UserGroupModel[]>;
  create(request: CreateUserGroupRequest): Promise<{ id: string }>;
  createForMyTenant(request: Omit<CreateUserGroupRequest, "tenantId">): Promise<{ id: string }>;
  update(id: string, request: UpdateUserGroupRequest): Promise<void>;
  delete(id: string, cascadeAdmins?: boolean): Promise<void>;
  toggleStatus(id: string, isActive: boolean, cascadeAdmins?: boolean): Promise<void>;
  addMembers(groupId: string, request: AddMembersRequest): Promise<void>;
  removeMember(groupId: string, adminId: string): Promise<void>;
  setRoles(groupId: string, request: SetGroupRolesRequest): Promise<void>;
  setRestrictions(groupId: string, request: SetGroupRestrictionsRequest): Promise<void>;
  bulkActivate(ids: string[], cascadeAdmins?: boolean): Promise<number>;
  bulkDeactivate(ids: string[], cascadeAdmins?: boolean): Promise<number>;
  bulkDelete(ids: string[], cascadeAdmins?: boolean): Promise<number>;
}
