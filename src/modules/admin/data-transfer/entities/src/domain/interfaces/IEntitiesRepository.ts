import type {
  DataExchangeDescriptorResponseDto,
  DownloadTemplateParams,
} from "@core/data-exchange/domain/types";
import type { DataExchangeEntity } from "../entities/DataExchangeEntity";

/**
 * Repository interface for entities catalog data operations.
 */
export interface IEntitiesRepository {
  /** Retrieves all entities available for data exchange in the tenant. */
  getAll(signal?: AbortSignal): Promise<DataExchangeEntity[]>;

  /** Retrieves detailed descriptor metadata for a specific entity. */
  getDescriptor(
    entityKey: string,
    signal?: AbortSignal
  ): Promise<DataExchangeDescriptorResponseDto>;

  /** Downloads a generated 3-tab spreadsheet template workbook. */
  downloadTemplate(
    params: DownloadTemplateParams,
    signal?: AbortSignal
  ): Promise<Blob>;
}
