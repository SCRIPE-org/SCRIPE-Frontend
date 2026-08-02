/**
 * PartyRole Repository Implementation
 *
 * Implements IPartyRoleRepository using the PartyRoleService.
 * Uses PartyRoleMapper to convert between Models (DTOs) and Entities.
 *
 * Clean Architecture Pattern:
 * - Service handles API calls, returns Models
 * - Repository uses Mapper to convert to Entities
 * - ViewModel uses Repository, works with Entities
 */
import type {
  IPartyRoleRepository,
  PartyRoleListParams,
} from "../../domain/interfaces/IPartyRoleRepository";
import type { IPartyRoleService } from "../../domain/interfaces/IPartyRoleService";
import type { PartyRole } from "../../domain/entities/PartyRole";
import { PartyRoleMapper } from "../mappers/PartyRoleMapper";

export class PartyRoleRepository implements IPartyRoleRepository {
  constructor(private readonly service: IPartyRoleService) {}

  async getAll(params: PartyRoleListParams) {
    const result = await this.service.getAll(params);

    return {
      items: result.items.map((model) => PartyRoleMapper.toEntity(model)),
      totalCount: result.totalCount,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasNextPage: result.hasNextPage,
      hasPreviousPage: result.hasPreviousPage,
    };
  }

  async getById(id: string): Promise<PartyRole> {
    const model = await this.service.getById(id);
    return PartyRoleMapper.toEntity(model);
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
