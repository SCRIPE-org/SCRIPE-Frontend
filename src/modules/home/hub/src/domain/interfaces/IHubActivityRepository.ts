import type { HubActivitySummary } from "../entities/HubActivity";

export interface IHubActivityRepository {
  getHubSummary(): Promise<HubActivitySummary>;
}
