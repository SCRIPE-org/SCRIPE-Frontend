/**
 * Tenant Service
 *
 * Handles all API calls for the Tenants module.
 * Returns Models (DTOs) - Repository uses Mapper to convert to Entities.
 *
 * @module tenants/data
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import {
      TenantModel,
      TenantTreeNodeModel,
      type TenantJson,
      type TenantTreeNodeJson,
      type TenantListResponseJson,
      type CreateTenantJson,
      type UpdateTenantJson,
} from "../models/TenantModel";
import type {
      ITenantService,
      ServiceTenantListParams,
      TenantListResult,
} from "../../domain/interfaces/ITenantService";
import type { TenantStats } from "../../domain/interfaces/ITenantRepository";
import { PermissionModel, type PermissionJson } from "@modules/system/permissions/src/data/models/PermissionModel";
import type { TenantSettingsModel, UpdateTenantSettingsRequest } from "@modules/system/tenant-settings/src/data/models/TenantSettingsModel";

export class TenantService implements ITenantService {
      constructor(private readonly api: IApiService) { }

      async getAll(params: ServiceTenantListParams): Promise<TenantListResult> {
            const url = buildUrl(API_ENDPOINTS.TENANTS.LIST, {
                  page: params.page,
                  pageSize: params.pageSize,
                  search: params.search,
                  parentId: params.parentId,
            });

            const response = await this.api.get<TenantListResponseJson>(url);

            return {
                  items: response.items.map((json) => TenantModel.fromJson(json)),
                  totalCount: response.totalCount,
                  page: response.page,
                  pageSize: response.pageSize,
                  totalPages: response.totalPages,
                  hasNextPage: response.hasNextPage,
                  hasPreviousPage: response.hasPreviousPage,
            };
      }

      async getTree(): Promise<TenantTreeNodeModel[]> {
            const jsonList = await this.api.get<TenantTreeNodeJson[]>(
                  API_ENDPOINTS.TENANTS.TREE
            );
            return jsonList.map((json) => TenantTreeNodeModel.fromJson(json));
      }

      async getMyChildren(): Promise<TenantTreeNodeModel[]> {
            const jsonList = await this.api.get<TenantTreeNodeJson[]>(
                  API_ENDPOINTS.TENANTS.MY_CHILDREN
            );
            return jsonList.map((json) => TenantTreeNodeModel.fromJson(json));
      }

      async getChildren(parentId: string): Promise<TenantTreeNodeModel[]> {
            const jsonList = await this.api.get<TenantTreeNodeJson[]>(
                  API_ENDPOINTS.TENANTS.CHILDREN(parentId)
            );
            return jsonList.map((json) => TenantTreeNodeModel.fromJson(json));
      }

      async getById(id: string): Promise<TenantModel> {
            const json = await this.api.get<TenantJson>(
                  API_ENDPOINTS.TENANTS.BY_ID(id)
            );
            return TenantModel.fromJson(json);
      }

      async create(json: CreateTenantJson): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.TENANTS.CREATE, json);
      }

      async update(id: string, json: UpdateTenantJson): Promise<void> {
            await this.api.put(API_ENDPOINTS.TENANTS.UPDATE(id), json);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.TENANTS.DELETE(id));
      }

      async getStats(id: string): Promise<TenantStats> {
            return this.api.get<TenantStats>(API_ENDPOINTS.TENANTS.STATS(id));
      }

      async getDescendantCount(id: string): Promise<number> {
            return this.api.get<number>(`${API_ENDPOINTS.TENANTS.BY_ID(id)}/descendant-count`);
      }

      async getCreationPermissions(parentId?: string, search?: string): Promise<PermissionModel[]> {
            const url = buildUrl(API_ENDPOINTS.TENANTS.CREATION_PERMISSIONS, {
                  parentId,
                  search,
            });
            const jsonList = await this.api.get<PermissionJson[]>(url);
            return jsonList.map((json) => PermissionModel.fromJson(json));
      }

      async getTenantPermissions(tenantId: string, search?: string): Promise<PermissionModel[]> {
            const url = buildUrl(API_ENDPOINTS.TENANTS.PERMISSIONS(tenantId), {
                  search,
            });
            const jsonList = await this.api.get<PermissionJson[]>(url);
            return jsonList.map((json) => PermissionModel.fromJson(json));
      }

      async updateTenantPermissions(tenantId: string, permissionIds: string[]): Promise<void> {
            await this.api.put(API_ENDPOINTS.TENANTS.PERMISSIONS(tenantId), { permissionIds });
      }

      async toggleStatus(id: string, isActive: boolean): Promise<void> {
            // Backend requires Name/Description/Address for any update
            // So we must Fetch -> Update
            const current = await this.getById(id);

            const payload: UpdateTenantJson = {
                  name: current.name,
                  description: current.description,
                  address: current.address,
                  isActive: isActive,
            };

            await this.api.put(API_ENDPOINTS.TENANTS.UPDATE(id), payload);
      }

      setTenantContext(tenantId: string | null): void {
            this.api.setTenantContext(tenantId);
      }

      async getSettings(tenantId: string): Promise<TenantSettingsModel> {
            return this.api.get<TenantSettingsModel>(API_ENDPOINTS.TENANTS.SETTINGS(tenantId));
      }

      async updateSettings(tenantId: string, request: UpdateTenantSettingsRequest): Promise<void> {
            await this.api.put(API_ENDPOINTS.TENANTS.SETTINGS(tenantId), request);
      }
}
