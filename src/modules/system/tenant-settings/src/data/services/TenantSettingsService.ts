import type { IApiService } from "@core/interfaces/api.interface";
import type { TenantSettingsModel, UpdateTenantSettingsRequest } from "../models/TenantSettingsModel";
import type { ITenantSettingsService } from "../../domain/interfaces/ITenantSettingsService";
import { API_ENDPOINTS } from "@/core/config/api-endpoints";



/**
 * TenantSettingsService - API wrapper
 * Handles HTTP communication with backend
 */
export class TenantSettingsService implements ITenantSettingsService {
      constructor(private readonly apiService: IApiService) { }

      /**
       * Get the current user's tenant settings
       */
      async getMySettings(): Promise<TenantSettingsModel> {
            return this.apiService.get<TenantSettingsModel>(API_ENDPOINTS.TENANTS.MY_SETTINGS);
      }

      /**
       * Update the current user's tenant settings
       */
      async updateMySettings(request: UpdateTenantSettingsRequest): Promise<void> {
            await this.apiService.put(API_ENDPOINTS.TENANTS.MY_SETTINGS, request);
      }
}
