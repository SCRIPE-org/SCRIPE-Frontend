/**
 * CustomField Repository Implementation
 *
 * Implements ICustomFieldRepository using the CustomFieldService.
 * Uses CustomFieldMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 */
import type {
  ICustomFieldRepository,
  CustomFieldListParams,
} from "../../domain/interfaces/ICustomFieldRepository";
import type { ICustomFieldService } from "../../domain/interfaces/ICustomFieldService";
import type { CustomField } from "../../domain/entities/CustomField";
import { CustomFieldMapper } from "../mappers/CustomFieldMapper";

export class CustomFieldRepository implements ICustomFieldRepository {
  constructor(private readonly service: ICustomFieldService) {}

  async getAll(params: CustomFieldListParams) {
    const result = await this.service.getAll(params);

    return {
      items: result.items.map((model) => CustomFieldMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<CustomField> {
    const model = await this.service.getById(id);
    return CustomFieldMapper.toEntity(model);
  }

  async getEntityTypes() {
    return this.service.getEntityTypes();
  }

  async create(data: Record<string, unknown>): Promise<string> {
    const response = await this.service.create(data);
    return response.id;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.service.update(id, data);
  }

  async delete(id: string, force?: boolean): Promise<void> {
    await this.service.delete(id, force);
  }

  async getHistory(id: string, page: number, pageSize: number) {
    return this.service.getHistory(id, page, pageSize);
  }

  async getUsage(id: string) {
    return this.service.getUsage(id);
  }
}
