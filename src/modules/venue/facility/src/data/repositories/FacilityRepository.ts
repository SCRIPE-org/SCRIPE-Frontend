import type {
  IFacilityRepository,
  FacilityListParams,
} from "../../domain/interfaces/IFacilityRepository";
import type { IFacilityService } from "../../domain/interfaces/IFacilityService";
import type { Facility } from "../../domain/entities/Facility";
import { FacilityMapper } from "../mappers/FacilityMapper";

/**
 * Documentation for module export
 */
export class FacilityRepository implements IFacilityRepository {
  constructor(private readonly service: IFacilityService) {}

  async getAll(params: FacilityListParams) {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((model) => FacilityMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<Facility> {
    const model = await this.service.getById(id);
    return FacilityMapper.toEntity(model);
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
