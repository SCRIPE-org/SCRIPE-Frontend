import type { IApiService } from "@core/interfaces/api.interface";
import type { IEditionCategoryService } from "../../domain/interfaces/IEditionCategoryService";
import type { EditionCategoryModel } from "../models/EditionCategoryModels";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import type { CreateEditionCategoryRequest, UpdateEditionCategoryRequest } from "../../domain/entities/EditionCategoryRequests";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export class EditionCategoryService implements IEditionCategoryService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: PaginationParams): Promise<PagedResult<EditionCategoryModel>> {
    return this.api.get<PagedResult<EditionCategoryModel>>(
      API_ENDPOINTS.ENTITLEMENTS.EDITION_CATEGORIES.LIST,
      { page: params.page, pageSize: params.pageSize, search: params.search || undefined }
    );
  }

  async getById(id: string): Promise<EditionCategoryModel> {
    return this.api.get<EditionCategoryModel>(API_ENDPOINTS.ENTITLEMENTS.EDITION_CATEGORIES.BY_ID(id));
  }

  async create(data: CreateEditionCategoryRequest): Promise<{ id: string }> {
    return this.api.post<{ id: string }>(API_ENDPOINTS.ENTITLEMENTS.EDITION_CATEGORIES.CREATE, data);
  }

  async update(id: string, data: UpdateEditionCategoryRequest): Promise<void> {
    await this.api.put(API_ENDPOINTS.ENTITLEMENTS.EDITION_CATEGORIES.UPDATE(id), data);
  }

  async delete(id: string): Promise<void> {
    await this.api.delete(API_ENDPOINTS.ENTITLEMENTS.EDITION_CATEGORIES.DELETE(id));
  }
}
