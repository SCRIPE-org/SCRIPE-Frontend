import type { CrmReportEntity } from "../../domain/entities/CrmReportEntity";
import type { ICrmReportsRepository } from "../../domain/interfaces/ICrmReportsRepository";
import type { ICrmReportsService } from "../../domain/interfaces/ICrmReportsService";
import { CrmReportsMapper } from "../mappers/CrmReportsMapper";

/** Repository converting CRM reports DTOs into `CrmReportEntity` domain instances. */
export class CrmReportsRepository implements ICrmReportsRepository {
  constructor(private readonly service: ICrmReportsService) {}

  /** Loads and maps the CRM pipeline & funnel report. */
  async getPipelineReport(currencyCode?: string): Promise<CrmReportEntity> {
    const dto = await this.service.getPipelineReport(currencyCode);
    return CrmReportsMapper.toEntity(dto);
  }
}
