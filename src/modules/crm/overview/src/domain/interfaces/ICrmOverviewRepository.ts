import type { CrmOverviewData } from "../models/crm-overview.types";

export interface ICrmOverviewRepository {
  getOverview(searchQuery?: string): Promise<CrmOverviewData>;
}
