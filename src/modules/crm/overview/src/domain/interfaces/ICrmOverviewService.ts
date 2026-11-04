import type { CrmOverviewData, CrmPipelineReport } from "../models/crm-overview.types";

export interface ICrmOverviewService {
  getOverviewData(searchQuery?: string): Promise<CrmOverviewData>;
  getPipelineReport(currencyCode?: string): Promise<CrmPipelineReport>;
}
