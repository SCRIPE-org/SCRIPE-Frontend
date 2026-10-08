import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { IApiService } from "@core/interfaces/api.interface";
import type {
  FacilityResourceProfile,
  FacilityResourceProfileWrite,
} from "../../domain/entities/FacilityResourceProfile";
import type {
  FacilityResourceProfilePage,
  IFacilityResourceProfileService,
} from "../../domain/interfaces/IFacilityResourceProfileService";
import { FACILITY_RESOURCE_PROFILE_ENDPOINTS } from "./facility-resource-profile.endpoints";

interface PageJson {
  items: FacilityResourceProfile[];
  totalCount: number;
}

/**
 * Documentation for module export
 */
export class FacilityResourceProfileService implements IFacilityResourceProfileService {
  constructor(private readonly api: IApiService) {}

  async getAll(params: {
    page: number;
    pageSize: number;
    search?: string;
    facilityId?: string;
  }): Promise<FacilityResourceProfilePage> {
    const response = await this.api.get<PageJson>(
      buildUrl(FACILITY_RESOURCE_PROFILE_ENDPOINTS.LIST, params)
    );
    return { items: response.items, totalCount: response.totalCount };
  }

  getById(id: string): Promise<FacilityResourceProfile> {
    return this.api.get(FACILITY_RESOURCE_PROFILE_ENDPOINTS.BY_ID(id));
  }

  create(data: FacilityResourceProfileWrite): Promise<{ id: string }> {
    return this.api.post(FACILITY_RESOURCE_PROFILE_ENDPOINTS.CREATE, data);
  }

  async update(
    id: string,
    data: Omit<FacilityResourceProfileWrite, "facilityId">
  ): Promise<void> {
    await this.api.put(FACILITY_RESOURCE_PROFILE_ENDPOINTS.UPDATE(id), data);
  }
}
