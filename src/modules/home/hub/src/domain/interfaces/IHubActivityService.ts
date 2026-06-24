import type { HubActivitySummaryModel } from "../../data/models/HubActivityModels";

/**
 * Interface defining operations for the HubActivity network service.
 */
export interface IHubActivityService {
  getHubSummary(): Promise<HubActivitySummaryModel>;
}
