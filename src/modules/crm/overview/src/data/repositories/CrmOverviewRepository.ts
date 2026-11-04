import type { ICrmOverviewRepository } from "../../domain/interfaces/ICrmOverviewRepository";
import type { ICrmOverviewService } from "../../domain/interfaces/ICrmOverviewService";
import type { CrmOverviewData, CrmPipelineReport } from "../../domain/models/crm-overview.types";

export class CrmOverviewRepository implements ICrmOverviewRepository {
  constructor(private readonly service: ICrmOverviewService) {}

  async getOverview(searchQuery?: string): Promise<CrmOverviewData> {
    return this.service.getOverviewData(searchQuery);
  }

  async getPipelineReport(currencyCode?: string): Promise<CrmPipelineReport> {
    return this.service.getPipelineReport(currencyCode);
  }
}
