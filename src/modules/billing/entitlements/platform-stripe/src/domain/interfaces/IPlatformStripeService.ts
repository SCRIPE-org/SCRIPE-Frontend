/**
 * Platform Stripe Service Interface (API contract)
 *
 * Defines the HTTP operations — returns raw DTO models.
 * Implemented by PlatformStripeService in the data layer.
 */
import type { PlatformStripeDashboardModel } from "../../data/models/PlatformStripeModels";

export interface IPlatformStripeService {
  /** Fetch the complete platform Stripe dashboard data */
  getDashboard(): Promise<PlatformStripeDashboardModel>;
}
