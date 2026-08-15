import type {
  IVenueProfileRepository,
  VenueProfileListParams,
} from "../../domain/interfaces/IVenueProfileRepository";
import type { IVenueProfileService } from "../../domain/interfaces/IVenueProfileService";
import type { VenueProfile } from "../../domain/entities/VenueProfile";
import { VenueProfileMapper } from "../mappers/VenueProfileMapper";

export class VenueProfileRepository implements IVenueProfileRepository {
  constructor(private readonly service: IVenueProfileService) {}

  async getAll(params: VenueProfileListParams) {
    const result = await this.service.getAll(params);
    return {
      items: result.items.map((model) => VenueProfileMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<VenueProfile> {
    const model = await this.service.getById(id);
    return VenueProfileMapper.toEntity(model);
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
