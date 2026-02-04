import type { IApiService } from "@core/interfaces/api.interface";
import type { TenantSettingsModel, UpdateTenantSettingsRequest } from "../models/TenantSettingsModel";
import type { ITenantSettingsService } from "../../domain/interfaces/ITenantSettingsService";

const ENDPOINTS = {
      MY_SETTINGS: "/api/Tenants/my/settings",
};

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
            return this.apiService.get<TenantSettingsModel>(ENDPOINTS.MY_SETTINGS);
      }

      /**
       * Update the current user's tenant settings
       */
      async updateMySettings(request: UpdateTenantSettingsRequest): Promise<void> {
            await this.apiService.put(ENDPOINTS.MY_SETTINGS, request);
      }
}
