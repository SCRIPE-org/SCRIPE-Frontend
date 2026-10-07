import type { VenueOverviewState } from "../entities/VenueOverview";

export interface IVenueOverviewRepository {
  getOverview(facilityId?: string, targetLocalDate?: string): Promise<VenueOverviewState>;
}
