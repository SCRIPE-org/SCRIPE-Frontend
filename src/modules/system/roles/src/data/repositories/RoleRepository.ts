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
} from "../../domain/interfaces/IRoleRepository";
import { Role } from "../../domain/entities/Role";
import type {
      CreateRoleRequest,
      UpdateRoleRequest,
      AssignPermissionsRequest,
      DeleteRoleRequest,
} from "../../domain/entities/RoleRequests";
import type { PagedResult } from "@modules/system/core/domain/types";
import type { IRoleService } from "../../domain/interfaces/IRoleService";
import { RoleMapper } from "../mappers/RoleMapper";

export class RoleRepository implements IRoleRepository {
      constructor(private readonly service: IRoleService) { }

      async getAll(params: RoleListParams): Promise<PagedResult<Role>> {
            const result = await this.service.getAll(params);

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
            const response = await this.service.create(model.toJson());
            return response.id;
      }

      async update(id: string, request: UpdateRoleRequest): Promise<void> {
            const model = RoleMapper.toUpdateModel(request);
            await this.service.update(id, model.toJson());
      }

      async delete(id: string, options?: DeleteRoleRequest): Promise<void> {
            const params = new URLSearchParams();
            if (options?.fallbackRoleId) {
                  params.append('fallbackRoleId', options.fallbackRoleId);
            }
            const queryString = params.toString();
            await this.service.delete(queryString ? `${id}?${queryString}` : id);
      }

      async assignPermissions(
            roleId: string,
            request: AssignPermissionsRequest
      ): Promise<void> {
            const model = RoleMapper.toAssignPermissionsModel(request);
            await this.service.assignPermissions(roleId, model.toJson());
      }

      async removePermission(roleId: string, permissionId: string): Promise<void> {
            await this.service.removePermission(roleId, permissionId);
      }

      async getRolePermissions(roleId: string): Promise<any[]> {
            return this.service.getRolePermissions(roleId);
      }

      async getAdminCount(roleId: string): Promise<number> {
            return this.service.getAdminCount(roleId);
      }
}
