import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS, buildUrl } from "@core/config/api-endpoints";
import type { IBillingService } from "../../domain/interfaces/IBillingService";

export class BillingService implements IBillingService {
  constructor(private readonly api: IApiService) {}

  async getAll(params?: Record<string, unknown>): Promise<unknown> {
    const url = buildUrl(API_ENDPOINTS.BILLING.CONFIG, params as Record<string, string>);
    return this.api.get(url);
  }
}
