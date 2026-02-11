/**
 * Admin Repository Implementation
 *
 * Implements IAdminRepository using the AdminService.
 * Uses AdminMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 */
import type {
      IAdminRepository,
      AdminListParams,
} from "../../domain/interfaces/IAdminRepository";
import type { IAdminService, ImpersonateResult } from "../../domain/interfaces/IAdminService";
import { Admin, type AdminRoleData } from "../../domain/entities/Admin";
import { AdminMapper } from "../mappers/AdminMapper";
import type {
      CreateAdminRequest,
      UpdateAdminRequest,
      AssignRoleRequest,
      BulkAdminsFilterRequest,
      TransferAdminRequest,
      TransferProtectionRequest,
} from "../../domain/entities/AdminRequests";
import type { PagedResult } from "@modules/system/core/domain/types";

export class AdminRepository implements IAdminRepository {
      constructor(private readonly service: IAdminService) { }

      async getAll(params: AdminListParams): Promise<PagedResult<Admin>> {
            const result = await this.service.getAll(params);

            return {
                  items: result.items.map((model) => AdminMapper.toEntity(model)),
                  totalCount: result.totalCount,
                  page: result.page,
                  pageSize: result.pageSize,
                  totalPages: result.totalPages,
                  hasNextPage: result.hasNextPage,
                  hasPreviousPage: result.hasPreviousPage,
            };
      }

      async getByTenantId(
            tenantId: string,
            params: AdminListParams
      ): Promise<PagedResult<Admin>> {
            const result = await this.service.getByTenantId(tenantId, params);

            return {
                  items: result.items.map((model) => AdminMapper.toEntity(model)),
                  totalCount: result.totalCount,
                  page: result.page,
                  pageSize: result.pageSize,
                  totalPages: result.totalPages,
                  hasNextPage: result.hasNextPage,
                  hasPreviousPage: result.hasPreviousPage,
            };
      }

      async getMyTenantAdmins(params: AdminListParams): Promise<PagedResult<Admin>> {
            const result = await this.service.getMyTenantAdmins(params);

            return {
                  items: result.items.map((model) => AdminMapper.toEntity(model)),
                  totalCount: result.totalCount,
                  page: result.page,
                  pageSize: result.pageSize,
                  totalPages: result.totalPages,
                  hasNextPage: result.hasNextPage,
                  hasPreviousPage: result.hasPreviousPage,
            };
      }

      async getById(id: string): Promise<Admin> {
            const model = await this.service.getById(id);
            return AdminMapper.toEntity(model);
      }

      async create(request: CreateAdminRequest): Promise<string> {
            const response = await this.service.create({
                  username: request.username,
                  password: request.password,
                  firstName: request.firstName,
                  lastName: request.lastName,
                  phoneNumber: request.phoneNumber,
                  notes: request.notes,
                  tenantId: request.tenantId,
                  roleIds: request.roleIds,
            });
            return response.id;
      }

      async createForMyTenant(
            request: Omit<CreateAdminRequest, "tenantId">
      ): Promise<string> {
            const response = await this.service.createForMyTenant({
                  username: request.username,
                  password: request.password,
                  firstName: request.firstName,
                  lastName: request.lastName,
                  phoneNumber: request.phoneNumber,
                  notes: request.notes,
                  roleIds: request.roleIds,
            });
            return response.id;
      }

      async update(id: string, request: UpdateAdminRequest): Promise<void> {
            await this.service.update(id, {
                  firstName: request.firstName,
                  lastName: request.lastName,
                  phoneNumber: request.phoneNumber,
                  notes: request.notes,
                  isActive: request.isActive,
            });
      }

      async delete(id: string): Promise<void> {
            await this.service.delete(id);
      }

      async setActive(id: string, isActive: boolean): Promise<void> {
            await this.service.setActive(id, isActive);
      }

      async assignRole(adminId: string, request: AssignRoleRequest): Promise<void> {
            await this.service.assignRole(adminId, {
                  roleId: request.roleId,
                  tenantId: request.tenantId,
                  expiresAt: request.expiresAt,
                  inheritToChildren: request.inheritToChildren,
            });
      }

      async removeRole(
            adminId: string,
            roleId: string,
            tenantId?: string
      ): Promise<void> {
            await this.service.removeRole(adminId, roleId, tenantId);
      }

      async syncRoles(
            adminId: string,
            assignments: import("../../domain/interfaces/IAdminRepository").SyncRoleAssignment[]
      ): Promise<void> {
            await this.service.syncRoles(adminId, assignments);
      }

      async getRoles(adminId: string): Promise<AdminRoleData[]> {
            const roles = await this.service.getRoles(adminId);
            return AdminMapper.toRoleDataList(roles);
      }

      async resetPassword(id: string, newPassword: string): Promise<void> {
            await this.service.resetPassword(id, newPassword);
      }

      async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
            await this.service.changePassword(id, currentPassword, newPassword);
      }

      async bulkActivate(ids: string[]): Promise<number> {
            return this.service.bulkActivate(ids);
      }

      async bulkDeactivate(ids: string[]): Promise<number> {
            return this.service.bulkDeactivate(ids);
      }

      async bulkDelete(ids: string[]): Promise<number> {
            return this.service.bulkDelete(ids);
      }

      async bulkActivateAll(filter: BulkAdminsFilterRequest): Promise<number> {
            return this.service.bulkActivateAll(filter);
      }

      async bulkDeactivateAll(filter: BulkAdminsFilterRequest): Promise<number> {
            return this.service.bulkDeactivateAll(filter);
      }

      async bulkDeleteAll(filter: BulkAdminsFilterRequest): Promise<number> {
            return this.service.bulkDeleteAll(filter);
      }

      async impersonate(id: string): Promise<ImpersonateResult> {
            return this.service.impersonate(id);
      }

      async transfer(id: string, request: TransferAdminRequest): Promise<void> {
            return this.service.transfer(id, {
                  targetTenantId: request.targetTenantId,
                  targetRoleId: request.targetRoleId,
            });
      }

      async transferProtection(fromAdminId: string, request: TransferProtectionRequest): Promise<void> {
            return this.service.transferProtection(fromAdminId, request.targetAdminId);
      }
}
