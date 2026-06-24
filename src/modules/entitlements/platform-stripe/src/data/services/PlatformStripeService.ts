/**
 * Platform Stripe Dashboard Service — API calls only.
 * Implements IPlatformStripeService contract.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { PlatformStripeDashboardModel } from "../models/PlatformStripeModels";
import type { IPlatformStripeService } from "../../domain/interfaces/IPlatformStripeService";
import { API_ENDPOINTS } from "@core/config/api-endpoints";

/**
 * API service for executing HTTP calls related to PlatformStripe endpoints.
 */
export class PlatformStripeService implements IPlatformStripeService {
  constructor(private readonly api: IApiService) {}

  async getDashboard(): Promise<PlatformStripeDashboardModel> {
    return this.api.get<PlatformStripeDashboardModel>(
      API_ENDPOINTS.ENTITLEMENTS.PLATFORM_STRIPE.DASHBOARD
    );
  }
}
