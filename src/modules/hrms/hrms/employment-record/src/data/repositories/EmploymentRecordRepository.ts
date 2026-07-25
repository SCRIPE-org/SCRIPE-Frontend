/**
 * EmploymentRecord Repository Implementation
 *
 * Implements IEmploymentRecordRepository using the EmploymentRecordService.
 * Uses EmploymentRecordMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 */
import type {
  IEmploymentRecordRepository,
  EmploymentRecordListParams,
} from "../../domain/interfaces/IEmploymentRecordRepository";
import type { IEmploymentRecordService } from "../../domain/interfaces/IEmploymentRecordService";
import type { EmploymentRecord } from "../../domain/entities/EmploymentRecord";
import { EmploymentRecordMapper } from "../mappers/EmploymentRecordMapper";

export class EmploymentRecordRepository implements IEmploymentRecordRepository {
  constructor(private readonly service: IEmploymentRecordService) {}

  async getAll(params: EmploymentRecordListParams) {
    const result = await this.service.getAll(params);

    return {
      items: result.items.map((model) => EmploymentRecordMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<EmploymentRecord> {
    const model = await this.service.getById(id);
    return EmploymentRecordMapper.toEntity(model);
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
