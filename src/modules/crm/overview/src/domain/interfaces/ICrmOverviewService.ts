import type { CrmOverviewCompositeDto } from "../../data/models/OverviewModel";

/**
 * Service interface for fetching CRM Overview composite data.
 */
export interface ICrmOverviewService {
  /** Fetches parallel default pipeline, recent opportunities, and pipeline report payloads. */
  getOverviewData(searchQuery?: string): Promise<CrmOverviewCompositeDto>;
}
