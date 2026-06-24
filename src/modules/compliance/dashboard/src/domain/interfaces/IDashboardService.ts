import type { DashboardModel } from "../../data/models/DashboardModels";

/**
 * Http API network service for i dashboard.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IDashboardService {
  getDashboard(): Promise<DashboardModel>;
}
