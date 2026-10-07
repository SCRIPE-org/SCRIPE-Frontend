import type { IVenueOverviewRepository } from "../../domain/interfaces/IVenueOverviewRepository";
import type { IVenueOverviewService } from "../../domain/interfaces/IVenueOverviewService";
import type { VenueOverviewState } from "../../domain/entities/VenueOverview";

export class VenueOverviewRepository implements IVenueOverviewRepository {
  constructor(private readonly service: IVenueOverviewService) {}

  async getOverview(facilityId?: string, targetLocalDate?: string): Promise<VenueOverviewState> {
    return this.service.getOverview(facilityId, targetLocalDate);
  }
}
