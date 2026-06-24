import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";
import type { EditionCategoryModel } from "../../data/models/EditionCategoryModels";
import type {
  CreateEditionCategoryRequest,
  UpdateEditionCategoryRequest,
} from "../entities/EditionCategoryRequests";

/**
 * Http API network service for i edition category.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IEditionCategoryService {
  getAll(params: PaginationParams): Promise<PagedResult<EditionCategoryModel>>;
  getById(id: string): Promise<EditionCategoryModel>;
  create(data: CreateEditionCategoryRequest): Promise<{ id: string }>;
  update(id: string, data: UpdateEditionCategoryRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
