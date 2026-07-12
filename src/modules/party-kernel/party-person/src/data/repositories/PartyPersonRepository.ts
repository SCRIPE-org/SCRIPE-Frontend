/**
* PartyPerson Repository Implementation
*
* Implements IPartyPersonRepository using the PartyPersonService.
* Uses PartyPersonMapper to convert between Models (DTOs) and Entities.
*
* Clean Architecture Pattern:
* - Service handles API calls, returns Models
* - Repository uses Mapper to convert to Entities
* - ViewModel uses Repository, works with Entities
*/
import type { IPartyPersonRepository, PartyPersonListParams } from
"../../domain/interfaces/IPartyPersonRepository";
import type { IPartyPersonService } from "../../domain/interfaces/IPartyPersonService";
import type { PartyPerson } from "../../domain/entities/PartyPerson";
import { PartyPersonMapper } from "../mappers/PartyPersonMapper";

export class PartyPersonRepository implements IPartyPersonRepository {
constructor(private readonly service: IPartyPersonService) {}

async getAll(params: PartyPersonListParams) {
const result = await this.service.getAll(params);

return {
items: result.items.map((model) => PartyPersonMapper.toEntity(model)),
totalCount: result.totalCount,
page: result.page,
pageSize: result.pageSize,
totalPages: result.totalPages,
hasNextPage: result.hasNextPage,
hasPreviousPage: result.hasPreviousPage,
};
}

async getById(id: string): Promise<PartyPerson> {
      const model = await this.service.getById(id);
      return PartyPersonMapper.toEntity(model);
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