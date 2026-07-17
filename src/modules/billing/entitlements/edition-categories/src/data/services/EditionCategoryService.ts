import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type { IEditionCategoryService } from "../../domain/interfaces/IEditionCategoryService";
import type { EditionCategoryModel } from "../models/EditionCategoryModels";
import type { PagedResult, PaginationParams } from "@core/interfaces/common.interface";
import type {
  CreateEditionCategoryRequest,
  UpdateEditionCategoryRequest,
} from "../../domain/entities/EditionCategoryRequests";
import { EDITION_CATEGORY_ENDPOINTS } from "./edition-category.endpoints";

/**
 * Http API network service for edition category.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class EditionCategoryService implements IEditionCategoryService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: PaginationParams): Promise<PagedResult<EditionCategoryModel>> {
    const url = buildUrl(EDITION_CATEGORY_ENDPOINTS.LIST, {
      page: params.page,
      pageSize: params.pageSize,
      search: params.search || undefined,
    });
    return this.api.get<PagedResult<EditionCategoryModel>>(url);
  }

  async getById(id: string): Promise<EditionCategoryModel> {
    return this.api.get<EditionCategoryModel>(
      EDITION_CATEGORY_ENDPOINTS.BY_ID(id)
    );
  }

  async create(data: CreateEditionCategoryRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(
      EDITION_CATEGORY_ENDPOINTS.CREATE,
      data
    );
  }

  async update(id: string, data: UpdateEditionCategoryRequest): Promise<void> {
    await this.api.put(EDITION_CATEGORY_ENDPOINTS.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(EDITION_CATEGORY_ENDPOINTS.DELETE(id));
  }
}
