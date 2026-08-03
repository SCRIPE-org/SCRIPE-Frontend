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
import { getAuthContainer } from "@modules/auth/di";
import { useAppStore } from "@core/store/useAppStore";
import { queryClient } from "@core/query-client";
import type { IApiService } from "@core/interfaces/api.interface";

// VenueProfile
import { VenueProfileService } from "./venue-profile/src/data/services/VenueProfileService";
import { VenueProfileRepository } from "./venue-profile/src/data/repositories/VenueProfileRepository";
import { SitePickerService } from "./venue-profile/src/data/services/SitePickerService";
import type { IVenueProfileService } from "./venue-profile/src/domain/interfaces/IVenueProfileService";
import type { IVenueProfileRepository } from "./venue-profile/src/domain/interfaces/IVenueProfileRepository";
import type { ISitePickerService } from "./venue-profile/src/domain/interfaces/ISitePickerService";

// Facility
import { FacilityService } from "./facility/src/data/services/FacilityService";
import { FacilityRepository } from "./facility/src/data/repositories/FacilityRepository";
import type { IFacilityService } from "./facility/src/domain/interfaces/IFacilityService";
import type { IFacilityRepository } from "./facility/src/domain/interfaces/IFacilityRepository";

// SchedulableResource
import { SchedulableResourceService } from "./schedulable-resource/src/data/services/SchedulableResourceService";
import { SchedulableResourceRepository } from "./schedulable-resource/src/data/repositories/SchedulableResourceRepository";
import { FacilityResourceProfilePickerService } from "./schedulable-resource/src/data/services/FacilityResourceProfilePickerService";
import type { ISchedulableResourceService } from "./schedulable-resource/src/domain/interfaces/ISchedulableResourceService";
import type { ISchedulableResourceRepository } from "./schedulable-resource/src/domain/interfaces/ISchedulableResourceRepository";
import type { IFacilityResourceProfilePickerService } from "./schedulable-resource/src/domain/interfaces/IFacilityResourceProfilePickerService";

interface VenueContainer {
  venueProfileRepository: IVenueProfileRepository;
  facilityRepository: IFacilityRepository;
  schedulableResourceRepository: ISchedulableResourceRepository;
  /** Site picker for the Venue Profile "Site" field — OrganizationCore is a different backend module. */
  sitePickerService: ISitePickerService;
  /** Facility Resource Profile picker for the Resource Builder form — no dedicated CRUD page exists yet. */
  facilityResourceProfilePickerService: IFacilityResourceProfilePickerService;
}

/**
 * Wire auth lifecycle handlers onto a module-scoped ApiService instance the
 * same way auth/di.ts wires them onto the shared base instance.
 *
 * getModuleApiService() returns the SHARED base instance whenever no
 * dedicated module env var is configured (today's monolith deployment), so
 * this is a harmless no-op re-wiring of the same object in that case. It
 * becomes load-bearing the moment a microservice deployment sets e.g.
 * NEXT_PUBLIC_FACILITYOPERATIONS_API_URL or
 * NEXT_PUBLIC_RESOURCESCHEDULINGBOOKING_API_URL: without it, a 401 on this
 * module's own axios instance never triggers a refresh or a forced logout —
 * it just fails silently, unlike every other authenticated request in the app.
 */
function wireModuleApiLifecycle(api: IApiService): void {
  api.setRefreshHandler(async () => {
    const { authRepository } = getAuthContainer();
    const result = await authRepository.refreshToken();
    if (result.kind === "err") {
      authRepository.clearTokens();
      return null;
    }
    return result.value.accessToken;
  });

  api.setLogoutHandler(() => {
    useAppStore.getState().logout();
    queryClient.clear();
  });
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
  // Sites (for the Venue Profile picker) live in OrganizationCore — a third,
  // separate backend module this workspace only ever reads from.
  const organizationCoreApi = getModuleApiService("ORGANIZATIONCORE");

  wireModuleApiLifecycle(facilityOperationsApi);
  wireModuleApiLifecycle(resourceSchedulingBookingApi);
  wireModuleApiLifecycle(organizationCoreApi);

  const venueProfileService: IVenueProfileService = new VenueProfileService(facilityOperationsApi);
  const facilityService: IFacilityService = new FacilityService(facilityOperationsApi);
  const schedulableResourceService: ISchedulableResourceService = new SchedulableResourceService(
    resourceSchedulingBookingApi
  );

  container = {
    venueProfileRepository: new VenueProfileRepository(venueProfileService),
    facilityRepository: new FacilityRepository(facilityService),
    schedulableResourceRepository: new SchedulableResourceRepository(schedulableResourceService),
    sitePickerService: new SitePickerService(organizationCoreApi),
    facilityResourceProfilePickerService: new FacilityResourceProfilePickerService(facilityOperationsApi),
  };

  return container;
}
