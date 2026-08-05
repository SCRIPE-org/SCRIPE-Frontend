import type { IApiService } from "@core/interfaces/api.interface";
import { buildUrl } from "@/core/config/api-endpoints/_shared";
import type { ISitePickerService, SitePickerOption } from "../../domain/interfaces/ISitePickerService";
import { SITE_PICKER_ENDPOINTS } from "./site-picker.endpoints";

interface SiteListResponseJson {
  items: Array<{
    id: string;
    name: string;
    address?: string | null;
    timeZone?: string | null;
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
 * Read-only client for OrganizationCore's `GET /sites` list.
 *
 * Sites live in a different backend module (OrganizationCore) than
 * VenueProfile (FacilityOperations). The `id` this returns is already the
 * SecureIdMapper-encrypted value the backend expects back on
 * CreateVenueProfileCommand.SiteId (decrypted fail-closed via ISiteReader) —
 * no extra transformation needed to round-trip a selection into the create
 * payload.
 */
export class SitePickerService implements ISitePickerService {
  constructor(private readonly api: IApiService) {}

  async search(query: string, pageSize: number = PICKER_PAGE_SIZE): Promise<SitePickerOption[]> {
    const url = buildUrl(SITE_PICKER_ENDPOINTS.LIST, {
      page: 1,
      pageSize,
      search: query || undefined,
    });
    const response = await this.api.get<SiteListResponseJson>(url);
    return response.items.map((item) => ({ id: item.id, name: item.name }));
  }
}
