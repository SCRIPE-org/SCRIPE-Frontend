/**
 * Permission Service
 *
 * Handles all API calls for the Permissions module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * Clean Architecture:
 * View → ViewModel → Repository → Service → IApiService
 *                        ↓
 *                    Mapper (Model → Entity)
 *
 * @module permissions/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import {
  PermissionModel,
  type PermissionJson,
  type CreatePermissionJson,
  type UpdatePermissionJson,
  type PermissionModuleGroupJson,
} from "../models/PermissionModel";
import type { IPermissionService } from "../../domain/interfaces/IPermissionService";
import type { PermissionListParams } from "../../domain/interfaces/IPermissionRepository";
import { PERMISSIONS_ENDPOINTS } from "./permissions.endpoints";

/**
 * Http API network service for permission.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class PermissionService implements IPermissionService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: PermissionListParams): Promise<PermissionModel[]> {
    const url = buildUrl(PERMISSIONS_ENDPOINTS.LIST, {
      category: params?.category,
      search: params?.search,
    });
    const jsonList = await this.api.get<PermissionJson[]>(url);
    return jsonList.map((json) => PermissionModel.fromJson(json));
  }

  async getMyPermissions(params?: PermissionListParams): Promise<PermissionModel[]> {
    const url = buildUrl(PERMISSIONS_ENDPOINTS.MY, {
      category: params?.category,
      search: params?.search,
    });
    const jsonList = await this.api.get<PermissionJson[]>(url);
    return jsonList.map((json) => PermissionModel.fromJson(json));
  }

  async getForTenant(tenantId: string, params?: PermissionListParams): Promise<PermissionModel[]> {
    const url = buildUrl(PERMISSIONS_ENDPOINTS.TENANTS.PERMISSIONS(tenantId), {
      search: params?.search,
    });
    const jsonList = await this.api.get<PermissionJson[]>(url);
    return jsonList.map((json) => PermissionModel.fromJson(json));
  }

  async getById(id: string): Promise<PermissionModel> {
    const json = await this.api.get<PermissionJson>(PERMISSIONS_ENDPOINTS.BY_ID(id));
    return PermissionModel.fromJson(json);
  }

  async getCategories(): Promise<string[]> {
    return this.api.get<string[]>(PERMISSIONS_ENDPOINTS.CATEGORIES);
  }

  async getGrouped(search?: string): Promise<PermissionModuleGroupJson[]> {
    const url = buildUrl(PERMISSIONS_ENDPOINTS.GROUPED, { search });
    return this.api.get<PermissionModuleGroupJson[]>(url);
  }

  async getGroupedForTenant(
    tenantId: string,
    search?: string
  ): Promise<PermissionModuleGroupJson[]> {
    const url = buildUrl(PERMISSIONS_ENDPOINTS.TENANTS.PERMISSIONS_GROUPED(tenantId), { search });
    return this.api.get<PermissionModuleGroupJson[]>(url);
  }

  async create(json: CreatePermissionJson): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(PERMISSIONS_ENDPOINTS.CREATE, json);
  }

  async update(id: string, json: UpdatePermissionJson): Promise<void> {
    await this.api.put(PERMISSIONS_ENDPOINTS.UPDATE(id), json);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(PERMISSIONS_ENDPOINTS.DELETE(id));
  }
}
