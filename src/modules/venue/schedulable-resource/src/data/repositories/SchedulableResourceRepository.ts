import type {
  ISchedulableResourceRepository,
  SchedulableResourceListParams,
} from "../../domain/interfaces/ISchedulableResourceRepository";
import type { ISchedulableResourceService } from "../../domain/interfaces/ISchedulableResourceService";
import type {
  SchedulableResource,
  PublicationChecklistReport,
} from "../../domain/entities/SchedulableResource";
import { SchedulableResourceMapper } from "../mappers/SchedulableResourceMapper";

/**
 * Documentation for module export
 */
export class SchedulableResourceRepository implements ISchedulableResourceRepository {
  constructor(private readonly service: ISchedulableResourceService) {}

  async getAll(params: SchedulableResourceListParams) {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((model) => SchedulableResourceMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<SchedulableResource> {
    const model = await this.service.getById(id);
    return SchedulableResourceMapper.toEntity(model);
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

  async getPublicationChecklist(id: string): Promise<PublicationChecklistReport> {
    return this.service.getPublicationChecklist(id);
  }

  async publish(id: string): Promise<void> {
    await this.service.publish(id);
  }
}
