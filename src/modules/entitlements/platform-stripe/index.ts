/**
 * Platform Stripe Dashboard — Public API
 */

// ── View ──
export { PlatformStripeDashboardView } from "./src/presentation/views/PlatformStripeDashboardView";

// ── Domain Entities ──
export {
  PlatformStripeDashboard,
  PlatformAccount,
  PlatformBalance,
  PlatformTransaction,
  PlatformPayout,
  PlatformConnectSummary,
  PlatformStripeLinks,
  BalanceAmount,
} from "./src/domain/entities/PlatformStripeDashboard";

// ── Domain Interfaces ──
export type { IPlatformStripeService } from "./src/domain/interfaces/IPlatformStripeService";
export type { IPlatformStripeRepository } from "./src/domain/interfaces/IPlatformStripeRepository";
