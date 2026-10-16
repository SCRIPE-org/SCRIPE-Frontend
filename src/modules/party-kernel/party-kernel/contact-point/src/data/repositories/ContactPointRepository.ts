/**
 * ContactPoint Repository Implementation
 *
 * Implements IContactPointRepository using the ContactPointService.
 * Uses ContactPointMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 */
import type {
  IContactPointRepository,
  ContactPointListParams,
} from "../../domain/interfaces/IContactPointRepository";
import type { IContactPointService } from "../../domain/interfaces/IContactPointService";
import type { ContactPoint } from "../../domain/entities/ContactPoint";
import { ContactPointMapper } from "../mappers/ContactPointMapper";

/**
 * Documentation for module export
 */
export class ContactPointRepository implements IContactPointRepository {
  constructor(private readonly service: IContactPointService) {}

  async getAll(params: ContactPointListParams) {
    const result = await this.service.getAll(params);

    return {
      items: result.items.map((model) => ContactPointMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<ContactPoint> {
    const model = await this.service.getById(id);
    return ContactPointMapper.toEntity(model);
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
