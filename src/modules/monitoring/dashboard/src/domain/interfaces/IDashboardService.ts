import type {
  DashboardSummary,
  LoginActivityPoint,
  RecentChange,
  EventTypeCount,
} from "../entities/DashboardEntities";

/**
 * Interface defining operations for the Dashboard network service.
 */
export interface IDashboardService {
  getSummary(): Promise<DashboardSummary>;
  getLoginActivity(days?: number): Promise<LoginActivityPoint[]>;
  getRecentChanges(limit?: number): Promise<RecentChange[]>;
  getEventDistribution(days?: number): Promise<EventTypeCount[]>;
}
