/**
 * Site picker option — a flattened, display-ready shape (id + name) for the
 * Site `server-select` field on Venue Profile creation. Not the full Site
 * entity: OrganizationCore owns Sites, FacilityOperations (this module) only
 * needs enough to let a user pick one.
 */
export interface SitePickerOption {
  id: string;
  name: string;
}

/**
 * Read-only lookup against OrganizationCore's Sites list.
 *
 * VenueProfile.siteId is a cross-module id (no EF FK — see
 * FacilityOperations.Domain.Entities.VenueProfile), validated fail-closed
 * server-side via ISiteReader/IIdEncryptionService. This interface exists
 * purely to power the picker UI; it is intentionally NOT a full
 * IVenueProfileService-style CRUD surface.
 */
export interface ISitePickerService {
  /**
   * @param pageSize Defaults to the picker's own small page size (typeahead use). Callers
   * building a full id-to-name lookup map (e.g. the Venue & Site Setup list table's Site
   * column) pass a larger value with an empty query to fetch the tenant-scoped set in one call.
   */
  search(query: string, pageSize?: number): Promise<SitePickerOption[]>;
}
