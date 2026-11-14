import type { IApiService } from "@core/interfaces/api.interface";
import { DATA_EXCHANGE_ENDPOINTS } from "@core/data-exchange/data/services/data-exchange.endpoints";
import type {
  DataExchangeSavedPresetDto,
  SaveMappingPresetRequestDto,
} from "@core/data-exchange/domain/types";
import type { IPresetsService } from "../../domain/interfaces/IPresetsService";

/**
 * Service handling HTTP calls for saved presets.
 */
export class PresetsService implements IPresetsService {
  constructor(private readonly apiService: IApiService) {}

  /**
   * Fetches saved presets, optionally filtered by entityKey.
   */
  async fetchPresets(
    entityKey?: string,
    signal?: AbortSignal
  ): Promise<DataExchangeSavedPresetDto[]> {
    const result = await this.apiService.get<DataExchangeSavedPresetDto[]>(
      DATA_EXCHANGE_ENDPOINTS.PRESETS,
      entityKey ? { entityKey } : undefined,
      signal
    );
    return Array.isArray(result) ? result : ((result as { data?: DataExchangeSavedPresetDto[] })?.data ?? []);
  }

  /**
   * Persists a preset to the backend.
   */
  async persistPreset(
    request: SaveMappingPresetRequestDto,
    signal?: AbortSignal
  ): Promise<DataExchangeSavedPresetDto> {
    return this.apiService.post<DataExchangeSavedPresetDto>(
      DATA_EXCHANGE_ENDPOINTS.PRESETS,
      request,
      signal
    );
  }

  /**
   * Deletes a preset by its unique ID.
   */
  async removePreset(id: string, signal?: AbortSignal): Promise<void> {
    await this.apiService.delete<void>(
      DATA_EXCHANGE_ENDPOINTS.PRESET_BY_ID(id),
      signal
    );
  }
}
