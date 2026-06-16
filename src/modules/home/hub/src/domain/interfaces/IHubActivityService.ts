import type { HubActivitySummaryModel } from "../../data/models/HubActivityModels";

export interface IHubActivityService {
  getHubSummary(): Promise<HubActivitySummaryModel>;
}
