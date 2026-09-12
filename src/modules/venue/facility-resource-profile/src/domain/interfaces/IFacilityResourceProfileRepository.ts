import type {
  FacilityResourceProfile,
  FacilityResourceProfileWrite,
} from "../entities/FacilityResourceProfile";

export interface IFacilityResourceProfileRepository {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    facilityId?: string;
  }): Promise<{ items: FacilityResourceProfile[]; totalCount: number }>;
  getById(id: string): Promise<FacilityResourceProfile>;
  create(data: FacilityResourceProfileWrite): Promise<string>;
  update(id: string, data: FacilityResourceProfileWrite): Promise<void>;
}
