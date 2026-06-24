/**
 * Dashboard Service — HTTP calls only, no business logic.
 * Implements IDashboardService, uses IApiService.
 */
import type { IApiService } from "@core/interfaces/api.interface";
import { API_ENDPOINTS } from "@core/config/api-endpoints";
import type { IDashboardService } from "../../domain/interfaces/IDashboardService";
import type { DashboardModel } from "../models/DashboardModels";

/**
 * API service for executing HTTP calls related to Dashboard endpoints.
 */
export class DashboardService implements IDashboardService {
  constructor(private readonly api: IApiService) {}

  getDashboard(): Promise<DashboardModel> {
    return this.api.get<DashboardModel>(API_ENDPOINTS.COMPLIANCE.DASHBOARD);
  }
}
