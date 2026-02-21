/**
 * UserGroup Service
 *
 * Handles all API calls for the User Groups module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * @module user-groups/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import { UserGroupModel, type UserGroupJson, type UserGroupListResponseJson } from "../models/UserGroupModel";
import type {
      CreateUserGroupRequest,
      UpdateUserGroupRequest,
      AddMembersRequest,
      SetGroupRolesRequest,
      SetGroupRestrictionsRequest,
} from "../../domain/entities/UserGroupRequests";

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

export class UserGroupService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: UserGroupServiceListParams): Promise<UserGroupListResult> {
            const url = buildUrl(API_ENDPOINTS.USER_GROUPS.LIST, {
                  page: params.page,
                  pageSize: params.pageSize,
                  search: params.search,
                  tenantId: params.tenantId,
                  isActive: params.isActive,
            });

            const response = await this.api.get<UserGroupListResponseJson>(url);

            return {
                  items: response.items.map((json) => UserGroupModel.fromJson(json)),
                  totalCount: response.totalCount,
                  page: response.page,
                  pageSize: response.pageSize,
                  totalPages: response.totalPages,
                  hasNextPage: response.hasNextPage,
                  hasPreviousPage: response.hasPreviousPage,
            };
      }

      async getMyTenantGroups(params: Omit<UserGroupServiceListParams, "tenantId">): Promise<UserGroupListResult> {
            const url = buildUrl(API_ENDPOINTS.USER_GROUPS.MY_TENANT_GROUPS, {
                  page: params.page,
                  pageSize: params.pageSize,
                  search: params.search,
                  isActive: params.isActive,
            });

            const response = await this.api.get<UserGroupListResponseJson>(url);

            return {
                  items: response.items.map((json) => UserGroupModel.fromJson(json)),
                  totalCount: response.totalCount,
                  page: response.page,
                  pageSize: response.pageSize,
                  totalPages: response.totalPages,
                  hasNextPage: response.hasNextPage,
                  hasPreviousPage: response.hasPreviousPage,
            };
      }

      async getById(id: string): Promise<UserGroupModel> {
            const json = await this.api.get<UserGroupJson>(API_ENDPOINTS.USER_GROUPS.BY_ID(id));
            return UserGroupModel.fromJson(json);
      }

      async getByTenantId(tenantId: string): Promise<UserGroupModel[]> {
            const json = await this.api.get<UserGroupJson[]>(API_ENDPOINTS.USER_GROUPS.BY_TENANT(tenantId));
            return json.map((j) => UserGroupModel.fromJson(j));
      }

      async create(request: CreateUserGroupRequest): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.USER_GROUPS.CREATE, request);
      }

      async createForMyTenant(request: Omit<CreateUserGroupRequest, "tenantId">): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.USER_GROUPS.CREATE_FOR_MY_TENANT, request);
      }

      async update(id: string, request: UpdateUserGroupRequest): Promise<void> {
            await this.api.put(API_ENDPOINTS.USER_GROUPS.UPDATE(id), request);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.USER_GROUPS.DELETE(id));
      }

      async addMembers(groupId: string, request: AddMembersRequest): Promise<void> {
            await this.api.post(API_ENDPOINTS.USER_GROUPS.ADD_MEMBERS(groupId), request);
      }

      async removeMember(groupId: string, adminId: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.USER_GROUPS.REMOVE_MEMBER(groupId, adminId));
      }

      async setRoles(groupId: string, request: SetGroupRolesRequest): Promise<void> {
            await this.api.put(API_ENDPOINTS.USER_GROUPS.SET_ROLES(groupId), request);
      }

      async setRestrictions(groupId: string, request: SetGroupRestrictionsRequest): Promise<void> {
            await this.api.put(API_ENDPOINTS.USER_GROUPS.SET_RESTRICTIONS(groupId), request);
      }

      async bulkActivate(ids: string[]): Promise<number> {
            const response = await this.api.post<{ affectedRows?: number } | number>(API_ENDPOINTS.USER_GROUPS.BULK.ACTIVATE, { ids });
            if (typeof response === "number") return response;
            return response.affectedRows ?? ids.length;
      }

      async bulkDeactivate(ids: string[]): Promise<number> {
            const response = await this.api.post<{ affectedRows?: number } | number>(API_ENDPOINTS.USER_GROUPS.BULK.DEACTIVATE, { ids });
            if (typeof response === "number") return response;
            return response.affectedRows ?? ids.length;
      }

      async bulkDelete(ids: string[]): Promise<number> {
            const response = await this.api.post<{ affectedRows?: number } | number>(API_ENDPOINTS.USER_GROUPS.BULK.DELETE, { ids });
            if (typeof response === "number") return response;
            return response.affectedRows ?? ids.length;
      }
}
