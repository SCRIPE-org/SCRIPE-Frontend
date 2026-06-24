import type { IHubActivityRepository } from "../../domain/interfaces/IHubActivityRepository";
import type { IHubActivityService } from "../../domain/interfaces/IHubActivityService";
import type { HubActivitySummary } from "../../domain/entities/HubActivity";
import { HubActivityMapper } from "../mappers/HubActivityMapper";

/**
 * Repository layer implementing client request queries for hub activity.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class HubActivityRepository implements IHubActivityRepository {
  constructor(private readonly service: IHubActivityService) {}

  async getHubSummary(): Promise<HubActivitySummary> {
    const dto = await this.service.getHubSummary();
    return HubActivityMapper.toSummaryEntity(dto);
  }
}
