import type {
  DataExchangeDescriptorResponseDto,
  DownloadTemplateParams,
} from "@core/data-exchange/domain/types";
import { DataExchangeEntity } from "../../domain/entities/DataExchangeEntity";
import type { IEntitiesRepository } from "../../domain/interfaces/IEntitiesRepository";
import type { IEntitiesService } from "../../domain/interfaces/IEntitiesService";
import { DataExchangeEntityMapper } from "../mappers/DataExchangeEntityMapper";

/**
 * Concrete repository implementing IEntitiesRepository.
 */
export class EntitiesRepository implements IEntitiesRepository {
  constructor(private readonly service: IEntitiesService) {}

  /**
   * Retrieves and maps all entities in the data exchange catalog.
   */
  async getAll(signal?: AbortSignal): Promise<DataExchangeEntity[]> {
    const models = await this.service.fetchEntities(signal);
    return models.map((m) => DataExchangeEntityMapper.toDomain(m));
  }

  /**
   * Retrieves descriptor metadata for a specific entity.
   */
  async getDescriptor(
    entityKey: string,
    signal?: AbortSignal
  ): Promise<DataExchangeDescriptorResponseDto> {
    return this.service.fetchDescriptor(entityKey, signal);
  }

  /**
   * Downloads a template workbook blob.
   */
  async downloadTemplate(
    params: DownloadTemplateParams,
    signal?: AbortSignal
  ): Promise<Blob> {
    return this.service.fetchTemplateBlob(params, signal);
  }
}
