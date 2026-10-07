import type { IFacilityResourceProfilePickerRepository, FacilityResourceProfilePickerOption } from "../../domain/interfaces/IFacilityResourceProfilePickerRepository";
import type { IFacilityResourceProfilePickerService } from "../../domain/interfaces/IFacilityResourceProfilePickerService";

export class FacilityResourceProfilePickerRepository implements IFacilityResourceProfilePickerRepository {
  constructor(private readonly service: IFacilityResourceProfilePickerService) {}

  async search(query: string): Promise<FacilityResourceProfilePickerOption[]> {
    return this.service.search(query);
  }
}
