/**
* PartyOrganization Repository Implementation
*
* Implements IPartyOrganizationRepository using the PartyOrganizationService.
* Uses PartyOrganizationMapper to convert between Models (DTOs) and Entities.
*
* Clean Architecture Pattern:
* - Service handles API calls, returns Models
* - Repository uses Mapper to convert to Entities
* - ViewModel uses Repository, works with Entities
*/
import type { IPartyOrganizationRepository, PartyOrganizationListParams } from
"../../domain/interfaces/IPartyOrganizationRepository";
import type { IPartyOrganizationService } from "../../domain/interfaces/IPartyOrganizationService";
import type { PartyOrganization } from "../../domain/entities/PartyOrganization";
import { PartyOrganizationMapper } from "../mappers/PartyOrganizationMapper";

export class PartyOrganizationRepository implements IPartyOrganizationRepository {
constructor(private readonly service: IPartyOrganizationService) {}

async getAll(params: PartyOrganizationListParams) {
const result = await this.service.getAll(params);

return {
items: result.items.map((model) => PartyOrganizationMapper.toEntity(model)),
totalCount: result.totalCount,
page: result.page,
pageSize: result.pageSize,
totalPages: result.totalPages,
hasNextPage: result.hasNextPage,
hasPreviousPage: result.hasPreviousPage,
};
}

async getById(id: string): Promise<PartyOrganization> {
      const model = await this.service.getById(id);
      return PartyOrganizationMapper.toEntity(model);
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