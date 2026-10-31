import type { CrmOverviewData } from "../models/crm-overview.types";

export interface ICrmOverviewService {
  getOverviewData(searchQuery?: string): Promise<CrmOverviewData>;
}
