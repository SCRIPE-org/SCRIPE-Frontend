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
export { useConnectViewModel } from "./src/presentation/viewmodels/useConnectViewModel";
export { useCommissionDashboardViewModel } from "./src/presentation/viewmodels/useCommissionDashboardViewModel";
