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

export class DashboardRepository implements IDashboardRepository {
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
