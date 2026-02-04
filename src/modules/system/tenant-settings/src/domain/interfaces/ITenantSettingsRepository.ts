import type { TenantSettings } from "../entities/TenantSettings";
import type { Result } from "@core/common/types/result";

/**
 * Repository interface for TenantSettings
 * Follows Clean Architecture - domain layer contract
 */
export interface ITenantSettingsRepository {
      /**
       * Get the current user's tenant settings
       */
      getMySettings(): Promise<Result<TenantSettings, Error>>;

      /**
       * Update the current user's tenant settings
       */
      updateMySettings(settings: Partial<TenantSettings>): Promise<Result<void, Error>>;
}
