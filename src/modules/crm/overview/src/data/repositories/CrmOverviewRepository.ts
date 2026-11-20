import type { OverviewEntity } from "../../domain/entities/OverviewEntity";
import type { ICrmOverviewRepository } from "../../domain/interfaces/ICrmOverviewRepository";
import type { ICrmOverviewService } from "../../domain/interfaces/ICrmOverviewService";
import { CrmOverviewMapper } from "../mappers/CrmOverviewMapper";

/**
 * Concrete repository mapping raw overview DTOs into `OverviewEntity`.
 */
export class CrmOverviewRepository implements ICrmOverviewRepository {
  constructor(private readonly service: ICrmOverviewService) {}

  /** Retrieves CRM Overview dashboard data mapped to `OverviewEntity`. */
  async getOverview(searchQuery?: string): Promise<OverviewEntity> {
    const dto = await this.service.getOverviewData(searchQuery);
    return CrmOverviewMapper.toEntity(dto);
  }
}
