import type { IApiService } from "@core/interfaces/api.interface";
import { DATA_EXCHANGE_ENDPOINTS } from "@core/data-exchange/data/services/data-exchange.endpoints";
import type {
  DataExchangeDescriptorResponseDto,
  DataExchangeEntitySummaryDto,
  DownloadTemplateParams,
} from "@core/data-exchange/domain/types";
import type { IEntitiesService } from "../../domain/interfaces/IEntitiesService";

/**
 * Service handling HTTP calls to DataTransfer entities endpoints.
 */
export class EntitiesService implements IEntitiesService {
  constructor(private readonly apiService: IApiService) {}

  /**
   * Fetches the catalog of exchange-capable entities.
   */
  async fetchEntities(signal?: AbortSignal): Promise<DataExchangeEntitySummaryDto[]> {
    const result = await this.apiService.get<DataExchangeEntitySummaryDto[]>(
      DATA_EXCHANGE_ENDPOINTS.ENTITIES,
      undefined,
      signal
    );
    return Array.isArray(result) ? result : ((result as { data?: DataExchangeEntitySummaryDto[] })?.data ?? []);
  }

  /**
   * Fetches metadata descriptor for an entity.
   */
  async fetchDescriptor(
    entityKey: string,
    signal?: AbortSignal
  ): Promise<DataExchangeDescriptorResponseDto> {
    return this.apiService.get<DataExchangeDescriptorResponseDto>(
      DATA_EXCHANGE_ENDPOINTS.DESCRIPTOR(entityKey),
      undefined,
      signal
    );
  }

  /**
   * Downloads a generated spreadsheet template.
   */
  async fetchTemplateBlob(
    params: DownloadTemplateParams,
    signal?: AbortSignal
  ): Promise<Blob> {
    const query = new URLSearchParams();
    query.set("entityKey", params.entityKey);
    if (params.format) query.set("format", params.format);
    if (params.locale) query.set("locale", params.locale);
    if (params.multiSheet) query.set("multiSheet", "true");
    if (params.entityKeys && params.entityKeys.length > 0) {
      params.entityKeys.forEach((k) => query.append("entityKeys", k));
    }

    return this.apiService.getBlob(
      `${DATA_EXCHANGE_ENDPOINTS.TEMPLATE}?${query.toString()}`,
      signal
    );
  }
}
