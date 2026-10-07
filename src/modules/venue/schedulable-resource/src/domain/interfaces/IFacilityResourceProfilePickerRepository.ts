export interface FacilityResourceProfilePickerOption {
  id: string;
  name: string;
}

export interface IFacilityResourceProfilePickerRepository {
  search(query: string): Promise<FacilityResourceProfilePickerOption[]>;
}
