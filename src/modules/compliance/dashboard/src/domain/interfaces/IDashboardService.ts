import type { DashboardModel } from "../../data/models/DashboardModels";

/**
 * Interface defining operations for the Dashboard network service.
 */
export interface IDashboardService {
  getDashboard(): Promise<DashboardModel>;
}
