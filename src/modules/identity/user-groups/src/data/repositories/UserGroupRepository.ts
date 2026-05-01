/**
 * UserGroup Repository Implementation
 *
 * Implements IUserGroupRepository using UserGroupService.
 * Uses UserGroupMapper to convert Models → Entities.
 *
 * @module user-groups/data
 */
import type {
  IUserGroupRepository,
  UserGroupListParams,
} from "../../domain/interfaces/IUserGroupRepository";
import { UserGroup } from "../../domain/entities/UserGroup";
import type {
  CreateUserGroupRequest,
  UpdateUserGroupRequest,
  AddMembersRequest,
  SetGroupRolesRequest,
  SetGroupRestrictionsRequest,
} from "../../domain/entities/UserGroupRequests";
import type { PagedResult } from "@modules/identity/core/domain/types";
import { UserGroupService } from "../services/UserGroupService";
import { UserGroupMapper } from "../mappers/UserGroupMapper";

export class UserGroupRepository implements IUserGroupRepository {
  constructor(private readonly service: UserGroupService) {}

  async getAll(params: UserGroupListParams): Promise<PagedResult<UserGroup>> {
    const result = await this.service.getAll(params);
    return {
      items: UserGroupMapper.toEntityList(result.items),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getMyTenantGroups(params: UserGroupListParams): Promise<PagedResult<UserGroup>> {
    const result = await this.service.getMyTenantGroups(params);
    return {
      items: UserGroupMapper.toEntityList(result.items),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<UserGroup> {
    const model = await this.service.getById(id);
    return UserGroupMapper.toEntity(model);
  }

  async getByTenantId(tenantId: string): Promise<UserGroup[]> {
    const models = await this.service.getByTenantId(tenantId);
    return UserGroupMapper.toEntityList(models);
  }

  async create(request: CreateUserGroupRequest): Promise<string> {
    const response = await this.service.create(request);
    return response.id;
  }

  async createForMyTenant(request: Omit<CreateUserGroupRequest, "tenantId">): Promise<string> {
    const response = await this.service.createForMyTenant(request);
    return response.id;
  }

  async update(id: string, request: UpdateUserGroupRequest): Promise<void> {
    await this.service.update(id, request);
  }

  async delete(id: string, cascadeAdmins?: boolean): Promise<void> {
    await this.service.delete(id, cascadeAdmins);
  }

  async toggleStatus(id: string, isActive: boolean, cascadeAdmins?: boolean): Promise<void> {
    await this.service.toggleStatus(id, isActive, cascadeAdmins);
  }

  async addMembers(groupId: string, request: AddMembersRequest): Promise<void> {
    await this.service.addMembers(groupId, request);
  }

  async removeMember(groupId: string, adminId: string): Promise<void> {
    await this.service.removeMember(groupId, adminId);
  }

  async setRoles(groupId: string, request: SetGroupRolesRequest): Promise<void> {
    await this.service.setRoles(groupId, request);
  }

  async setRestrictions(groupId: string, request: SetGroupRestrictionsRequest): Promise<void> {
    await this.service.setRestrictions(groupId, request);
  }

  async bulkActivate(ids: string[], cascadeAdmins?: boolean): Promise<number> {
    return this.service.bulkActivate(ids, cascadeAdmins);
  }

  async bulkDeactivate(ids: string[], cascadeAdmins?: boolean): Promise<number> {
    return this.service.bulkDeactivate(ids, cascadeAdmins);
  }

  async bulkDelete(ids: string[], cascadeAdmins?: boolean): Promise<number> {
    return this.service.bulkDelete(ids, cascadeAdmins);
  }
}
