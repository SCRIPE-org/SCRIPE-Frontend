/**
 * Admin Service
 *
 * Handles all API calls for the Admin module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * @module admin/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  AdminModel,
  type AdminJson,
  type AdminListResponseJson,
  type AdminRoleJson,
  type CreateAdminJson,
  type UpdateAdminJson,
  type AssignRoleJson,
  type BulkAdminsFilterJson,
} from "../models/AdminModel";
import type {
  IAdminService,
  ServiceAdminListParams,
  AdminListResult,
} from "../../domain/interfaces/IAdminService";
import { ADMIN_ENDPOINTS } from "./admin.endpoints";

/**
 * Http API network service for admin.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class AdminService implements IAdminService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: ServiceAdminListParams): Promise<AdminListResult> {
    const url = buildUrl(ADMIN_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      isActive: params.isActive,
    });

    const response = await this.api.get<AdminListResponseJson>(url);

    return {
      items: response.items.map((json) => AdminModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getByTenantId(tenantId: string, params: ServiceAdminListParams): Promise<AdminListResult> {
    const url = buildUrl(ADMIN_ENDPOINTS.BY_TENANT_ID(tenantId), {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      isActive: params.isActive,
    });

    const response = await this.api.get<AdminListResponseJson>(url);

    return {
      items: response.items.map((json) => AdminModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getMyTenantAdmins(params: ServiceAdminListParams): Promise<AdminListResult> {
    const url = buildUrl(ADMIN_ENDPOINTS.MY_TENANT_ADMINS, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search,
      isActive: params.isActive,
    });

    const response = await this.api.get<AdminListResponseJson>(url);

    return {
      items: response.items.map((json) => AdminModel.fromJson(json)),
      totalCount: response.totalCount,
      page: response.pageNumber,
      pageSize: response.pageSize,
      totalPages: response.totalPages,
      hasNextPage: response.hasNextPage,
      hasPreviousPage: response.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<AdminModel> {
    const json = await this.api.get<AdminJson>(ADMIN_ENDPOINTS.BY_ID(id));
    return AdminModel.fromJson(json);
  }

  async create(json: CreateAdminJson): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(ADMIN_ENDPOINTS.CREATE, json);
  }

  async createForMyTenant(json: Omit<CreateAdminJson, "tenantId">): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(ADMIN_ENDPOINTS.CREATE_FOR_MY_TENANT, json);
  }

  async update(id: string, json: UpdateAdminJson): Promise<void> {
    await this.api.put(ADMIN_ENDPOINTS.UPDATE(id), json);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(ADMIN_ENDPOINTS.DELETE(id));
  }

  async setActive(id: string, isActive: boolean): Promise<void> {
    await this.api.patch(ADMIN_ENDPOINTS.SET_ACTIVE(id), isActive);
  }

  async assignRole(adminId: string, json: AssignRoleJson): Promise<void> {
    await this.api.post(ADMIN_ENDPOINTS.ROLES(adminId), json);
  }

  async removeRole(adminId: string, roleId: string, tenantId?: string): Promise<void> {
    const url = buildUrl(ADMIN_ENDPOINTS.REMOVE_ROLE(adminId, roleId), {
      tenantId,
    });
    await this.api.delete(url);
  }

  async syncRoles(
    adminId: string,
    assignments: import("../models/AdminModel").SyncRoleAssignmentJson[],
    scopeTenantId?: string
  ): Promise<void> {
    await this.api.post(ADMIN_ENDPOINTS.SYNC_ROLES(adminId), { assignments, scopeTenantId });
  }

  async getRoles(adminId: string): Promise<AdminRoleJson[]> {
    return this.api.get<AdminRoleJson[]>(ADMIN_ENDPOINTS.ROLES(adminId));
  }

  async resetPassword(id: string, newPassword: string): Promise<void> {
    await this.api.post(ADMIN_ENDPOINTS.RESET_PASSWORD(id), { newPassword });
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    await this.api.post(ADMIN_ENDPOINTS.CHANGE_PASSWORD(id), {
      currentPassword,
      newPassword,
    });
  }

  async bulkActivate(ids: string[]): Promise<number> {
    return this.api.post<number>(ADMIN_ENDPOINTS.BULK.ACTIVATE, ids);
  }

  async bulkDeactivate(ids: string[]): Promise<number> {
    return this.api.post<number>(ADMIN_ENDPOINTS.BULK.DEACTIVATE, ids);
  }

  async bulkDelete(ids: string[]): Promise<number> {
    return this.api.post<number>(ADMIN_ENDPOINTS.BULK.DELETE, ids);
  }

  async bulkActivateAll(filter: BulkAdminsFilterJson): Promise<number> {
    return this.api.post<number>(ADMIN_ENDPOINTS.BULK.ACTIVATE_ALL, filter);
  }

  async bulkDeactivateAll(filter: BulkAdminsFilterJson): Promise<number> {
    return this.api.post<number>(ADMIN_ENDPOINTS.BULK.DEACTIVATE_ALL, filter);
  }

  async bulkDeleteAll(filter: BulkAdminsFilterJson): Promise<number> {
    return this.api.post<number>(ADMIN_ENDPOINTS.BULK.DELETE_ALL, filter);
  }

  async transfer(
    id: string,
    json: import("../models/AdminModel").TransferAdminJson
  ): Promise<void> {
    await this.api.post(ADMIN_ENDPOINTS.TRANSFER(id), json);
  }

  async transferProtection(targetAdminId: string): Promise<void> {
    await this.api.post(ADMIN_ENDPOINTS.TRANSFER_PROTECTION, { targetAdminId });
  }

  async resendSetupEmail(adminId: string): Promise<void> {
    await this.api.post(ADMIN_ENDPOINTS.RESEND_SETUP_EMAIL, { adminId });
  }
}
