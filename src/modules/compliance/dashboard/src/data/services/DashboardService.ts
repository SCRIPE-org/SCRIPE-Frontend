/**
 * Dashboard Service — HTTP calls only, no business logic.
 * Implements IDashboardService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IDashboardService } from "../../domain/interfaces/IDashboardService";
import type { DashboardModel } from "../models/DashboardModels";

/**
 * Http API network service for dashboard.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export class DashboardService implements IDashboardService {
  constructor(private readonly api: IApiService) {}

  getDashboard(): Promise<DashboardModel> {
    return this.api.get<DashboardModel>(API_ENDPOINTS.COMPLIANCE.DASHBOARD);
  }
}
