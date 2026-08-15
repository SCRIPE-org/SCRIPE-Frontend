/**
 * Stripe Connect Submodule — Public API
 */

// ── Domain ──────────────────────────────────────────────────────────────────
export {
  ConnectAccount,
  ConnectAccountListItem,
  Commission,
  CommissionDashboard,
} from "./src/domain/entities/ConnectAccount";
export type {
  ConnectAccountData,
  ConnectAccountListData,
  CommissionData,
  CommissionDashboardData,
  CommissionTrendPoint,
  TopTenantData,
} from "./src/domain/entities/ConnectAccount";
export type { IConnectRepository } from "./src/domain/interfaces/IConnectRepository";
export type { IConnectService } from "./src/domain/interfaces/IConnectService";

// ── Presentation ─────────────────────────────────────────────────────────────
export { ConnectOnboardingView } from "./src/presentation/views/ConnectOnboardingView";
export { CommissionDashboardView } from "./src/presentation/views/CommissionDashboardView";
export { TenantStripeConnectView } from "./src/presentation/views/TenantStripeConnectView";
export { PayoutsView } from "./src/presentation/views/PayoutsView";
export { useConnectViewModel } from "./src/presentation/viewmodels/useConnectViewModel";
export { useCommissionDashboardViewModel } from "./src/presentation/viewmodels/useCommissionDashboardViewModel";
export { useTenantConnectViewModel } from "./src/presentation/viewmodels/useTenantConnectViewModel";
export { usePayoutsViewModel } from "./src/presentation/viewmodels/usePayoutsViewModel";
