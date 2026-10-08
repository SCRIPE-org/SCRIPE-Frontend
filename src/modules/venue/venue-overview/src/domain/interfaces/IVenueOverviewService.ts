import type { VenueOverviewState } from "../entities/VenueOverview";

/**
 * Documentation for module export
 */
export interface IVenueOverviewService {
  getOverview(facilityId?: string, targetLocalDate?: string): Promise<VenueOverviewState>;
}
