import type { IApiService } from "@core/interfaces/api.interface";
import { SYSTEM_ENDPOINTS } from "@core/config/api-endpoints/system.endpoints";
import type { IHubActivityService } from "../../domain/interfaces/IHubActivityService";
import type { HubActivitySummaryModel } from "../models/HubActivityModels";

/**
 * Http API network service for hub activity.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class HubActivityService implements IHubActivityService {
  constructor(private readonly api: IApiService) {}

  getHubSummary(): Promise<HubActivitySummaryModel> {
    return this.api.get<HubActivitySummaryModel>(SYSTEM_ENDPOINTS.AUDIT.HUB_SUMMARY);
  }
}
