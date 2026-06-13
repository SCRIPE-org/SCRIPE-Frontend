import type { IEditionCategoryRepository } from "../../domain/interfaces/IEditionCategoryRepository";
import type { IEditionCategoryService } from "../../domain/interfaces/IEditionCategoryService";
import { EditionCategory } from "../../domain/entities/EditionCategory";
import { EditionCategoryMapper } from "../mappers/EditionCategoryMapper";
import type { PagedResult, PaginationParams } from "@modules/identity/core/domain/types";
import type {
  CreateEditionCategoryRequest,
  UpdateEditionCategoryRequest,
} from "../../domain/entities/EditionCategoryRequests";

export class EditionCategoryRepository implements IEditionCategoryRepository {
  constructor(private readonly service: IEditionCategoryService) {}

  async getAll(params: PaginationParams): Promise<PagedResult<EditionCategory>> {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((m) => EditionCategoryMapper.toEntity(m)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<EditionCategory> {
    const model = await this.service.getById(id);
    return EditionCategoryMapper.toEntity(model);
  }

  async create(data: CreateEditionCategoryRequest): Promise<string> {
    const json = EditionCategoryMapper.toCreateJson(data);
    const response = await this.service.create(json);
    return response.id;
  }

  async update(id: string, data: UpdateEditionCategoryRequest): Promise<void> {
    const json = EditionCategoryMapper.toUpdateJson(data);
    await this.service.update(id, json);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }
}
