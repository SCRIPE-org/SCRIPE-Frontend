/**
 * Platform Stripe Dashboard Service — API calls only.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { PlatformStripeDashboardModel } from "../models/PlatformStripeModels";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

export class PlatformStripeService {
  constructor(private readonly api: IApiService) {}

  async getDashboard(): Promise<PlatformStripeDashboardModel> {
    return this.api.get<PlatformStripeDashboardModel>(
      API_ENDPOINTS.ENTITLEMENTS.PLATFORM_STRIPE.DASHBOARD
    );
  }
}
