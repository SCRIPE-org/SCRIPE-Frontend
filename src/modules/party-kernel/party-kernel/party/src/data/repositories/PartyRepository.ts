/**
 * Party Repository Implementation
 *
 * Implements IPartyRepository using the PartyService.
 * Uses PartyMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 */
import type { IPartyRepository, PartyListParams } from "../../domain/interfaces/IPartyRepository";
import type { IPartyService } from "../../domain/interfaces/IPartyService";
import type { Party } from "../../domain/entities/Party";
import { PartyMapper } from "../mappers/PartyMapper";

/**
 * Documentation for module export
 */
export class PartyRepository implements IPartyRepository {
  constructor(private readonly service: IPartyService) {}

  async getAll(params: PartyListParams) {
    const result = await this.service.getAll(params);

    return {
      items: result.items.map((model) => PartyMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<Party> {
    const model = await this.service.getById(id);
    return PartyMapper.toEntity(model);
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
