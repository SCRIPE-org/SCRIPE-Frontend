import type { HubActivitySummary } from "../entities/HubActivity";

/**
 * Interface defining repository methods for managing HubActivity data access.
 */
export interface IHubActivityRepository {
  getHubSummary(): Promise<HubActivitySummary>;
}
