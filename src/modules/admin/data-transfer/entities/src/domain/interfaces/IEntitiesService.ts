import type {
  DataExchangeDescriptorResponseDto,
  DataExchangeEntitySummaryDto,
  DownloadTemplateParams,
} from "@core/data-exchange/domain/types";

/**
 * Low-level API service interface for entities catalog endpoints.
 */
export interface IEntitiesService {
  /** Fetches raw entity summary models from the API. */
  fetchEntities(signal?: AbortSignal): Promise<DataExchangeEntitySummaryDto[]>;

  /** Fetches raw entity descriptor metadata from the API. */
  fetchDescriptor(
    entityKey: string,
    signal?: AbortSignal
  ): Promise<DataExchangeDescriptorResponseDto>;

  /** Fetches a template file blob from the API. */
  fetchTemplateBlob(
    params: DownloadTemplateParams,
    signal?: AbortSignal
  ): Promise<Blob>;
}
