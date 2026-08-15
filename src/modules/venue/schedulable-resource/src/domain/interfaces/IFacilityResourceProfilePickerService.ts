/**
 * Facility Resource Profile picker option — a flattened, display-ready shape
 * (id + name) for the "Facility Resource Profile" `server-select` field on
 * Schedulable Resource creation.
 */
export interface FacilityResourceProfilePickerOption {
  id: string;
  name: string;
}

/**
 * Read-only lookup against FacilityOperations' FacilityResourceProfiles list.
 *
 * SchedulableResource.facilityResourceProfileId is a cross-module id (no EF
 * FK — see ResourceSchedulingBooking.Domain.Entities.SchedulableResource),
 * decrypted fail-closed server-side on create (see
 * CreateSchedulableResourceCommandHandler). There is no dedicated
 * FacilityResourceProfile CRUD page in the frontend yet, so this stays a thin
 * picker lookup rather than a full repository.
 */
export interface IFacilityResourceProfilePickerService {
  search(query: string): Promise<FacilityResourceProfilePickerOption[]>;
}
