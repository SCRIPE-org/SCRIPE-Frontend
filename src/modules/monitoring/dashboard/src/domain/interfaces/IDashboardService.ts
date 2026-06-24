import type {
  DashboardSummary,
  LoginActivityPoint,
  RecentChange,
  EventTypeCount,
} from "../entities/DashboardEntities";

/**
 * Http API network service for i dashboard.
 * Maps request properties to core endpoint paths and delegates HTTP client fetching calls.
 */
export interface IDashboardService {
  getSummary(): Promise<DashboardSummary>;
  getLoginActivity(days?: number): Promise<LoginActivityPoint[]>;
  getRecentChanges(limit?: number): Promise<RecentChange[]>;
  getEventDistribution(days?: number): Promise<EventTypeCount[]>;
}
