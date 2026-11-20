import type {
  DataExchangeSavedPresetDto,
  SaveMappingPresetRequestDto,
} from "@core/data-exchange/domain/types";

/**
 * Service contract for saved presets API endpoints.
 */
export interface IPresetsService {
  /**
   * Fetches saved presets from the API.
   */
  fetchPresets(
    entityKey?: string,
    signal?: AbortSignal
  ): Promise<DataExchangeSavedPresetDto[]>;

  /**
   * Persists a preset to the backend.
   */
  persistPreset(
    request: SaveMappingPresetRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeSavedPresetDto>;

  /**
   * Deletes a preset on the backend.
   */
  removePreset(id: string, signal?: AbortSignal): Promise<void>;

  /**
   * Sets a preset as default for its entity key.
   */
  setDefaultPreset(id: string, signal?: AbortSignal): Promise<void>;
}
