import type { IExternalLocationsRepository } from "../../domain/interfaces/IExternalLocationsRepository";
import type { IExternalLocationsService } from "../../domain/interfaces/IExternalLocationsService";
import type { ExternalLocation, CreateLocationPayload } from "../../domain/entities/ExternalLocation";

export class ExternalLocationsRepository implements IExternalLocationsRepository {
  constructor(private readonly service: IExternalLocationsService) {}

  async fetchLocations(branchId?: string): Promise<ExternalLocation[]> {
    return await this.service.getLocations(branchId);
  }

  async createLocation(payload: CreateLocationPayload): Promise<ExternalLocation> {
    return await this.service.createLocation(payload);
  }
}
