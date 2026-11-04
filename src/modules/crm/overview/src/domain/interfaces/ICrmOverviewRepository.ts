import type { CrmOverviewData, CrmPipelineReport } from "../models/crm-overview.types";

export interface ICrmOverviewRepository {
  getOverview(searchQuery?: string): Promise<CrmOverviewData>;
  getPipelineReport(currencyCode?: string): Promise<CrmPipelineReport>;
}
