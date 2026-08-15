/**
 * Compliance Module Public API
 *
 * Re-exports all sub-module public APIs for external consumption.
 * Internal implementation details are NOT exported.
 */

// ── Sub-module views ────────────────────────────────────────────────────────
export { ComplianceDashboardView } from "./dashboard";
export { DsrView } from "./dsr";
export { ConsentView } from "./consent";
export { RetentionView } from "./retention";
export { InventoryView } from "./inventory";
export { ReportsView } from "./reports";

// ── DI Container ────────────────────────────────────────────────────────────
export { complianceContainer, getComplianceContainer } from "./di";
export type { ComplianceContainer } from "./di";
