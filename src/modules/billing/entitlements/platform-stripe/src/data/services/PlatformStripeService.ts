/**
 * Platform Stripe Dashboard Service — API calls only.
 * Implements IPlatformStripeService contract.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { PlatformStripeDashboardModel } from "../models/PlatformStripeModels";
import type { IPlatformStripeService } from "../../domain/interfaces/IPlatformStripeService";
import { PLATFORM_STRIPE_ENDPOINTS } from "./platform-stripe.endpoints";

/**
 * Http API network service for platform stripe.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class PlatformStripeService implements IPlatformStripeService {
  constructor(private readonly api: IApiService) {}

  async getDashboard(): Promise<PlatformStripeDashboardModel> {
    return this.api.get<PlatformStripeDashboardModel>(
      PLATFORM_STRIPE_ENDPOINTS.DASHBOARD
    );
  }
}
