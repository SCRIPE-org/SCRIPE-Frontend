import type { HubActivitySummaryModel } from "../../data/models/HubActivityModels";

/**
 * Http API network service for i hub activity.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IHubActivityService {
  getHubSummary(): Promise<HubActivitySummaryModel>;
}
