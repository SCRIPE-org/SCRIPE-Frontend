/**
 * Dashboard Repository Interface
 *
 * Defines the contract for dashboard-specific data operations.
 * Slimmed down: audit and security methods moved to their own repos.
 */
import type {
  DashboardSummary,
  LoginActivityPoint,
  RecentChange,
  EventTypeCount,
} from "../entities/DashboardEntities";

export interface IDashboardRepository {
  getSummary(): Promise<DashboardSummary>;
  getLoginActivity(days?: number): Promise<LoginActivityPoint[]>;
  getRecentChanges(limit?: number): Promise<RecentChange[]>;
  getEventDistribution(days?: number): Promise<EventTypeCount[]>;
}
