import type { HubActivitySummary } from "../entities/HubActivity";

/**
 * Repository layer implementing client request queries for i hub activity.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IHubActivityRepository {
  getHubSummary(): Promise<HubActivitySummary>;
}
