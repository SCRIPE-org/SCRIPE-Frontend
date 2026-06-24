import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";
import type { EditionCategory } from "../entities/EditionCategory";
import type {
  CreateEditionCategoryRequest,
  UpdateEditionCategoryRequest,
} from "../entities/EditionCategoryRequests";

/**
 * Interface defining repository methods for managing EditionCategory data access.
 */
export interface IEditionCategoryRepository {
  getAll(params: PaginationParams): Promise<PagedResult<EditionCategory>>;
  getById(id: string): Promise<EditionCategory>;
  create(data: CreateEditionCategoryRequest): Promise<string>;
  update(id: string, data: UpdateEditionCategoryRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
