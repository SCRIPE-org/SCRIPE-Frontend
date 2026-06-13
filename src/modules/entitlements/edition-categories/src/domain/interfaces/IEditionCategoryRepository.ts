import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import type { EditionCategory } from "../entities/EditionCategory";
import type {
  CreateEditionCategoryRequest,
  UpdateEditionCategoryRequest,
} from "../entities/EditionCategoryRequests";

export interface IEditionCategoryRepository {
  getAll(params: PaginationParams): Promise<PagedResult<EditionCategory>>;
  getById(id: string): Promise<EditionCategory>;
  create(data: CreateEditionCategoryRequest): Promise<string>;
  update(id: string, data: UpdateEditionCategoryRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
