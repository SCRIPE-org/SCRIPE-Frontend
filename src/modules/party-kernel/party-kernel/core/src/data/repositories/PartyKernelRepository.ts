/**
 * PartyKernel Repository Implementation
 *
 * Implements IPartyKernelRepository using the PartyKernelService.
 * Uses PartyKernelMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 */
import type {
  IPartyKernelRepository,
  PartyKernelListParams,
} from "../../domain/interfaces/IPartyKernelRepository";
import type { IPartyKernelService } from "../../domain/interfaces/IPartyKernelService";
import type { PartyKernel } from "../../domain/entities/PartyKernel";
import { PartyKernelMapper } from "../mappers/PartyKernelMapper";

export class PartyKernelRepository implements IPartyKernelRepository {
  constructor(private readonly service: IPartyKernelService) {}

  async getAll(params: PartyKernelListParams) {
    const result = await this.service.getAll(params);

    return {
      items: result.items.map((model) => PartyKernelMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PartyKernel> {
    const model = await this.service.getById(id);
    return PartyKernelMapper.toEntity(model);
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
