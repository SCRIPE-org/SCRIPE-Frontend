/**
 * Edition Repository — uses Service + Mapper
 *
 * Clean Architecture: Repository delegates API calls to Service,
 * then uses EditionMapper for Model → Entity transformation.
 */
import type { IEditionRepository } from "../../domain/interfaces/IEditionRepository";
import { Edition } from "../../domain/entities/Edition";
import { EditionMapper } from "../mappers/EditionMapper";
import type { CreateEditionRequest, UpdateEditionRequest } from "../../domain/entities/EditionRequests";
import type { EditionService } from "../services/EditionService";
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";

export class EditionRepository implements IEditionRepository {
      constructor(private readonly service: EditionService) { }

      async getAll(params: PaginationParams & { includeRetired?: boolean }): Promise<PagedResult<Edition>> {
            const result = await this.service.getAll(params);
            return {
                  items: result.items.map((m) => EditionMapper.toEntity(m)),
                  totalCount: result.totalCount,
                  page: result.page,
                  pageSize: result.pageSize,
                  totalPages: result.totalPages,
                  hasNextPage: result.hasNextPage,
                  hasPreviousPage: result.hasPreviousPage,
            };
      }

      async getById(id: string): Promise<Edition> {
            const model = await this.service.getById(id);
            return EditionMapper.toEntity(model);
      }

      async create(request: CreateEditionRequest): Promise<string> {
            const json = EditionMapper.toCreateJson(request);
            const response = await this.service.create(json);
            return response.id;
      }

      async update(id: string, request: UpdateEditionRequest): Promise<void> {
            const json = EditionMapper.toUpdateJson(request);
            await this.service.update(id, json);
      }

      async delete(id: string): Promise<void> {
            await this.service.delete(id);
      }

      async setFeatureValue(editionId: string, featureId: string, value: string): Promise<void> {
            await this.service.setFeatureValue(editionId, featureId, value);
      }
}
