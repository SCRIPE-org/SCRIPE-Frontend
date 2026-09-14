/**
 * Dashboard Repository
 *
 * Concrete implementation of IDashboardRepository.
 * Slimmed down: only dashboard overview concerns.
 */
import type { IDashboardRepository } from "../../domain/interfaces/IDashboardRepository";
import type {
  DashboardSummary,
  LoginActivityPoint,
  RecentChange,
  EventTypeCount,
} from "../../domain/entities/DashboardEntities";
import type { DashboardService } from "../services/DashboardService";
import { DASHBOARD_ENDPOINTS } from "../services/dashboard.endpoints";

/**
 * Repository layer implementing client request queries for dashboard.
 * Calls base API service routines and resolves DTO objects mapping to domain entities.
 */
export class DashboardRepository implements IDashboardRepository {
  readonly exportEndpoint = DASHBOARD_ENDPOINTS.EXPORT_OVERVIEW;

  constructor(private readonly service: DashboardService) {}

  getSummary(): Promise<DashboardSummary> {
    return this.service.getSummary();
  }

  getLoginActivity(days?: number): Promise<LoginActivityPoint[]> {
    return this.service.getLoginActivity(days);
  }

  getRecentChanges(limit?: number): Promise<RecentChange[]> {
    return this.service.getRecentChanges(limit);
  }

  getEventDistribution(days?: number): Promise<EventTypeCount[]> {
    return this.service.getEventDistribution(days);
  }
}
