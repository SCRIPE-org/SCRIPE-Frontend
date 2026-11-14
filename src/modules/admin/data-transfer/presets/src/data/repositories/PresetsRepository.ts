import type { SaveMappingPresetRequestDto } from "@core/data-exchange/domain/types";
import { DataExchangePreset } from "../../domain/entities/DataExchangePreset";
import type { IPresetsRepository } from "../../domain/interfaces/IPresetsRepository";
import type { IPresetsService } from "../../domain/interfaces/IPresetsService";
import { DataExchangePresetMapper } from "../mappers/DataExchangePresetMapper";

/**
 * Concrete repository implementing IPresetsRepository.
 */
export class PresetsRepository implements IPresetsRepository {
  constructor(private readonly service: IPresetsService) {}

  /**
   * Retrieves and maps saved presets.
   */
  async getPresets(
    entityKey?: string,
    signal?: AbortSignal
  ): Promise<DataExchangePreset[]> {
    const models = await this.service.fetchPresets(entityKey, signal);
    return models.map((m) => DataExchangePresetMapper.toDomain(m));
  }

  /**
   * Creates or updates a preset.
   */
  async savePreset(
    request: SaveMappingPresetRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangePreset> {
    const model = await this.service.persistPreset(request, signal);
    return DataExchangePresetMapper.toDomain(model);
  }

  /**
   * Deletes a preset by identifier.
   */
  async deletePreset(id: string, signal?: AbortSignal): Promise<void> {
    await this.service.removePreset(id, signal);
  }
}
