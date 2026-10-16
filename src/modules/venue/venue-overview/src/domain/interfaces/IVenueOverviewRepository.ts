import type { VenueOverviewState } from "../entities/VenueOverview";

/**
 * Documentation for module export
 */
export interface IVenueOverviewRepository {
  getOverview(facilityId?: string, targetLocalDate?: string): Promise<VenueOverviewState>;
}
