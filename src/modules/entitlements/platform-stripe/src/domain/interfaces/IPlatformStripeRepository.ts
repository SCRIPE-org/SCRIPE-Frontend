/**
 * Platform Stripe Repository Interface
 *
 * Returns rich domain entities (not raw DTOs).
 * Consumed by viewmodels via DI container.
 */
import type { PlatformStripeDashboard } from "../entities/PlatformStripeDashboard";

export interface IPlatformStripeRepository {
  /** Fetch the complete platform Stripe dashboard as a domain entity */
  getDashboard(): Promise<PlatformStripeDashboard>;
}
