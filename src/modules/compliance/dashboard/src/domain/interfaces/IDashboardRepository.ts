import type { ComplianceDashboard } from "../entities/DashboardData";

export interface IDashboardRepository {
  getDashboard(): Promise<ComplianceDashboard>;
}
