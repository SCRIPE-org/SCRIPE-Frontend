import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IBillingService } from "../../domain/interfaces/IBillingService";

export class BillingService implements IBillingService {
  constructor(private readonly api: IApiService) {}

  async getConfig(tenantId: string): Promise<unknown> {
    return this.api.get(API_ENDPOINTS.BILLING.CONFIG(tenantId));
  }

  async getRevenue(from?: string, to?: string): Promise<unknown> {
    const params: Record<string, string> = {};
    if (from) params.from = from;
    if (to) params.to = to;
    const qs = new URLSearchParams(params).toString();
    const url = qs ? `${API_ENDPOINTS.BILLING.REVENUE}?${qs}` : API_ENDPOINTS.BILLING.REVENUE;
    return this.api.get(url);
  }

  async getFeatures(moduleName?: string): Promise<unknown> {
    const url = moduleName
      ? `${API_ENDPOINTS.BILLING.FEATURES}?moduleName=${moduleName}`
      : API_ENDPOINTS.BILLING.FEATURES;
    return this.api.get(url);
  }

  async updateMode(tenantId: string, paymentMode: string): Promise<unknown> {
    return this.api.put(API_ENDPOINTS.BILLING.UPDATE_MODE(tenantId), { paymentMode });
  }

  async startOnboarding(tenantId: string, data: Record<string, string>): Promise<unknown> {
    return this.api.post(API_ENDPOINTS.BILLING.CONNECT_ONBOARD(tenantId), data);
  }
}
