/**
 * Dashboard Service — HTTP calls only, no business logic.
 * Implements IDashboardService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import type { IDashboardService } from "../../domain/interfaces/IDashboardService";
import type { DashboardModel } from "../models/DashboardModels";
import { DASHBOARD_ENDPOINTS } from "./dashboard.endpoints";

/**
 * Http API network service for dashboard.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class DashboardService implements IDashboardService {
  constructor(private readonly api: IApiService) {}

  getDashboard(): Promise<DashboardModel> {
    return this.api.get<DashboardModel>(DASHBOARD_ENDPOINTS.DASHBOARD);
  }
}
