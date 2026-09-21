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

// Facility Resource Profile
import { FacilityResourceProfileService } from "./facility-resource-profile/src/data/services/FacilityResourceProfileService";
import { FacilityResourceProfileRepository } from "./facility-resource-profile/src/data/repositories/FacilityResourceProfileRepository";
import type { IFacilityResourceProfileService } from "./facility-resource-profile/src/domain/interfaces/IFacilityResourceProfileService";
import type { IFacilityResourceProfileRepository } from "./facility-resource-profile/src/domain/interfaces/IFacilityResourceProfileRepository";

// SchedulableResource
import { SchedulableResourceService } from "./schedulable-resource/src/data/services/SchedulableResourceService";
import { SchedulableResourceRepository } from "./schedulable-resource/src/data/repositories/SchedulableResourceRepository";
import { FacilityResourceProfilePickerService } from "./schedulable-resource/src/data/services/FacilityResourceProfilePickerService";
import type { ISchedulableResourceService } from "./schedulable-resource/src/domain/interfaces/ISchedulableResourceService";
import type { ISchedulableResourceRepository } from "./schedulable-resource/src/domain/interfaces/ISchedulableResourceRepository";
import type { IFacilityResourceProfilePickerService } from "./schedulable-resource/src/domain/interfaces/IFacilityResourceProfilePickerService";

// Availability
import { AvailabilityService } from "./availability/src/data/services/AvailabilityService";
import { AvailabilityRepository } from "./availability/src/data/repositories/AvailabilityRepository";
import type { IAvailabilityService } from "./availability/src/domain/interfaces/IAvailabilityService";
import type { IAvailabilityRepository } from "./availability/src/domain/interfaces/IAvailabilityRepository";

// Booking Operator Workspace
import { BookingService } from "./booking/src/data/services/BookingService";
import { BookingRepository } from "./booking/src/data/repositories/BookingRepository";
import { CustomerPickerService } from "./booking/src/data/services/CustomerPickerService";
import { CustomerRepository } from "./booking/src/data/repositories/CustomerRepository";
import type { IBookingService } from "./booking/src/domain/interfaces/IBookingService";
import type { IBookingRepository } from "./booking/src/domain/interfaces/IBookingRepository";
import type { ICustomerPickerService } from "./booking/src/domain/interfaces/ICustomerPickerService";
import type { ICustomerRepository } from "./booking/src/domain/interfaces/ICustomerRepository";

// Operations Calendar
import { OperationsCalendarService } from "./operations-calendar/src/data/services/OperationsCalendarService";
import { OperationsCalendarRepository } from "./operations-calendar/src/data/repositories/OperationsCalendarRepository";
import type { IOperationsCalendarService } from "./operations-calendar/src/domain/interfaces/IOperationsCalendarService";
import type { IOperationsCalendarRepository } from "./operations-calendar/src/domain/interfaces/IOperationsCalendarRepository";

// Booking 360
import { Booking360Service } from "./booking-360/src/data/services/Booking360Service";
import { Booking360Repository } from "./booking-360/src/data/repositories/Booking360Repository";
import type { IBooking360Service } from "./booking-360/src/domain/interfaces/IBooking360Service";
import type { IBooking360Repository } from "./booking-360/src/domain/interfaces/IBooking360Repository";

import { CommercialPricingService } from "./commercial/src/data/services/CommercialPricingService";
import { CommercialPricingRepository } from "./commercial/src/data/repositories/CommercialPricingRepository";
import type { ICommercialPricingRepository } from "./commercial/src/domain/interfaces/ICommercialPricingRepository";

import { MoneyService } from "./money/src/data/services/MoneyService";
import { MoneyRepository } from "./money/src/data/repositories/MoneyRepository";
import type { IMoneyService } from "./money/src/domain/interfaces/IMoneyService";
import type { IMoneyRepository } from "./money/src/domain/interfaces/IMoneyRepository";

import { VenueAttentionService } from "./attention-center/src/data/services/VenueAttentionService";
import { VenueAttentionRepository } from "./attention-center/src/data/repositories/VenueAttentionRepository";
import type { IVenueAttentionService } from "./attention-center/src/domain/interfaces/IVenueAttentionService";
import type { IVenueAttentionRepository } from "./attention-center/src/domain/interfaces/IVenueAttentionRepository";

