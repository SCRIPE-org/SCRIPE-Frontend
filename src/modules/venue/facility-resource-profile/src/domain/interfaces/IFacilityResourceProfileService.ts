import type {
  FacilityResourceProfile,
  FacilityResourceProfileWrite,
} from "../entities/FacilityResourceProfile";

export interface FacilityResourceProfilePage {
  items: FacilityResourceProfile[];
  totalCount: number;
}

export interface IFacilityResourceProfileService {
  getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    facilityId?: string;
  }): Promise<FacilityResourceProfilePage>;
  getById(id: string): Promise<FacilityResourceProfile>;
  create(data: FacilityResourceProfileWrite): Promise<{ id: string }>;
  update(id: string, data: Omit<FacilityResourceProfileWrite, "facilityId">): Promise<void>;
}
