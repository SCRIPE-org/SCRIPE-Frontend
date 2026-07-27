/**
 * Venue Workspace DI Container
 *
 * Provides dependency injection for the single "venue" workspace, spanning the
 * FacilityOperations and ResourceSchedulingBooking backend modules — one commercial
 * product ("SCRIPE Venue"), one workspace, one container.
 *
 * Clean Architecture Pattern:
 * - Services wrap IApiService (API calls only)
 * - Repositories use Services and map Models -> Entities
 * - ViewModels use Repositories
 */
import { getModuleApiService } from "@/core/services/api-factory";

// VenueProfile
import { VenueProfileService } from "./venue-profile/src/data/services/VenueProfileService";
import { VenueProfileRepository } from "./venue-profile/src/data/repositories/VenueProfileRepository";
import type { IVenueProfileService } from "./venue-profile/src/domain/interfaces/IVenueProfileService";
import type { IVenueProfileRepository } from "./venue-profile/src/domain/interfaces/IVenueProfileRepository";

// Facility
import { FacilityService } from "./facility/src/data/services/FacilityService";
import { FacilityRepository } from "./facility/src/data/repositories/FacilityRepository";
import type { IFacilityService } from "./facility/src/domain/interfaces/IFacilityService";
import type { IFacilityRepository } from "./facility/src/domain/interfaces/IFacilityRepository";

// SchedulableResource
import { SchedulableResourceService } from "./schedulable-resource/src/data/services/SchedulableResourceService";
import { SchedulableResourceRepository } from "./schedulable-resource/src/data/repositories/SchedulableResourceRepository";
import type { ISchedulableResourceService } from "./schedulable-resource/src/domain/interfaces/ISchedulableResourceService";
import type { ISchedulableResourceRepository } from "./schedulable-resource/src/domain/interfaces/ISchedulableResourceRepository";

interface VenueContainer {
  venueProfileRepository: IVenueProfileRepository;
  facilityRepository: IFacilityRepository;
  schedulableResourceRepository: ISchedulableResourceRepository;
}

let container: VenueContainer | null = null;

export function getVenueContainer(): VenueContainer {
  if (container) {
    return container;
  }

  // FacilityOperations and ResourceSchedulingBooking are separate backend modules but
  // share one frontend workspace. Each resolves its own module API base URL — falls
  // back to the shared base URL in monolith deployment (no dedicated env var set).
  const facilityOperationsApi = getModuleApiService("FACILITYOPERATIONS");
  const resourceSchedulingBookingApi = getModuleApiService("RESOURCESCHEDULINGBOOKING");

  const venueProfileService: IVenueProfileService = new VenueProfileService(facilityOperationsApi);
  const facilityService: IFacilityService = new FacilityService(facilityOperationsApi);
  const schedulableResourceService: ISchedulableResourceService = new SchedulableResourceService(
    resourceSchedulingBookingApi
  );

  container = {
    venueProfileRepository: new VenueProfileRepository(venueProfileService),
    facilityRepository: new FacilityRepository(facilityService),
    schedulableResourceRepository: new SchedulableResourceRepository(schedulableResourceService),
  };

  return container;
}
