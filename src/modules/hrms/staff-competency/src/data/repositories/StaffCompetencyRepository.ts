/**
* StaffCompetency Repository Implementation
*
* Implements IStaffCompetencyRepository using the StaffCompetencyService.
* Uses StaffCompetencyMapper to convert between Models (DTOs) and Entities.
*
* Clean Architecture Pattern:
* - Service handles API calls, returns Models
* - Repository uses Mapper to convert to Entities
* - ViewModel uses Repository, works with Entities
*/
import type { IStaffCompetencyRepository, StaffCompetencyListParams } from
"../../domain/interfaces/IStaffCompetencyRepository";
import type { IStaffCompetencyService } from "../../domain/interfaces/IStaffCompetencyService";
import type { StaffCompetency } from "../../domain/entities/StaffCompetency";
import { StaffCompetencyMapper } from "../mappers/StaffCompetencyMapper";

export class StaffCompetencyRepository implements IStaffCompetencyRepository {
constructor(private readonly service: IStaffCompetencyService) {}

async getAll(params: StaffCompetencyListParams) {
const result = await this.service.getAll(params);

return {
items: result.items.map((model) => StaffCompetencyMapper.toEntity(model)),
totalCount: result.totalCount,
page: result.page,
pageSize: result.pageSize,
totalPages: result.totalPages,
hasNextPage: result.hasNextPage,
hasPreviousPage: result.hasPreviousPage,
};
}

async getById(id: string): Promise<StaffCompetency> {
      const model = await this.service.getById(id);
      return StaffCompetencyMapper.toEntity(model);
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