/**
 * Documentation for module export
 */
export interface FacilityResourceProfilePickerOption {
  id: string;
  name: string;
}

/**
 * Documentation for module export
 */
export interface IFacilityResourceProfilePickerRepository {
  search(query: string): Promise<FacilityResourceProfilePickerOption[]>;
}
