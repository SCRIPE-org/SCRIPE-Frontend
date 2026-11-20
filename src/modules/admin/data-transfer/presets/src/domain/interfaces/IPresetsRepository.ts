import type { SaveMappingPresetRequestDto } from "@core/data-exchange/domain/types";
import type { DataExchangePreset } from "../entities/DataExchangePreset";

/**
 * Repository interface for managing data exchange saved presets.
 */
export interface IPresetsRepository {
  /**
   * Retrieves all saved presets, optionally filtered by entityKey.
   */
  getPresets(entityKey?: string, signal?: AbortSignal): Promise<DataExchangePreset[]>;

  /**
   * Creates or updates a mapping preset.
   */
  savePreset(
    request: SaveMappingPresetRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangePreset>;

  /**
   * Deletes a preset by its unique identifier.
   */
  deletePreset(id: string, signal?: AbortSignal): Promise<void>;

  /**
   * Sets a preset as default for its entity key.
   */
  setDefaultPreset(id: string, signal?: AbortSignal): Promise<void>;
}
