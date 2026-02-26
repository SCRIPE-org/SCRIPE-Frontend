/**
 * Edition Repository Interface
 */
import type { Edition } from "../entities/Edition";
import type { CreateEditionRequest, UpdateEditionRequest } from "../entities/EditionRequests";
import type { PagedResult, PaginationParams } from "@modules/system/core/domain/types";

export interface IEditionRepository {
      getAll(params: PaginationParams & { includeRetired?: boolean }): Promise<PagedResult<Edition>>;
      getById(id: string): Promise<Edition>;
      create(request: CreateEditionRequest): Promise<string>;
      update(id: string, request: UpdateEditionRequest): Promise<void>;
      delete(id: string): Promise<void>;
      setFeatureValue(editionId: string, featureId: string, value: string): Promise<void>;
}
