import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type {
  IFacilityResourceProfilePickerService,
  FacilityResourceProfilePickerOption,
} from "../../domain/interfaces/IFacilityResourceProfilePickerService";
import { FACILITY_RESOURCE_PROFILE_PICKER_ENDPOINTS } from "./facility-resource-profile-picker.endpoints";

interface FacilityResourceProfileListResponseJson {
  items: Array<{
    id: string;
    facilityId: string;
    code: string;
    name: string;
    description?: string | null;
    resourceKindCode: string;
  }>;
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const PICKER_PAGE_SIZE = 20;

/**
 * Read-only client for FacilityOperations' `GET /facility-resource-profiles`
 * list. The `id` this returns is already the SecureIdMapper-encrypted value
 * CreateSchedulableResourceCommandHandler decrypts back from
 * facilityResourceProfileId — no extra transformation needed to round-trip a
 * selection into the create payload.
 */
export class FacilityResourceProfilePickerService implements IFacilityResourceProfilePickerService {
  constructor(private readonly api: IApiService) {}

  async search(query: string): Promise<FacilityResourceProfilePickerOption[]> {
    const url = buildUrl(FACILITY_RESOURCE_PROFILE_PICKER_ENDPOINTS.LIST, {
      page: 1,
      pageSize: PICKER_PAGE_SIZE,
      search: query || undefined,
    });
    const response = await this.api.get<FacilityResourceProfileListResponseJson>(url);
    return response.items.map((item) => ({
      id: item.id,
      name: item.code ? `${item.name} (${item.code})` : item.name,
    }));
  }
}
