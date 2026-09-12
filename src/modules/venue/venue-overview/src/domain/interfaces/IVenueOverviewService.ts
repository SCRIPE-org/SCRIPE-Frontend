import type { VenueOverviewState } from "../entities/VenueOverview";

export interface IVenueOverviewService {
  getOverview(facilityId?: string, targetLocalDate?: string): Promise<VenueOverviewState>;
}
