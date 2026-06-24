/**
 * DSR Repository — calls service, maps models → domain entities.
 * Implements IDsrRepository.
 */
import type { IDsrRepository } from "../../domain/interfaces/IDsrRepository";
import type { IDsrService } from "../../domain/interfaces/IDsrService";
import type { DataSubjectRequest } from "../../domain/entities/DataSubjectRequest";
import type { PagedResult } from "@core/interfaces/common.interface";
import type {
  DsrListParams,
  SubmitDsrRequest,
  ReviewDsrRequest,
} from "../../domain/entities/DsrRequests";
import { DsrMapper } from "../mappers/DsrMapper";

/**
 * Repository implementation for managing database operations on Dsr resources.
 */
export class DsrRepository implements IDsrRepository {
  constructor(private readonly service: IDsrService) {}

  async getAll(params: DsrListParams): Promise<PagedResult<DataSubjectRequest>> {
    const result = await this.service.getAll(params);
    return {
      ...result,
      items: result.items.map(DsrMapper.toEntity),
    };
  }

  async getById(id: string): Promise<DataSubjectRequest> {
    const model = await this.service.getById(id);
    return DsrMapper.toEntity(model);
  }

  async submit(data: SubmitDsrRequest): Promise<string> {
    const result = await this.service.submit(data);
    return result.id;
  }

  review(id: string, data: ReviewDsrRequest): Promise<void> {
    return this.service.review(id, data);
  }

  cancel(id: string): Promise<void> {
    return this.service.cancel(id);
  }

  confirmErasure(id: string): Promise<void> {
    return this.service.confirmErasure(id);
  }

  downloadExport(id: string): Promise<Blob> {
    return this.service.downloadExport(id);
  }
}
