import type { DashboardModel } from "../../data/models/DashboardModels";

export interface IDashboardService {
  getDashboard(): Promise<DashboardModel>;
}
