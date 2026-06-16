import type { IApiService } from "@core/interfaces/api.interface";
import { SYSTEM_ENDPOINTS } from "@core/config/api-endpoints/system.endpoints";
import type { IHubActivityService } from "../../domain/interfaces/IHubActivityService";
import type { HubActivitySummaryModel } from "../models/HubActivityModels";

export class HubActivityService implements IHubActivityService {
  constructor(private readonly api: IApiService) {}

  getHubSummary(): Promise<HubActivitySummaryModel> {
    return this.api.get<HubActivitySummaryModel>(SYSTEM_ENDPOINTS.AUDIT.HUB_SUMMARY);
  }
}
