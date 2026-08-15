/**
 * Tenant Settings Service Interface
 *
 * Defines the contract for tenant settings API operations.
 * Implementation in data/services/TenantSettingsService.ts
 *
 * @module tenant-settings/domain
 */
import type { TenantSettingsModel, UpdateTenantSettingsRequest } from "../types/SettingsTypes";

export interface ITenantSettingsService {
  /**
   * Get the current user's tenant settings
   */
  getMySettings(): Promise<TenantSettingsModel>;

  /**
   * Update the current user's tenant settings
   */
  updateMySettings(request: UpdateTenantSettingsRequest): Promise<void>;
}
