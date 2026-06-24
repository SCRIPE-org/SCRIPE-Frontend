import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";
import type { EditionCategory } from "../entities/EditionCategory";
import type {
  CreateEditionCategoryRequest,
  UpdateEditionCategoryRequest,
} from "../entities/EditionCategoryRequests";

/**
 * Repository layer implementing client request queries for i edition category.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IEditionCategoryRepository {
  getAll(params: PaginationParams): Promise<PagedResult<EditionCategory>>;
  getById(id: string): Promise<EditionCategory>;
  create(data: CreateEditionCategoryRequest): Promise<string>;
  update(id: string, data: UpdateEditionCategoryRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
