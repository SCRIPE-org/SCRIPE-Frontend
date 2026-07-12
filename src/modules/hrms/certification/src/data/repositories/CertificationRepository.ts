/**
* Certification Repository Implementation
*
* Implements ICertificationRepository using the CertificationService.
* Uses CertificationMapper to convert between Models (DTOs) and Entities.
*
* Clean Architecture Pattern:
* - Service handles API calls, returns Models
* - Repository uses Mapper to convert to Entities
* - ViewModel uses Repository, works with Entities
*/
import type { ICertificationRepository, CertificationListParams } from
"../../domain/interfaces/ICertificationRepository";
import type { ICertificationService } from "../../domain/interfaces/ICertificationService";
import type { Certification } from "../../domain/entities/Certification";
import { CertificationMapper } from "../mappers/CertificationMapper";

export class CertificationRepository implements ICertificationRepository {
constructor(private readonly service: ICertificationService) {}

async getAll(params: CertificationListParams) {
const result = await this.service.getAll(params);

return {
items: result.items.map((model) => CertificationMapper.toEntity(model)),
totalCount: result.totalCount,
page: result.page,
pageSize: result.pageSize,
totalPages: result.totalPages,
hasNextPage: result.hasNextPage,
hasPreviousPage: result.hasPreviousPage,
};
}

async getById(id: string): Promise<Certification> {
      const model = await this.service.getById(id);
      return CertificationMapper.toEntity(model);
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