import type { ExternalLocation, CreateLocationPayload } from "../entities/ExternalLocation";

export interface IExternalLocationsService {
  getLocations(branchId?: string): Promise<ExternalLocation[]>;
  createLocation(payload: CreateLocationPayload): Promise<ExternalLocation>;
}
