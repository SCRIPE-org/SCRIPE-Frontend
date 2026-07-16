/**
* MergeCandidate Repository Implementation
*
* Implements IMergeCandidateRepository using the MergeCandidateService.
* Uses MergeCandidateMapper to convert between Models (DTOs) and Entities.
*
* Clean Architecture Pattern:
* - Service handles API calls, returns Models
* - Repository uses Mapper to convert to Entities
* - ViewModel uses Repository, works with Entities
*/
import type { IMergeCandidateRepository, MergeCandidateListParams } from
"../../domain/interfaces/IMergeCandidateRepository";
import type { IMergeCandidateService } from "../../domain/interfaces/IMergeCandidateService";
import type { MergeCandidate } from "../../domain/entities/MergeCandidate";
import { MergeCandidateMapper } from "../mappers/MergeCandidateMapper";

export class MergeCandidateRepository implements IMergeCandidateRepository {
constructor(private readonly service: IMergeCandidateService) {}

async getAll(params: MergeCandidateListParams) {
const result = await this.service.getAll(params);

return {
items: result.items.map((model) => MergeCandidateMapper.toEntity(model)),
totalCount: result.totalCount,
page: result.page,
pageSize: result.pageSize,
totalPages: result.totalPages,
hasNextPage: result.hasNextPage,
hasPreviousPage: result.hasPreviousPage,
};
}

async getById(id: string): Promise<MergeCandidate> {
      const model = await this.service.getById(id);
      return MergeCandidateMapper.toEntity(model);
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