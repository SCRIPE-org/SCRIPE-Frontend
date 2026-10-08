import type { VenueOverviewState } from "../../domain/entities/VenueOverview";

/**
 * VenueOverviewMapper
 */
export class VenueOverviewMapper {
  /**
   * toEntity
   */
  static toEntity(dto: any): VenueOverviewState {
    return dto as VenueOverviewState; // stub
  }
}
