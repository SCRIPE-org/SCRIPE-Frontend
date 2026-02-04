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
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import {
      PermissionModel,
      type PermissionJson,
      type CreatePermissionJson,
      type UpdatePermissionJson,
} from "../models/PermissionModel";
import type { IPermissionService } from "../../domain/interfaces/IPermissionService";
import type { PermissionListParams } from "../../domain/interfaces/IPermissionRepository";

export class PermissionService implements IPermissionService {
      constructor(private readonly api: IApiService) { }

      async getAll(params?: PermissionListParams): Promise<PermissionModel[]> {
            const url = buildUrl(API_ENDPOINTS.PERMISSIONS.LIST, {
                  category: params?.category,
                  search: params?.search,
            });
            const jsonList = await this.api.get<PermissionJson[]>(url);
            return jsonList.map((json) => PermissionModel.fromJson(json));
      }

      async getMyPermissions(
            params?: PermissionListParams
      ): Promise<PermissionModel[]> {
            const url = buildUrl(API_ENDPOINTS.PERMISSIONS.MY, {
                  category: params?.category,
                  search: params?.search,
            });
            const jsonList = await this.api.get<PermissionJson[]>(url);
            return jsonList.map((json) => PermissionModel.fromJson(json));
      }

      async getById(id: string): Promise<PermissionModel> {
            const json = await this.api.get<PermissionJson>(
                  API_ENDPOINTS.PERMISSIONS.BY_ID(id)
            );
            return PermissionModel.fromJson(json);
      }

      async getCategories(): Promise<string[]> {
            return this.api.get<string[]>(API_ENDPOINTS.PERMISSIONS.CATEGORIES);
      }

      async create(json: CreatePermissionJson): Promise<{ id: string }> {
            return this.api.post<{ id: string }>(API_ENDPOINTS.PERMISSIONS.CREATE, json);
      }

      async update(id: string, json: UpdatePermissionJson): Promise<void> {
            await this.api.put(API_ENDPOINTS.PERMISSIONS.UPDATE(id), json);
      }

      async delete(id: string): Promise<void> {
            await this.api.delete(API_ENDPOINTS.PERMISSIONS.DELETE(id));
      }
}
