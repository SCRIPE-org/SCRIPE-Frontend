import type { ExternalLocation, CreateLocationPayload } from "../entities/ExternalLocation";

export interface IExternalLocationsRepository {
  fetchLocations(branchId?: string): Promise<ExternalLocation[]>;
  createLocation(payload: CreateLocationPayload): Promise<ExternalLocation>;
}
