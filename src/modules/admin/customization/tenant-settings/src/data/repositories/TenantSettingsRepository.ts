import type { Result } from "@core/common/types/result";
import { Result as R } from "@core/common/types/result";
import type { TenantSettings } from "../../domain/entities/TenantSettings";
import type { ITenantSettingsRepository } from "../../domain/interfaces/ITenantSettingsRepository";
import type { TenantSettingsService } from "../services/TenantSettingsService";
import { TenantSettingsMapper } from "../mappers/TenantSettingsMapper";

/**
 * TenantSettingsRepository - Implementation
 * Uses service for API calls and mapper for data transformation
 */
export class TenantSettingsRepository implements ITenantSettingsRepository {
  constructor(private readonly service: TenantSettingsService) {}

  async getMySettings(): Promise<Result<TenantSettings, Error>> {
    try {
      const model = await this.service.getMySettings();
      const entity = TenantSettingsMapper.toDomain(model);
      return R.ok(entity);
    } catch (error) {
      return R.err(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async updateMySettings(settings: Partial<TenantSettings>): Promise<Result<void, Error>> {
    try {
      const request = TenantSettingsMapper.toRequest(settings);
      await this.service.updateMySettings(request);
      return R.ok(undefined);
    } catch (error) {
      return R.err(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
