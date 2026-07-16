import type { ComplianceDashboard } from "../entities/DashboardData";

/**
 * Repository layer implementing client request queries for i dashboard.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export interface IDashboardRepository {
  getDashboard(): Promise<ComplianceDashboard>;
}
