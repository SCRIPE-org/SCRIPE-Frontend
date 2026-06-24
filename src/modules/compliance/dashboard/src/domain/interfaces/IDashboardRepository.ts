import type { ComplianceDashboard } from "../entities/DashboardData";

/**
 * Interface defining repository methods for managing Dashboard data access.
 */
export interface IDashboardRepository {
  getDashboard(): Promise<ComplianceDashboard>;
}
