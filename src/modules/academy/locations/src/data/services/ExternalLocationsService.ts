import type { IApiService } from "@core/interfaces/api.interface";
import type { IExternalLocationsService } from "../../domain/interfaces/IExternalLocationsService";
import type { ExternalLocation, CreateLocationPayload } from "../../domain/entities/ExternalLocation";
import { EXTERNAL_LOCATIONS_ENDPOINTS } from "./external-locations.endpoints";

export class ExternalLocationsService implements IExternalLocationsService {
  constructor(private readonly api: IApiService) {}

  async getLocations(branchId?: string): Promise<ExternalLocation[]> {
    const url = EXTERNAL_LOCATIONS_ENDPOINTS.LIST(branchId);
    return await this.api.get<ExternalLocation[]>(url);
  }

  async createLocation(payload: CreateLocationPayload): Promise<ExternalLocation> {
    const url = EXTERNAL_LOCATIONS_ENDPOINTS.CREATE();
    return await this.api.post<ExternalLocation>(url, payload);
  }
}
