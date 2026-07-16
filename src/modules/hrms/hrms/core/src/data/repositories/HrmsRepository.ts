/**
 * Hrms Repository Implementation
 *
 * Implements IHrmsRepository using the HrmsService.
 * Uses HrmsMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 */
import type { IHrmsRepository, HrmsListParams } from "../../domain/interfaces/IHrmsRepository";
import type { IHrmsService } from "../../domain/interfaces/IHrmsService";
import type { Hrms } from "../../domain/entities/Hrms";
import { HrmsMapper } from "../mappers/HrmsMapper";

export class HrmsRepository implements IHrmsRepository {
  constructor(private readonly service: IHrmsService) {}

  async getAll(params: HrmsListParams) {
    const result = await this.service.getAll(params);

    return {
      items: result.items.map((model) => HrmsMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<Hrms> {
    const model = await this.service.getById(id);
    return HrmsMapper.toEntity(model);
  }

  async create(data: Record<string, unknown>): Promise<string> {
    const response = await this.service.create(data);
    return response.id;
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.service.update(id, data);
  }

  async delete(id: string): Promise<void> {
    await this.service.delete(id);
  }
}
