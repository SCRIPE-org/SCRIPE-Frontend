import type { FacilityResourceProfileWrite } from "../../domain/entities/FacilityResourceProfile";
import type { IFacilityResourceProfileRepository } from "../../domain/interfaces/IFacilityResourceProfileRepository";
import type { IFacilityResourceProfileService } from "../../domain/interfaces/IFacilityResourceProfileService";

export class FacilityResourceProfileRepository implements IFacilityResourceProfileRepository {
  constructor(private readonly service: IFacilityResourceProfileService) {}

  getAll(params: { page: number; pageSize: number; search?: string; facilityId?: string }) {
    return this.service.getAll(params);
  }

  getById(id: string) {
    return this.service.getById(id);
  }

  async create(data: FacilityResourceProfileWrite): Promise<string> {
    return (await this.service.create(data)).id;
  }

  update(id: string, data: FacilityResourceProfileWrite): Promise<void> {
    const { facilityId: _immutableFacilityId, ...update } = data;
    return this.service.update(id, update);
  }
}
