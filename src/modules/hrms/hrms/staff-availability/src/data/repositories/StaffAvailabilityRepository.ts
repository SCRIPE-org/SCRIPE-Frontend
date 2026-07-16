/**
* StaffAvailability Repository Implementation
*
* Implements IStaffAvailabilityRepository using the StaffAvailabilityService.
* Uses StaffAvailabilityMapper to convert between Models (DTOs) and Entities.
*
* Clean Architecture Pattern:
* - Service handles API calls, returns Models
* - Repository uses Mapper to convert to Entities
* - ViewModel uses Repository, works with Entities
*/
import type { IStaffAvailabilityRepository, StaffAvailabilityListParams } from
"../../domain/interfaces/IStaffAvailabilityRepository";
import type { IStaffAvailabilityService } from "../../domain/interfaces/IStaffAvailabilityService";
import type { StaffAvailability } from "../../domain/entities/StaffAvailability";
import { StaffAvailabilityMapper } from "../mappers/StaffAvailabilityMapper";

export class StaffAvailabilityRepository implements IStaffAvailabilityRepository {
constructor(private readonly service: IStaffAvailabilityService) {}

async getAll(params: StaffAvailabilityListParams) {
const result = await this.service.getAll(params);

return {
items: result.items.map((model) => StaffAvailabilityMapper.toEntity(model)),
totalCount: result.totalCount,
page: result.page,
pageSize: result.pageSize,
totalPages: result.totalPages,
hasNextPage: result.hasNextPage,
hasPreviousPage: result.hasPreviousPage,
};
}

async getById(id: string): Promise<StaffAvailability> {
      const model = await this.service.getById(id);
      return StaffAvailabilityMapper.toEntity(model);
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