import { VenueOverviewService } from "./venue-overview/src/data/services/VenueOverviewService";
import type { IVenueOverviewService } from "./venue-overview/src/domain/interfaces/IVenueOverviewService";

interface VenueContainer {
  venueProfileRepository: IVenueProfileRepository;
  facilityRepository: IFacilityRepository;
  facilityResourceProfileRepository: IFacilityResourceProfileRepository;
  schedulableResourceRepository: ISchedulableResourceRepository;
  availabilityRepository: IAvailabilityRepository;
  bookingRepository: IBookingRepository;
  customerRepository: ICustomerRepository;
  operationsCalendarRepository: IOperationsCalendarRepository;
  booking360Repository: IBooking360Repository;
  commercialPricingRepository: ICommercialPricingRepository;
  moneyRepository: IMoneyRepository;
  venueAttentionRepository: IVenueAttentionRepository;
  venueOverviewService: IVenueOverviewService;
  /** Site picker for the Venue Profile "Site" field — OrganizationCore is a different backend module. */
  sitePickerService: ISitePickerService;
  /** Lightweight picker retained for the Resource Builder form. */
  facilityResourceProfilePickerService: IFacilityResourceProfilePickerService;
}

/**
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
  const partyKernelApi = getModuleApiService("PARTYKERNEL");
  const catalogPricingApi = getModuleApiService("CATALOGPRICING");
  const financeApi = getModuleApiService("FINANCE");

  wireModuleApiLifecycle(facilityOperationsApi);
  wireModuleApiLifecycle(resourceSchedulingBookingApi);
  wireModuleApiLifecycle(organizationCoreApi);
  wireModuleApiLifecycle(partyKernelApi);
  wireModuleApiLifecycle(catalogPricingApi);
  wireModuleApiLifecycle(financeApi);

  const venueProfileService: IVenueProfileService = new VenueProfileService(facilityOperationsApi);
  const facilityService: IFacilityService = new FacilityService(facilityOperationsApi);
  const facilityResourceProfileService: IFacilityResourceProfileService =
    new FacilityResourceProfileService(facilityOperationsApi);
  const schedulableResourceService: ISchedulableResourceService = new SchedulableResourceService(
    resourceSchedulingBookingApi
  );
  const availabilityService: IAvailabilityService = new AvailabilityService(
    resourceSchedulingBookingApi
  );
  const bookingService: IBookingService = new BookingService(resourceSchedulingBookingApi);
  const customerPickerService: ICustomerPickerService = new CustomerPickerService(partyKernelApi);
  const operationsCalendarService: IOperationsCalendarService = new OperationsCalendarService(
    resourceSchedulingBookingApi
  );
  const booking360Service: IBooking360Service = new Booking360Service(resourceSchedulingBookingApi);
  const venueAttentionService: IVenueAttentionService = new VenueAttentionService(resourceSchedulingBookingApi);
  const commercialPricingService = new CommercialPricingService(catalogPricingApi);
  const moneyService: IMoneyService = new MoneyService(financeApi);

  container = {
    venueProfileRepository: new VenueProfileRepository(venueProfileService),
    facilityRepository: new FacilityRepository(facilityService),
    facilityResourceProfileRepository: new FacilityResourceProfileRepository(
      facilityResourceProfileService
    ),
    schedulableResourceRepository: new SchedulableResourceRepository(schedulableResourceService),
    availabilityRepository: new AvailabilityRepository(availabilityService),
    bookingRepository: new BookingRepository(bookingService),
    customerRepository: new CustomerRepository(customerPickerService),
    operationsCalendarRepository: new OperationsCalendarRepository(operationsCalendarService),
    booking360Repository: new Booking360Repository(booking360Service),
    commercialPricingRepository: new CommercialPricingRepository(commercialPricingService),
    moneyRepository: new MoneyRepository(moneyService),
    venueAttentionRepository: new VenueAttentionRepository(venueAttentionService),
    venueOverviewService: new VenueOverviewService(
      new OperationsCalendarRepository(operationsCalendarService),
      new SchedulableResourceRepository(schedulableResourceService),
      new FacilityResourceProfileRepository(facilityResourceProfileService),
      new FacilityRepository(facilityService),
      new CustomerRepository(customerPickerService)
    ),
    sitePickerService: new SitePickerService(organizationCoreApi),
    facilityResourceProfilePickerService: new FacilityResourceProfilePickerService(facilityOperationsApi),
  };

  return container;
}
