/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Role Repository Implementation
 *
 * Implements IRoleRepository using RoleService.
 * Uses RoleMapper to convert Models → Entities.
 *
 * @module roles/data
 */
import type {
  IRoleRepository,
  RoleListParams,
  CurrentTenantRoleListParams,
} from "../../domain/interfaces/IRoleRepository";
import { Role } from "../../domain/entities/Role";
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  DeleteRoleRequest,
  CloneRoleRequest,
} from "../../domain/entities/RoleRequests";
import type {
  RoleWorkspaceEntryPolicy,
  UpsertRoleWorkspaceEntryInput,
} from "../../domain/entities/RoleWorkspaceEntryPolicy";
import type { PagedResult } from "@modules/identity/core/domain/types";
import type { IRoleService } from "../../domain/interfaces/IRoleService";
import { RoleMapper } from "../mappers/RoleMapper";
import { RoleWorkspaceEntryPolicyMapper } from "../mappers/RoleWorkspaceEntryPolicyMapper";
import { Permission, PermissionModuleGroup, PermissionMapper } from "@modules/identity/core";

/**
 * Repository layer implementing client request queries for role.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class RoleRepository implements IRoleRepository {
  constructor(private readonly service: IRoleService) {}

  async getAll(params: RoleListParams): Promise<PagedResult<Role>> {
    const result = await this.service.getAll({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      tenantId: params.tenantId,
      strict: params.strict,
    });

    return {
      items: RoleMapper.toEntityList(result.items),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getCurrentTenantRoles(params: CurrentTenantRoleListParams): Promise<PagedResult<Role>> {
    const result = await this.service.getCurrentTenantRoles(params);

    return {
      items: RoleMapper.toEntityList(result.items),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<Role> {
    const model = await this.service.getById(id);
    return RoleMapper.toEntity(model);
  }

  async create(request: CreateRoleRequest): Promise<string> {
    const model = RoleMapper.toCreateModel(request);
    const json = model.toJson();
    // Ensure tenantId is always forwarded even if mapper doesn't include it
    if (request.tenantId) {
      (json as any).tenantId = request.tenantId;
    }
    const response = await this.service.create(json);
    return response.id;
  }

  async createInCurrentTenant(request: Omit<CreateRoleRequest, "tenantId">): Promise<string> {
    const model = RoleMapper.toCreateModel(request as CreateRoleRequest);
    const response = await this.service.createInCurrentTenant(model.toJson());
    return response.id;
  }

  async update(id: string, request: UpdateRoleRequest): Promise<void> {
    const model = RoleMapper.toUpdateModel(request);
    await this.service.update(id, model.toJson());
  }

  async delete(id: string, options?: DeleteRoleRequest): Promise<void> {
    const params = new URLSearchParams();
    if (options?.fallbackRoleId) {
      params.append("fallbackRoleId", options.fallbackRoleId);
    }
    const queryString = params.toString();
    await this.service.delete(queryString ? `${id}?${queryString}` : id);
  }

  async assignPermissions(roleId: string, request: AssignPermissionsRequest): Promise<void> {
    const model = RoleMapper.toAssignPermissionsModel(request);
    await this.service.assignPermissions(roleId, model.toJson());
  }

  async removePermission(roleId: string, permissionId: string): Promise<void> {
    await this.service.removePermission(roleId, permissionId);
  }

  async getRolePermissions(roleId: string): Promise<any[]> {
    const result = await this.service.getRolePermissions(roleId);
    return result ?? [];
  }

  async getCurrentTenantAvailablePermissions(category?: string): Promise<Permission[]> {
    const models = await this.service.getCurrentTenantAvailablePermissions(category);
    return PermissionMapper.toEntityList(models);
  }

  async getCurrentTenantAvailablePermissionsGrouped(
    search?: string
  ): Promise<PermissionModuleGroup[]> {
    const json = await this.service.getCurrentTenantAvailablePermissionsGrouped(search);
    return PermissionMapper.toEntityGrouped(json);
  }

  async getTenantAvailablePermissions(tenantId: string): Promise<Permission[]> {
    const models = await this.service.getTenantPermissions(tenantId);
    return PermissionMapper.toEntityList(models);
  }

  async getTenantAvailablePermissionsGrouped(
    tenantId: string,
    search?: string
  ): Promise<PermissionModuleGroup[]> {
    // GET /Tenants/{id}/permissions/grouped — backend already groups by Module → Category
    const json = await this.service.getTenantPermissionsGrouped(tenantId, search);
    return PermissionMapper.toEntityGrouped(json);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return this.service.bulkDelete(ids);
  }

  async getAdminCount(roleId: string): Promise<number> {
    return this.service.getAdminCount(roleId);
  }

  async clone(roleId: string, request: CloneRoleRequest): Promise<string> {
    const response = await this.service.clone(roleId, request);
    return response.id;
  }

  async getRoleWorkspaceEntries(roleId: string): Promise<RoleWorkspaceEntryPolicy[]> {
    const dtos = await this.service.getRoleWorkspaceEntries(roleId);
    return RoleWorkspaceEntryPolicyMapper.toEntityList(dtos);
  }

  async upsertRoleWorkspaceEntries(
    roleId: string,
    policies: UpsertRoleWorkspaceEntryInput[],
    rowVersion?: string | null
  ): Promise<RoleWorkspaceEntryPolicy[]> {
    const requestDto = RoleWorkspaceEntryPolicyMapper.toUpsertRequestDto(policies, rowVersion);
    const updatedDtos = await this.service.upsertRoleWorkspaceEntries(roleId, requestDto);
    return RoleWorkspaceEntryPolicyMapper.toEntityList(updatedDtos);
  }

  async deleteRoleWorkspaceEntry(roleId: string, workspaceKey: string): Promise<void> {
    await this.service.deleteRoleWorkspaceEntry(roleId, workspaceKey.trim().toLowerCase());
  }
}
